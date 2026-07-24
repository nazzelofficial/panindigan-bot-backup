import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';
import { Formatter } from '../../utils/Formatter';

export class InviteLeaderboardCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'inviteleaderboard',
      description: 'Display the invite leaderboard',
      category: 'info',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['invitelb', 'invitetop'],
      examples: ['/inviteleaderboard', 'p!inviteleaderboard'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const guild = interaction.guild!;

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} 🏆 Invite Leaderboard`)
      .setColor(COLORS.info)
      .setDescription('This is a placeholder. Invite leaderboard will be implemented with database integration.')
      .addFields([
        { name: 'Top Inviters', value: '1. User1 - 10 invites\n2. User2 - 8 invites\n3. User3 - 5 invites', inline: false },
        { name: 'Total Invites', value: Formatter.formatNumber(guild.memberCount), inline: true },
      ])
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const guild = message.guild!;

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} 🏆 Invite Leaderboard`)
      .setColor(COLORS.info)
      .setDescription('This is a placeholder. Invite leaderboard will be implemented with database integration.')
      .addFields([
        { name: 'Top Inviters', value: '1. User1 - 10 invites\n2. User2 - 8 invites\n3. User3 - 5 invites', inline: false },
        { name: 'Total Invites', value: Formatter.formatNumber(guild.memberCount), inline: true },
      ])
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default InviteLeaderboardCommand;
