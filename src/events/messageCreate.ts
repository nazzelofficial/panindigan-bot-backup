import { Event } from '../structures/BaseCommand';
import { Message } from 'discord.js';
import { PanindiganClient } from '../structures/PanindiganClient';
import { checkCooldown } from '../handlers/CooldownHandler';
import { getUserPremiumTier } from '../handlers/PremiumHandler';
import { Permissions } from '../utils/Permissions';
import { loggers, logCommandExecution } from '../utils/Logger';
import config from '../../config.json';

export const event: Event = {
  name: 'messageCreate',
  once: false,
  async execute(message: Message, client: PanindiganClient) {
    if (!config.loader.enablePrefixCommands) return;
    if (message.author.bot) return;
    if (!message.content.startsWith(config.bot.prefix)) return;

    const args = message.content.slice(config.bot.prefix.length).trim().split(/ +/);
    const commandName = args.shift()?.toLowerCase();

    if (!commandName) return;

    const command = client.commands.get(commandName);
    if (!command) return;
    if (!command.prefixCommand) return;

    const startTime = Date.now();

    try {
      if (config.runtime.maintenance.enabled && !client.isOwner(message.author.id)) {
        await message.reply(config.runtime.maintenance.message);
        return;
      }

      if (command.ownerOnly && !client.isOwner(message.author.id)) {
        await message.reply('❌ This command is only available to the bot owner.');
        return;
      }

      if (command.guildOnly && !message.guild) {
        await message.reply('❌ This command can only be used in a server.');
        return;
      }

      if (message.guild && message.member) {
        if (!Permissions.hasPermission(message.member, command.userPermissions)) {
          await message.reply('❌ You do not have permission to use this command.');
          return;
        }

        const botPerms = Permissions.hasBotPermission(message.member, command.botPermissions);
        if (!botPerms.hasPermission) {
          await message.reply(
            `❌ I am missing the following permissions: ${Permissions.getMissingPermissionNames(botPerms.missing).join(', ')}`,
          );
          return;
        }
      }

      const premiumTier = message.guild
        ? await getUserPremiumTier(message.author.id, message.guild.id)
        : 'free';

      if (command.premiumTier !== 'free' && command.premiumTier !== premiumTier) {
        await message.reply(`❌ This command requires ${command.premiumTier.toUpperCase()} premium or higher.`);
        return;
      }

      const cooldownCheck = await checkCooldown(
        client,
        message.author.id,
        message.guild?.id || 'dm',
        command.name,
        premiumTier,
      );

      if (!cooldownCheck.canRun) {
        await message.reply(`⏳ Please wait ${cooldownCheck.remaining} seconds before using this command again.`);
        return;
      }

      await command.executePrefix(message, args);
      const executionTime = Date.now() - startTime;

      logCommandExecution(
        client.shardId,
        message.guild?.id || 'dm',
        message.author.id,
        command.name,
        args,
        executionTime,
        true,
      );
    } catch (error) {
      const executionTime = Date.now() - startTime;

      loggers.commands.error('Error executing prefix command', {
        command: command.name,
        guildId: message.guild?.id || 'dm',
        userId: message.author.id,
        shardId: client.shardId,
        executionTimeMs: executionTime,
        errorMessage: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });

      logCommandExecution(
        client.shardId,
        message.guild?.id || 'dm',
        message.author.id,
        command.name,
        args,
        executionTime,
        false,
      );

      await message.reply('❌ An error occurred while executing this command.');
    }
  },
};
