// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';

export class GrowthStatsCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'growthstats',
      description: 'Show server growth statistics',
      category: 'info',
      cooldown: 10,
      userPermissions: [],
      botPermissions: [],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['growth', 'servergrowth'],
      examples: ['/growthstats', 'p!growthstats'],
    };
    super(options);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .setDMPermission(false) as SlashCommandBuilder;
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply();
    const guild = interaction.guild!;
    await guild.members.fetch().catch(() => {});

    const members = guild.members.cache;
    const now = Date.now();
    const day = 86400000;

    const joinedToday = members.filter(m => now - (m.joinedTimestamp || 0) < day).size;
    const joinedWeek = members.filter(m => now - (m.joinedTimestamp || 0) < 7 * day).size;
    const joinedMonth = members.filter(m => now - (m.joinedTimestamp || 0) < 30 * day).size;

    const ageMs = now - guild.createdTimestamp;
    const ageDays = Math.floor(ageMs / day);
    const avgPerDay = ageDays > 0 ? (guild.memberCount / ageDays).toFixed(2) : 'N/A';

    // Newest members
    const newest = [...members.values()]
      .filter(m => m.joinedTimestamp)
      .sort((a, b) => (b.joinedTimestamp || 0) - (a.joinedTimestamp || 0))
      .slice(0, 5);

    const embed = new EmbedBuilder()
      .setTitle(`📊 Growth Stats — ${guild.name}`)
      .setColor(COLORS.success)
      .addFields(
        { name: '👥 Total Members', value: `**${guild.memberCount.toLocaleString()}**`, inline: true },
        { name: '📅 Server Age', value: `**${ageDays}** days`, inline: true },
        { name: '📈 Avg Growth', value: `**${avgPerDay}** members/day`, inline: true },
        { name: '📥 New Members', value: `Today: **${joinedToday}**\nThis week: **${joinedWeek}**\nThis month: **${joinedMonth}**`, inline: true },
        {
          name: '🆕 Recent Joins',
          value: newest.map(m => `<@${m.id}> — <t:${Math.floor((m.joinedTimestamp || 0) / 1000)}:R>`).join('\n') || 'N/A',
          inline: false
        }
      )
      .setFooter({ text: `Server created: ${guild.createdAt.toDateString()}` })
      .setTimestamp();
    await interaction.editReply({ embeds: [embed] });
  }

  public async executePrefix(message: Message, _args: string[]): Promise<void> {
    const guild = message.guild!;
    await guild.members.fetch().catch(() => {});
    const ageDays = Math.floor((Date.now() - guild.createdTimestamp) / 86400000);
    const embed = new EmbedBuilder()
      .setTitle(`📊 Growth Stats — ${guild.name}`)
      .setColor(COLORS.success)
      .addFields(
        { name: '👥 Total Members', value: `**${guild.memberCount.toLocaleString()}**`, inline: true },
        { name: '📅 Age', value: `**${ageDays}** days`, inline: true },
        { name: '📈 Avg', value: `**${ageDays > 0 ? (guild.memberCount / ageDays).toFixed(2) : 'N/A'}**/day`, inline: true },
      )
      .setTimestamp();
    await message.reply({ embeds: [embed] });
  }
}

export default GrowthStatsCommand;
