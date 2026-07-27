// @ts-nocheck
import { Event } from '../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Interaction } from 'discord.js';
import { PanindiganClient } from '../structures/PanindiganClient.js';
import { checkCooldown } from '../handlers/CooldownHandler.js';
import { getUserPremiumTier } from '../handlers/PremiumHandler.js';
import { Permissions } from '../utils/Permissions.js';
import { loggers, logCommandExecution } from '../utils/Logger.js';
import config from '../../config.json' with { type: 'json' };

export const event: Event = {
  name: 'interactionCreate',
  once: false,
  async execute(interaction: Interaction, client: PanindiganClient) {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    const startTime = Date.now();

    try {
      if (config.runtime.maintenance.enabled && !client.isOwner(interaction.user.id)) {
        await interaction.reply({ content: config.runtime.maintenance.message, ephemeral: true });
        return;
      }

      if (command.ownerOnly && !client.isOwner(interaction.user.id)) {
        await interaction.reply({
          content: '❌ This command is only available to the bot owner.',
          ephemeral: true,
        });
        return;
      }

      if (command.guildOnly && !interaction.guild) {
        await interaction.reply({
          content: '❌ This command can only be used in a server.',
          ephemeral: true,
        });
        return;
      }

      if (interaction.guild) {
        const member = interaction.member;
        if (!Permissions.hasPermission(member, command.userPermissions)) {
          await interaction.reply({
            content: '❌ You do not have permission to use this command.',
            ephemeral: true,
          });
          return;
        }

        const botPerms = Permissions.hasBotPermission(member, command.botPermissions);
        if (!botPerms.hasPermission) {
          await interaction.reply({
            content: `❌ I am missing the following permissions: ${Permissions.getMissingPermissionNames(botPerms.missing).join(', ')}`,
            ephemeral: true,
          });
          return;
        }
      }

      const premiumTier = interaction.guild
        ? await getUserPremiumTier(interaction.user.id, interaction.guild.id)
        : 'free';

      if (command.premiumTier !== 'free' && command.premiumTier !== premiumTier) {
        await interaction.reply({
          content: `❌ This command requires ${command.premiumTier.toUpperCase()} premium or higher.`,
          ephemeral: true,
        });
        return;
      }

      const cooldownCheck = await checkCooldown(
        client,
        interaction.user.id,
        interaction.guild?.id || 'dm',
        command.name,
        premiumTier,
      );

      if (!cooldownCheck.canRun) {
        await interaction.reply({
          content: `⏳ Please wait ${cooldownCheck.remaining} seconds before using this command again.`,
          ephemeral: true,
        });
        return;
      }

      await command.executeSlash(interaction as ChatInputCommandInteraction);
      const executionTime = Date.now() - startTime;

      logCommandExecution(
        client.shardId,
        interaction.guild?.id || 'dm',
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
        guildId: interaction.guild?.id || 'dm',
        userId: interaction.user.id,
        shardId: client.shardId,
        executionTimeMs: executionTime,
        errorMessage: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });

      logCommandExecution(
        client.shardId,
        interaction.guild?.id || 'dm',
        interaction.user.id,
        command.name,
        [],
        executionTime,
        false,
      );

      const errorMessage = '❌ An error occurred while executing this command.';
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: errorMessage, ephemeral: true });
      } else {
        await interaction.reply({ content: errorMessage, ephemeral: true });
      }
    }
  },
};
