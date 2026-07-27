// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder, Client } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';

export class GloballeaderboardCommand extends BaseCommand {
  constructor() {
    super({
      name: 'globalleaderboard',
      description: 'View the top 10 users by XP across all servers',
      category: 'leveling',
      premiumTier: 'gold',
      cooldown: 10,
      userPermissions: [],
      botPermissions: [],
      ownerOnly: false,
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['glb', 'globallb', 'globalrank'],
      examples: ['/globalleaderboard', 'p!globalleaderboard'],
    } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description) as SlashCommandBuilder;
  }

  private async getTopUsers(client: Client): Promise<EmbedBuilder> {
    const prisma = getPrismaClient();
    const top = await prisma.leveling.findMany({
      orderBy: [{ level: 'desc' }, { totalXp: 'desc' }],
      take: 10,
    });

    const medals = ['🥇', '🥈', '🥉'];
    const lines: string[] = [];

    for (let i = 0; i < top.length; i++) {
      const entry = top[i];
      const medal = medals[i] ?? `**${i + 1}.**`;
      let username = `<@${entry.userId}>`;
      try {
        const user = await client.users.fetch(entry.userId).catch(() => null);
        if (user) username = user.username;
      } catch {}
      lines.push(`${medal} **${username}** — Level ${entry.level} | ${entry.totalXp.toLocaleString()} Total XP`);
    }

    return new EmbedBuilder()
      .setTitle(`${EMOJIS.leveling} Global XP Leaderboard`)
      .setColor(COLORS.gold)
      .setDescription(lines.length > 0 ? lines.join('\n') : 'No data yet.')
      .setFooter({ text: 'Top 10 users across all servers' })
      .setTimestamp();
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply();
    try {
      const embed = await this.getTopUsers(interaction.client);
      await interaction.editReply({ embeds: [embed] });
    } catch {
      await interaction.editReply({ content: `${EMOJIS.error} Failed to fetch global leaderboard.` });
    }
  }

  public async executePrefix(message: Message, _args: string[]): Promise<void> {
    try {
      const embed = await this.getTopUsers(message.client);
      await message.reply({ embeds: [embed] });
    } catch {
      await message.reply(`${EMOJIS.error} Failed to fetch global leaderboard.`);
    }
  }
}

export default GloballeaderboardCommand;
