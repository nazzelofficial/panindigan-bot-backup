// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { PALETTE, KIT, paginate, errorEmbed } from '../../utils/EmbedSystem.js';
import { getPrismaClient } from '../../database/postgresql/client.js';

const MEDALS = ['🥇', '🥈', '🥉'];

export class LeaderboardCommand extends BaseCommand {
  constructor() {
    super({
      name: 'leaderboard', description: 'View the top members by XP in this server', category: 'leveling',
      cooldown: 10, userPermissions: [], botPermissions: [], guildOnly: true,
      slashCommand: true, prefixCommand: true,
      aliases: ['lb', 'top', 'levels'], examples: ['/leaderboard', 'p!leaderboard'],
    });
  }

  private async buildPages(guildId: string, guild: any): Promise<EmbedBuilder[]> {
    const prisma = getPrismaClient();
    const entries = await prisma.leveling.findMany({
      where: { guildId },
      orderBy: { totalXp: 'desc' },
      take: 50,
    });

    if (!entries.length) {
      return [new EmbedBuilder()
        .setColor(PALETTE.leveling)
        .setTitle(`${KIT.leveling} Level Leaderboard`)
        .setDescription('No one has earned XP yet! Start chatting to appear here.')
        .setTimestamp()];
    }

    const PER_PAGE = 10;
    const pages: EmbedBuilder[] = [];

    for (let i = 0; i < entries.length; i += PER_PAGE) {
      const slice = entries.slice(i, i + PER_PAGE);
      const lines: string[] = [];

      for (let j = 0; j < slice.length; j++) {
        const e    = slice[j];
        const pos  = i + j + 1;
        const icon = MEDALS[pos - 1] ?? `\`#${pos}\``;
        let name: string;
        try {
          const member = await guild.members.fetch(e.userId).catch(() => null);
          name = member?.user.username ?? `<@${e.userId}>`;
        } catch {
          name = `<@${e.userId}>`;
        }
        lines.push(`${icon} **${name}** — Level **${e.level}** · ${Number(e.totalXp ?? 0).toLocaleString()} XP`);
      }

      pages.push(new EmbedBuilder()
        .setColor(PALETTE.leveling)
        .setAuthor({ name: `${guild.name} — Level Leaderboard`, iconURL: guild.iconURL({ size: 64 }) ?? undefined })
        .setDescription(lines.join('\n'))
        .setFooter({ text: `Showing ${i + 1}–${Math.min(i + PER_PAGE, entries.length)} of ${entries.length} members` })
        .setTimestamp());
    }

    return pages;
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply();
    try {
      const pages = await this.buildPages(interaction.guildId!, interaction.guild!);
      if (pages.length === 1) return void interaction.editReply({ embeds: [pages[0]] });
      await interaction.editReply({ embeds: [pages[0]] });
      const msg = await interaction.fetchReply();
      // Re-use paginate via message edit
      await paginate(interaction, pages, 'lb');
    } catch {
      await interaction.editReply({ embeds: [errorEmbed('Error', 'Failed to fetch leaderboard.')] });
    }
  }

  public async executePrefix(message: Message, _args: string[]): Promise<void> {
    try {
      const pages = await this.buildPages(message.guildId!, message.guild!);
      await paginate(message, pages, 'lb');
    } catch {
      await message.reply({ embeds: [errorEmbed('Error', 'Failed to fetch leaderboard.')] });
    }
  }
}
export default LeaderboardCommand;
