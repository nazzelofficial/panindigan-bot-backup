// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits, Collection } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import config from '../../../config.json' with { type: 'json' };

export class PurgeUserCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'purgeuser',
      description: 'Delete all messages from a user in the channel',
      category: 'moderation',
      cooldown: 10,
      userPermissions: [PermissionFlagsBits.ManageMessages],
      botPermissions: [PermissionFlagsBits.ManageMessages],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['cleanuser', 'pruneuser'],
      examples: ['/purgeuser @user', 'p!purgeuser @user'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const target = interaction.options.getUser('target');
    const days = interaction.options.getInteger('days') || 7;

    if (!target) {
      await interaction.reply({ content: '❌ Please provide a user.', ephemeral: true });
      return;
    }

    if (days < 1 || days > 14) {
      await interaction.reply({ content: '❌ Days must be between 1 and 14.', ephemeral: true });
      return;
    }

    if (!interaction.channel || !interaction.channel.isTextBased()) return;

    try {
      await interaction.deferReply();

      let deletedCount = 0;
      let lastId: string | null = null;
      const maxDays = days * 24 * 60 * 60 * 1000;
      const cutoffDate = new Date(Date.now() - maxDays);

      while (true) {
        const options: any = { limit: 100 };
        if (lastId) {
          options.before = lastId;
        }

        const messages = await interaction.channel.messages.fetch(options);
        if (messages.size === 0) break;

        const userMessages = messages.filter(m => m.author.id === target.id && m.createdAt > cutoffDate);
        if (userMessages.size === 0) {
          lastId = messages.last()?.id || null;
          continue;
        }

        await interaction.channel.bulkDelete(userMessages);
        deletedCount += userMessages.size;
        lastId = messages.last()?.id || null;

        if (messages.size < 100) break;
      }

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.success} Messages Purged`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'User', value: `${target.tag} (${target.id})`, inline: true },
          { name: 'Deleted', value: deletedCount.toString(), inline: true },
          { name: 'Time Range', value: `Last ${days} day(s)`, inline: true },
          { name: 'Moderator', value: interaction.user.tag, inline: false },
        ])
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      await interaction.editReply({ content: '❌ Failed to purge user messages.' });
    }
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const target = message.mentions.users.first();
    const days = parseInt(args[1]) || 7;

    if (!target) {
      await message.reply('❌ Please mention a user.');
      return;
    }

    if (days < 1 || days > 14) {
      await message.reply('❌ Days must be between 1 and 14.');
      return;
    }

    if (!message.channel || !message.channel.isTextBased()) return;

    try {
      await message.reply('Purging user messages...');

      let deletedCount = 0;
      let lastId: string | null = null;
      const maxDays = days * 24 * 60 * 60 * 1000;
      const cutoffDate = new Date(Date.now() - maxDays);

      while (true) {
        const options: any = { limit: 100 };
        if (lastId) {
          options.before = lastId;
        }

        const messages = await message.channel.messages.fetch(options);
        if (messages.size === 0) break;

        const userMessages = messages.filter(m => m.author.id === target.id && m.createdAt > cutoffDate);
        if (userMessages.size === 0) {
          lastId = messages.last()?.id || null;
          continue;
        }

        await message.channel.bulkDelete(userMessages);
        deletedCount += userMessages.size;
        lastId = messages.last()?.id || null;

        if (messages.size < 100) break;
      }

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.success} Messages Purged`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'User', value: `${target.tag} (${target.id})`, inline: true },
          { name: 'Deleted', value: deletedCount.toString(), inline: true },
          { name: 'Time Range', value: `Last ${days} day(s)`, inline: true },
          { name: 'Moderator', value: message.author.tag, inline: false },
        ])
        .setTimestamp();

      await message.channel.send({ embeds: [embed] });
    } catch (error) {
      await message.reply('❌ Failed to purge user messages.');
    }
  }
}

export default PurgeUserCommand;
