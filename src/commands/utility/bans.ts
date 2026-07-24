import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';
import { Formatter } from '../../utils/Formatter';

export class BansCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'bans',
      description: 'List banned users in the server',
      category: 'utility',
      cooldown: 5,
      userPermissions: [PermissionFlagsBits.BanMembers],
      botPermissions: [PermissionFlagsBits.BanMembers],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: [],
      examples: ['/bans', 'p!bans'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const guild = interaction.guild!;

    try {
      const bans = await guild.bans.fetch();
      const banList = bans.map(ban => `${ban.user.tag} - ${ban.reason || 'No reason'}`).slice(0, 10).join('\n');

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.info} Server Bans`)
        .setColor(COLORS.info)
        .setDescription(banList || 'No bans')
        .addFields([
          { name: 'Total Bans', value: Formatter.formatNumber(bans.size), inline: true },
        ])
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Could not fetch bans. Missing permissions.')
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed] });
    }
  }

  public async executePrefix(message: Message): Promise<void> {
    const guild = message.guild!;

    try {
      const bans = await guild.bans.fetch();
      const banList = bans.map(ban => `${ban.user.tag} - ${ban.reason || 'No reason'}`).slice(0, 10).join('\n');

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.info} Server Bans`)
        .setColor(COLORS.info)
        .setDescription(banList || 'No bans')
        .addFields([
          { name: 'Total Bans', value: Formatter.formatNumber(bans.size), inline: true },
        ])
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Could not fetch bans. Missing permissions.')
        .setTimestamp();

      await message.reply({ embeds: [errorEmbed] });
    }
  }
}

export default BansCommand;
