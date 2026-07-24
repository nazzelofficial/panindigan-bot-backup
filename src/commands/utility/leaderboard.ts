import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import {
  ChatInputCommandInteraction,
  Message,
  EmbedBuilder,
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
} from 'discord.js';
import { COLORS, EMOJIS, LEVEL_XP_REQUIREMENTS } from '../../utils/Constants';
import { getPrismaClient } from '../../database/postgresql/client';

const PAGE_SIZE = 10;

function getLevelFromXp(xp: number): number {
  let level = 0;
  for (let i = LEVEL_XP_REQUIREMENTS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_XP_REQUIREMENTS[i]) { level = i; break; }
  }
  return level;
}

function getRankMedal(rank: number): string {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return `**${rank}.**`;
}

async function buildLeaderboardEmbed(
  guildId: string,
  guildName: string,
  page: number,
  total: number,
): Promise<EmbedBuilder> {
  const prisma = getPrismaClient();
  const skip = (page - 1) * PAGE_SIZE;

  const records = await prisma.leveling.findMany({
    where: { guildId },
    orderBy: { xp: 'desc' },
    skip,
    take: PAGE_SIZE,
  });

  const totalPages = Math.ceil(total / PAGE_SIZE);

  if (!records.length) {
    return new EmbedBuilder()
      .setTitle(`${EMOJIS.leveling} XP Leaderboard — ${guildName}`)
      .setColor(COLORS.info)
      .setDescription('No XP data yet. Members earn XP by chatting!');
  }

  const lines = records.map((r, i) => {
    const rank = skip + i + 1;
    const level = r.level || getLevelFromXp(r.xp);
    const xpFormatted = r.xp.toLocaleString();
    return `${getRankMedal(rank)} <@${r.userId}>\n\u200b  Level **${level}** • **${xpFormatted}** XP`;
  });

  return new EmbedBuilder()
    .setTitle(`${EMOJIS.leveling} XP Leaderboard — ${guildName}`)
    .setColor(COLORS.gold)
    .setDescription(lines.join('\n\n'))
    .setFooter({ text: `Page ${page}/${totalPages} • ${total} members with XP` })
    .setTimestamp();
}

export class LeaderboardCommand extends BaseCommand {
  constructor() {
    super({
      name: 'leaderboard',
      description: 'Display the server XP leaderboard',
      category: 'utility',
      premiumTier: 'free',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['lb', 'top', 'ranks'],
      examples: ['/leaderboard', '/leaderboard page:2', 'p!leaderboard', 'p!lb 2'],
    } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addIntegerOption(o =>
        o.setName('page')
          .setDescription('Page number (default: 1)')
          .setRequired(false)
          .setMinValue(1),
      )
      .setDMPermission(false) as SlashCommandBuilder;
  }

  private buildPaginationRow(page: number, totalPages: number, guildId: string): ActionRowBuilder<ButtonBuilder> {
    return new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(`lb_prev:${guildId}:${page}`)
        .setLabel('◀ Previous')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(page <= 1),
      new ButtonBuilder()
        .setCustomId(`lb_page:${guildId}:${page}`)
        .setLabel(`${page} / ${totalPages}`)
        .setStyle(ButtonStyle.Primary)
        .setDisabled(true),
      new ButtonBuilder()
        .setCustomId(`lb_next:${guildId}:${page}`)
        .setLabel('Next ▶')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(page >= totalPages),
    );
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const guildId = interaction.guildId!;
    const guildName = interaction.guild?.name || 'Server';
    let page = Math.max(interaction.options.getInteger('page') || 1, 1);

    await interaction.deferReply();

    const prisma = getPrismaClient();
    const total = await prisma.leveling.count({ where: { guildId } });

    if (!total) {
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle(`${EMOJIS.leveling} XP Leaderboard — ${guildName}`)
            .setColor(COLORS.info)
            .setDescription('No XP data yet. Members earn XP by chatting!'),
        ],
      });
      return;
    }

    const totalPages = Math.ceil(total / PAGE_SIZE);
    page = Math.min(page, totalPages);

    const embed = await buildLeaderboardEmbed(guildId, guildName, page, total);
    const row = this.buildPaginationRow(page, totalPages, guildId);

    const reply = await interaction.editReply({
      embeds: [embed],
      components: totalPages > 1 ? [row] : [],
    });

    if (totalPages <= 1) return;

    const collector = reply.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 120000,
      filter: i => i.user.id === interaction.user.id,
    });

    collector.on('collect', async i => {
      if (i.customId.startsWith('lb_prev')) page = Math.max(1, page - 1);
      else if (i.customId.startsWith('lb_next')) page = Math.min(totalPages, page + 1);

      const newEmbed = await buildLeaderboardEmbed(guildId, guildName, page, total);
      const newRow = this.buildPaginationRow(page, totalPages, guildId);
      await i.update({ embeds: [newEmbed], components: [newRow] });
    });

    collector.on('end', async () => {
      try {
        await reply.edit({ components: [] });
      } catch { /* message deleted */ }
    });
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const guildId = message.guildId!;
    const guildName = message.guild?.name || 'Server';
    let page = Math.max(parseInt(args[0], 10) || 1, 1);

    const thinking = await message.reply(`${EMOJIS.loading} Loading leaderboard...`);

    try {
      const prisma = getPrismaClient();
      const total = await prisma.leveling.count({ where: { guildId } });

      if (!total) {
        await thinking.edit({
          content: null,
          embeds: [
            new EmbedBuilder()
              .setTitle(`${EMOJIS.leveling} XP Leaderboard — ${guildName}`)
              .setColor(COLORS.info)
              .setDescription('No XP data yet. Members earn XP by chatting!'),
          ],
        });
        return;
      }

      const totalPages = Math.ceil(total / PAGE_SIZE);
      page = Math.min(page, totalPages);

      const embed = await buildLeaderboardEmbed(guildId, guildName, page, total);
      const row = this.buildPaginationRow(page, totalPages, guildId);

      const reply = await thinking.edit({
        content: null,
        embeds: [embed],
        components: totalPages > 1 ? [row] : [],
      });

      if (totalPages <= 1) return;

      const collector = reply.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 120000,
        filter: i => i.user.id === message.author.id,
      });

      collector.on('collect', async i => {
        if (i.customId.startsWith('lb_prev')) page = Math.max(1, page - 1);
        else if (i.customId.startsWith('lb_next')) page = Math.min(totalPages, page + 1);

        const newEmbed = await buildLeaderboardEmbed(guildId, guildName, page, total);
        const newRow = this.buildPaginationRow(page, totalPages, guildId);
        await i.update({ embeds: [newEmbed], components: [newRow] });
      });

      collector.on('end', async () => {
        try { await reply.edit({ components: [] }); } catch { /* ignored */ }
      });
    } catch (err: any) {
      await thinking.edit(`${EMOJIS.error} Failed to load leaderboard: ${err.message}`);
    }
  }
}

export default LeaderboardCommand;
