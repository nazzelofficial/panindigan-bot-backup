// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';

export class LeaderboardCommand extends BaseCommand {
  constructor() {
    super({ name: 'leaderboard', description: 'View the XP leaderboard for this server', category: 'leveling', premiumTier: 'free', cooldown: 10, guildOnly: true, slashCommand: true, prefixCommand: true, aliases: ['lb', 'levels', 'top'], examples: ['/leaderboard', 'p!leaderboard'] } as CommandOptions);
  }
  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder().setName(this.name).setDescription(this.description)
      .addIntegerOption(o => o.setName('page').setDescription('Page number').setRequired(false).setMinValue(1))
      .setDMPermission(false)) as SlashCommandBuilder;
  }

  private async getLeaderboard(guildId: string, page: number = 1, perPage: number = 10) {
    const prisma = getPrismaClient();
    const skip = (page - 1) * perPage;
    const [entries, total] = await Promise.all([
      prisma.leveling.findMany({ where: { guildId }, orderBy: [{ level: 'desc' }, { xp: 'desc' }], skip, take: perPage }),
      prisma.leveling.count({ where: { guildId } }),
    ]);
    return { entries, total, pages: Math.ceil(total / perPage) };
  }

  private formatEntry(i: number, offset: number, e: any, tag: string): string {
    const rank = i + offset + 1;
    const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `${rank}.`;
    return `${medal} **${tag}** — Level ${e.level} (${e.totalXp} XP)`;
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    const page = i.options.getInteger('page') || 1;
    await i.deferReply();
    try {
      const { entries, total, pages } = await this.getLeaderboard(i.guildId!, page);
      if (!entries.length) { await i.editReply({ content: '❌ No leveling data found.' }); return; }
      const lines = await Promise.all(entries.map(async (e, idx) => {
        const user = await i.client.users.fetch(e.userId).catch(() => null);
        return this.formatEntry(idx, (page - 1) * 10, e, user?.tag || e.userId);
      }));
      const embed = new EmbedBuilder()
        .setTitle(`🏆 XP Leaderboard — ${i.guild!.name}`)
        .setDescription(lines.join('\n'))
        .setColor(COLORS.gold)
        .setFooter({ text: `Page ${page}/${pages} • ${total} members` })
        .setTimestamp();
      await i.editReply({ embeds: [embed] });
    } catch { await i.editReply({ content: '❌ Failed to fetch leaderboard.' }); }
  }

  public async executePrefix(m: Message, _args: string[]): Promise<void> {
    const page = parseInt(args[0]) || 1;
    try {
      const { entries, total, pages } = await this.getLeaderboard(m.guildId!, page);
      if (!entries.length) { await m.reply('❌ No leveling data found.'); return; }
      const lines = await Promise.all(entries.map(async (e, idx) => {
        const user = await m.client.users.fetch(e.userId).catch(() => null);
        return this.formatEntry(idx, (page - 1) * 10, e, user?.tag || e.userId);
      }));
      const embed = new EmbedBuilder()
        .setTitle(`🏆 XP Leaderboard — ${m.guild!.name}`)
        .setDescription(lines.join('\n'))
        .setColor(COLORS.gold)
        .setFooter({ text: `Page ${page}/${pages} • ${total} members` })
        .setTimestamp();
      await m.reply({ embeds: [embed] });
    } catch { await m.reply('❌ Failed to fetch leaderboard.'); }
  }
}
export default LeaderboardCommand;
