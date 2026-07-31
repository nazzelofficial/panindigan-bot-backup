// @ts-nocheck
import { Event } from '../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Interaction } from 'discord.js';
import { PanindiganClient } from '../structures/PanindiganClient.js';
import { checkCooldown } from '../handlers/CooldownHandler.js';
import { getUserPremiumTier, hasPremiumAccess } from '../handlers/PremiumHandler.js';
import { Permissions } from '../utils/Permissions.js';
import { handleComponent } from '../handlers/ComponentHandler.js';
import { loggers, logCommandExecution } from '../utils/Logger.js';
import { ErrorHandler } from '../handlers/ErrorHandler.js';
import { EmbedManager } from '../structures/EmbedManager.js';
import config from '../../config.json' with { type: 'json' };

export const event: Event = {
  name: 'interactionCreate',
  once: false,
  async execute(interaction: Interaction, client: PanindiganClient) {
    // ── Route component interactions ─────────────────────────────────────────
    if (interaction.isButton() || interaction.isStringSelectMenu() || interaction.isModalSubmit()) {
      await handleComponent(interaction, client);
      return;
    }

    // ── Context menu interactions ─────────────────────────────────────────────
    if (interaction.isContextMenuCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;
      try {
        await command.executeContext(interaction);
      } catch (error) {
        loggers.commands.error('Error executing context menu command', {
          command: interaction.commandName,
          user: interaction.user.id,
          error: error instanceof Error ? error.message : String(error),
        });
        try {
          const msg = { content: '❌ An error occurred while running this command.', ephemeral: true };
          if (interaction.replied || interaction.deferred) await interaction.followUp(msg);
          else await interaction.reply(msg);
        } catch { /* expired */ }
      }
      return;
    }

    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    const startTime = Date.now();

    try {
      // ── Maintenance mode ──────────────────────────────────────────────────
      if (config.runtime.maintenance.enabled && !client.isOwner(interaction.user.id)) {
        await interaction.reply({
          embeds: [EmbedManager.warning(
            'Maintenance Mode',
            config.runtime.maintenance.message ?? 'The bot is currently under maintenance. Please try again later.',
          )],
          ephemeral: true,
        });
        return;
      }

      // ── Owner-only ────────────────────────────────────────────────────────
      if (command.ownerOnly && !client.isOwner(interaction.user.id)) {
        await ErrorHandler.send(interaction, {
          title: 'Owner Only',
          description: 'This command is restricted to the bot owner.',
          whatHappened: 'You attempted to run a command that is only available to the bot owner.',
          why: 'Certain commands are restricted to protect the bot\'s core functionality.',
          howToFix: 'You cannot use this command. If you believe this is an error, contact the bot owner.',
          ephemeral: true,
        });
        return;
      }

      // ── Guild-only ────────────────────────────────────────────────────────
      if (command.guildOnly && !interaction.guild) {
        await ErrorHandler.send(interaction, {
          title: 'Server Only',
          description: 'This command can only be used inside a server.',
          whatHappened: 'You ran a server-only command in a DM or group channel.',
          why: 'This command requires a server context to access guild data.',
          howToFix: 'Run this command in a Discord server where the bot is present.',
          ephemeral: true,
        });
        return;
      }

      // ── User permissions ──────────────────────────────────────────────────
      if (interaction.guild) {
        const member = interaction.member;
        if (!Permissions.hasPermission(member, command.userPermissions)) {
          await ErrorHandler.permission(interaction, command.userPermissions ?? []);
          return;
        }

        const botPerms = Permissions.hasBotPermission(member, command.botPermissions);
        if (!botPerms.hasPermission) {
          await ErrorHandler.botPermission(interaction, Permissions.getMissingPermissionNames(botPerms.missing));
          return;
        }
      }

      // ── Premium tier ──────────────────────────────────────────────────────
      const premiumTier = interaction.guild
        ? await getUserPremiumTier(interaction.user.id, interaction.guild.id)
        : 'free';

      const hasAccess = command.premiumTier === 'free' || await hasPremiumAccess(
        interaction.user.id,
        interaction.guild?.id ?? 'global',
        command.premiumTier,
      );
      if (!hasAccess) {
        const tierEmojis: Record<string, string> = { bronze: '🥉', silver: '⭐', gold: '💎', diamond: '👑' };
        const icon = tierEmojis[command.premiumTier] ?? '💎';
        await ErrorHandler.send(interaction, {
          title: `${icon} Premium Required`,
          description: `This command requires **${command.premiumTier.toUpperCase()}** premium tier or higher.`,
          whatHappened: `\`/${command.name}\` is locked behind the **${command.premiumTier}** tier.`,
          why: 'Some commands are exclusive to premium members to support the bot\'s development.',
          howToFix: 'Upgrade your premium tier to unlock this command.',
          suggestedActions: [
            'Use `/premium` to view available tiers and pricing',
            `Required tier: **${command.premiumTier.toUpperCase()}** ${icon}`,
            'Your current tier will be shown in `/premium status`',
          ],
          ephemeral: true,
        });
        return;
      }

      // ── Cooldown ──────────────────────────────────────────────────────────
      const cooldownCheck = await checkCooldown(
        client,
        interaction.user.id,
        interaction.guild?.id ?? 'dm',
        command.name,
        premiumTier,
      );

      if (!cooldownCheck.canRun) {
        await ErrorHandler.cooldown(interaction, cooldownCheck.remaining);
        return;
      }

      // ── Execute ───────────────────────────────────────────────────────────
      await command.executeSlash(interaction as ChatInputCommandInteraction);
      const executionTime = Date.now() - startTime;

      logCommandExecution(
        client.shardId,
        interaction.guild?.id ?? 'dm',
        interaction.user.id,
        command.name,
        [],
        executionTime,
        true,
      );
    } catch (error) {
      const executionTime = Date.now() - startTime;

      loggers.commands.error('Error executing slash command', {
        command: command.name,
        guild: interaction.guild?.id ?? 'dm',
        user: interaction.user.id,
        shardId: client.shardId,
        durationMs: executionTime,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });

      logCommandExecution(
        client.shardId,
        interaction.guild?.id ?? 'dm',
        interaction.user.id,
        command.name,
        [],
        executionTime,
        false,
      );

      const errorEmbed = EmbedManager.error(
        'Command Error',
        'An unexpected error occurred while running this command.',
      );
      errorEmbed.addFields(
        { name: '📋 Command', value: `\`/${command.name}\``, inline: true },
        { name: '🔧 Details', value: error instanceof Error ? `\`${error.message.slice(0, 200)}\`` : 'Unknown error', inline: false },
        { name: '💡 What to do', value: 'Try the command again. If the problem persists, join our [support server](https://discord.gg/panindigan).', inline: false },
      );

      try {
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
        } else {
          await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
      } catch {
        // Cannot send — interaction may have expired
      }
    }
  },
};
