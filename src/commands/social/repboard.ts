import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants';
import { getPrismaClient } from '../../database/postgresql/client';

export class RepboardCommand extends BaseCommand {
  constructor() {
    super({ name: 'repboard', description: 'View the reputation leaderboard', category: 'social', premiumTier: 'silver', cooldown: 10, guildOnly: true, slashCommand: true, prefixCommand: true, aliases: ['repleaderboard', 'repl'], examples: ['/repboard', 'p!repboard'] } as CommandOptions);
  }
  public buildSlashCommand(): SlashCommandBuilder { return (new SlashCommandBuilder().setName(this.name).setDescription(this.description).setDMPermission(false)) as SlashCommandBuilder; }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    const prisma = getPrismaClient();
    const top = await prisma.user.findMany({ where: { guildId: i.guildId!, repPoints: { gt: 0 } }, orderBy: { repPoints: 'desc' }, take: 10 });
    const lines = await Promise.all(top.map(async (u, idx) => {
      const user = await i.client.users.fetch(u.userId).catch(() => null);
      const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}.`;
      return `${medal} **${user?.username || u.userId}** — ⭐ ${u.repPoints} rep`;
    }));
    const embed = new EmbedBuilder().setTitle('⭐ Reputation Leaderboard').setColor(COLORS.gold).setDescription(lines.join('\n') || 'No rep data.').setTimestamp();
    await i.reply({ embeds: [embed] });
  }

  public async executePrefix(m: Message, args: string[]): Promise<void> {
    const prisma = getPrismaClient();
    const top = await prisma.user.findMany({ where: { guildId: m.guildId!, repPoints: { gt: 0 } }, orderBy: { repPoints: 'desc' }, take: 10 });
    const lines = await Promise.all(top.map(async (u, idx) => {
      const user = await m.client.users.fetch(u.userId).catch(() => null);
      const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}.`;
      return `${medal} **${user?.username || u.userId}** — ⭐ ${u.repPoints}`;
    }));
    await m.reply({ embeds: [new EmbedBuilder().setTitle('⭐ Reputation Leaderboard').setColor(COLORS.gold).setDescription(lines.join('\n') || 'No rep data.').setTimestamp()] });
  }
}
export default RepboardCommand;
