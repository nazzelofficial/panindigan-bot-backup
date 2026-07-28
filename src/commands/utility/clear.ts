// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { Formatter } from '../../utils/Formatter.js';

export class ClearCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'purge',
      description: 'Delete a specified number of messages',
      category: 'utility',
      cooldown: 5,
      userPermissions: [PermissionFlagsBits.ManageMessages],
      botPermissions: [PermissionFlagsBits.ManageMessages],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['purge', 'clean'],
      examples: ['/clear 10', 'p!clear 50'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const amount = interaction.options.getInteger('amount') || 10;
    
    if (amount < 1 || amount > 100) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please provide a number between 1 and 100.')
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed] });
      return;
    }

    await interaction.deferReply();

    try {
      const channel = interaction.channel;
      const messages = await channel?.messages.fetch({ limit: amount + 1 });
      const filtered = messages?.filter(m => m.createdTimestamp < Date.now() && m.createdTimestamp > Date.now() - 1209600000);
      
      if (!filtered || filtered.size === 0) {
        const errorEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.error} Error`)
          .setColor(COLORS.error)
          .setDescription('No messages found to delete (messages must be less than 14 days old).')
          .setTimestamp();

        await interaction.editReply({ embeds: [errorEmbed] });
        return;
      }

      await channel?.bulkDelete(filtered);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.success} Messages Cleared`)
        .setColor(COLORS.success)
        .setDescription(`Deleted ${Formatter.formatNumber(filtered.size - 1)} messages.`)
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Could not delete messages. Make sure I have the required permissions.')
        .setTimestamp();

      await interaction.editReply({ embeds: [errorEmbed] });
    }
  }

  public async executePrefix(message: Message): Promise<void> {
    const args = message.content.split(' ').slice(1);
    const amount = parseInt(args[0]) || 10;
    
    if (amount < 1 || amount > 100) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please provide a number between 1 and 100.')
        .setTimestamp();

      await message.reply({ embeds: [errorEmbed] });
      return;
    }

    try {
      const messages = await message.channel.messages.fetch({ limit: amount + 1 });
      const filtered = messages.filter(m => m.createdTimestamp < Date.now() && m.createdTimestamp > Date.now() - 1209600000);
      
      if (filtered.size === 0) {
        const errorEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.error} Error`)
          .setColor(COLORS.error)
          .setDescription('No messages found to delete (messages must be less than 14 days old).')
          .setTimestamp();

        await message.reply({ embeds: [errorEmbed] });
        return;
      }

      await message.channel.bulkDelete(filtered);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.success} Messages Cleared`)
        .setColor(COLORS.success)
        .setDescription(`Deleted ${Formatter.formatNumber(filtered.size - 1)} messages.`)
        .setTimestamp();

      await message.channel.send({ embeds: [embed] });
    } catch (error) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Could not delete messages. Make sure I have the required permissions.')
        .setTimestamp();

      await message.reply({ embeds: [errorEmbed] });
    }
  }
}

export default ClearCommand;
