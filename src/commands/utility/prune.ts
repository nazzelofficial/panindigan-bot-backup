import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';
import { Formatter } from '../../utils/Formatter';

export class PruneCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'prune',
      description: 'Remove inactive members from the server',
      category: 'utility',
      cooldown: 5,
      userPermissions: [PermissionFlagsBits.KickMembers],
      botPermissions: [PermissionFlagsBits.KickMembers],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: [],
      examples: ['/prune 30', '/prune 30days', 'p!prune 30'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const days = interaction.options.getInteger('days') || 30;
    
    if (days < 1 || days > 30) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please provide a number between 1 and 30.')
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed] });
      return;
    }

    try {
      const pruned = await interaction.guild?.members.prune({ days, dry: false });

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.success} Members Pruned`)
        .setColor(COLORS.success)
        .setDescription(`Successfully pruned ${Formatter.formatNumber(pruned?.pruned || 0)} members who have been inactive for ${days} days.`)
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Could not prune members. Make sure I have the required permissions.')
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed] });
    }
  }

  public async executePrefix(message: Message): Promise<void> {
    const args = message.content.split(' ').slice(1);
    const days = parseInt(args[0]) || 30;
    
    if (days < 1 || days > 30) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please provide a number between 1 and 30.')
        .setTimestamp();

      await message.reply({ embeds: [errorEmbed] });
      return;
    }

    try {
      const pruned = await message.guild?.members.prune({ days, dry: false });

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.success} Members Pruned`)
        .setColor(COLORS.success)
        .setDescription(`Successfully pruned ${Formatter.formatNumber(pruned?.pruned || 0)} members who have been inactive for ${days} days.`)
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Could not prune members. Make sure I have the required permissions.')
        .setTimestamp();

      await message.reply({ embeds: [errorEmbed] });
    }
  }
}

export default PruneCommand;
