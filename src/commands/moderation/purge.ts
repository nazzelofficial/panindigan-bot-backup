import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';
import config from '../../../config.json';

export class PurgeCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'purge',
      description: 'Delete a specified number of messages',
      category: 'moderation',
      cooldown: 3,
      userPermissions: [PermissionFlagsBits.ManageMessages],
      botPermissions: [PermissionFlagsBits.ManageMessages],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['clear', 'clean', 'prune'],
      examples: ['/purge 50', 'p!purge 100'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const amount = interaction.options.getInteger('amount') || 10;

    if (amount < 1) {
      await interaction.reply({ content: '❌ Please provide a valid amount (1-1000).', ephemeral: true });
      return;
    }

    if (amount > config.moderation.maxPurgeAmount) {
      await interaction.reply({ content: `❌ Cannot delete more than ${config.moderation.maxPurgeAmount} messages at once.`, ephemeral: true });
      return;
    }

    if (!interaction.channel || !interaction.channel.isTextBased()) return;

    try {
      await interaction.deferReply();

      const messages = await interaction.channel.bulkDelete(amount, true);
      const deletedCount = messages.size;

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.success} Messages Purged`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Deleted', value: `${deletedCount} message(s)`, inline: true },
          { name: 'Moderator', value: interaction.user.tag, inline: true },
        ])
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      await interaction.editReply({ content: '❌ Failed to purge messages. Messages may be too old.' });
    }
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const amount = parseInt(args[0]) || 10;

    if (amount < 1) {
      await message.reply('❌ Please provide a valid amount (1-1000).');
      return;
    }

    if (amount > config.moderation.maxPurgeAmount) {
      await message.reply(`❌ Cannot delete more than ${config.moderation.maxPurgeAmount} messages at once.`);
      return;
    }

    if (!message.channel || !message.channel.isTextBased()) return;

    try {
      const messages = await message.channel.bulkDelete(amount, true);
      const deletedCount = messages.size;

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.success} Messages Purged`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Deleted', value: `${deletedCount} message(s)`, inline: true },
          { name: 'Moderator', value: message.author.tag, inline: true },
        ])
        .setTimestamp();

      await message.channel.send({ embeds: [embed] });
    } catch (error) {
      await message.reply('❌ Failed to purge messages. Messages may be too old.');
    }
  }
}

export default PurgeCommand;
