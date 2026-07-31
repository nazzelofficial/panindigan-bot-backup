import { checkCooldown } from '../handlers/CooldownHandler.js';
import { getUserPremiumTier } from '../handlers/PremiumHandler.js';
import { getGuildPrefix } from '../database/postgresql/models/Guild.js';
import { Permissions } from '../utils/Permissions.js';
import { loggers, logCommandExecution } from '../utils/Logger.js';
import { ErrorHandler } from '../handlers/ErrorHandler.js';
import { EmbedManager } from '../structures/EmbedManager.js';
import config from '../../config.json' with { type: 'json' };
export const event = {
    name: 'messageCreate',
    once: false,
    async execute(message, client) {
        if (!config.loader.enablePrefixCommands)
            return;
        if (message.author.bot)
            return;
        let prefix;
        try {
            prefix = message.guild
                ? await getGuildPrefix(message.guild.id)
                : (process.env.BOT_PREFIX ?? config.bot.prefix);
        }
        catch {
            prefix = process.env.BOT_PREFIX ?? config.bot.prefix;
        }
        if (!message.content.startsWith(prefix))
            return;
        const _args = message.content.slice(prefix.length).trim().split(/ +/);
        const commandName = _args.shift()?.toLowerCase();
        if (!commandName)
            return;
        const command = client.commands.get(commandName);
        if (!command)
            return;
        if (!command.prefixCommand)
            return;
        const startTime = Date.now();
        try {
            // ── Maintenance mode ──────────────────────────────────────────────────
            if (config.runtime.maintenance.enabled && !client.isOwner(message.author.id)) {
                await message.reply({
                    embeds: [EmbedManager.warning('Maintenance Mode', config.runtime.maintenance.message ?? 'The bot is currently under maintenance. Please try again later.')],
                });
                return;
            }
            // ── Owner-only ────────────────────────────────────────────────────────
            if (command.ownerOnly && !client.isOwner(message.author.id)) {
                await ErrorHandler.send(message, {
                    title: 'Owner Only',
                    description: 'This command is restricted to the bot owner.',
                    whatHappened: 'You attempted to run a command that is only available to the bot owner.',
                    why: 'Certain commands are restricted to protect the bot\'s core functionality.',
                    howToFix: 'You cannot use this command. If you believe this is an error, contact the bot owner.',
                });
                return;
            }
            // ── Guild-only ────────────────────────────────────────────────────────
            if (command.guildOnly && !message.guild) {
                await ErrorHandler.send(message, {
                    title: 'Server Only',
                    description: 'This command can only be used inside a server.',
                    whatHappened: 'You ran a server-only command in a DM or group channel.',
                    why: 'This command requires a server context to access guild data.',
                    howToFix: 'Run this command in a Discord server where the bot is present.',
                });
                return;
            }
            // ── Permissions ───────────────────────────────────────────────────────
            if (message.guild && message.member) {
                if (!Permissions.hasPermission(message.member, command.userPermissions)) {
                    await ErrorHandler.permission(message, command.userPermissions ?? []);
                    return;
                }
                const botPerms = Permissions.hasBotPermission(message.member, command.botPermissions);
                if (!botPerms.hasPermission) {
                    await ErrorHandler.botPermission(message, Permissions.getMissingPermissionNames(botPerms.missing));
                    return;
                }
            }
            // ── Premium tier ──────────────────────────────────────────────────────
            const premiumTier = message.guild
                ? await getUserPremiumTier(message.author.id, message.guild.id)
                : 'free';
            if (command.premiumTier !== 'free' && command.premiumTier !== premiumTier) {
                const tierEmojis = { bronze: '🥉', silver: '⭐', gold: '💎', diamond: '👑' };
                const icon = tierEmojis[command.premiumTier] ?? '💎';
                await ErrorHandler.send(message, {
                    title: `${icon} Premium Required`,
                    description: `This command requires **${command.premiumTier.toUpperCase()}** premium tier or higher.`,
                    whatHappened: `\`${prefix}${command.name}\` is locked behind the **${command.premiumTier}** tier.`,
                    why: 'Some commands are exclusive to premium members to support the bot\'s development.',
                    howToFix: 'Upgrade your premium tier to unlock this command.',
                    suggestedActions: [
                        `Use \`${prefix}premium\` to view available tiers`,
                        `Required tier: **${command.premiumTier.toUpperCase()}** ${icon}`,
                    ],
                });
                return;
            }
            // ── Cooldown ──────────────────────────────────────────────────────────
            const cooldownCheck = await checkCooldown(client, message.author.id, message.guild?.id ?? 'dm', command.name, premiumTier);
            if (!cooldownCheck.canRun) {
                await ErrorHandler.cooldown(message, cooldownCheck.remaining);
                return;
            }
            // ── Execute ───────────────────────────────────────────────────────────
            await command.executePrefix(message, _args);
            const executionTime = Date.now() - startTime;
            logCommandExecution(client.shardId, message.guild?.id ?? 'dm', message.author.id, command.name, _args, executionTime, true);
        }
        catch (error) {
            const executionTime = Date.now() - startTime;
            loggers.commands.error('Error executing prefix command', {
                command: command.name,
                guild: message.guild?.id ?? 'dm',
                user: message.author.id,
                shardId: client.shardId,
                durationMs: executionTime,
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined,
            });
            logCommandExecution(client.shardId, message.guild?.id ?? 'dm', message.author.id, command.name, _args, executionTime, false);
            const errorEmbed = EmbedManager.error('Command Error', 'An unexpected error occurred while running this command.');
            errorEmbed.addFields({ name: '📋 Command', value: `\`${prefix}${command.name}\``, inline: true }, { name: '🔧 Details', value: error instanceof Error ? `\`${error.message.slice(0, 200)}\`` : 'Unknown error', inline: false }, { name: '💡 What to do', value: 'Try the command again. If the problem persists, join our [support server](https://discord.gg/panindigan).', inline: false });
            try {
                await message.reply({ embeds: [errorEmbed] });
            }
            catch {
                // Cannot reply — message may have been deleted
            }
        }
    },
};
//# sourceMappingURL=messageCreate.js.map