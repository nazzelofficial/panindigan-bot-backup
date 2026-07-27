// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';

export class LevelstatsCommand extends BaseCommand {
  constructor() {
    super({
      name: 'levelstats',
      description: 'View leveling statistics for this server',
      category: 'leveling',
      premiumTier: 'gold',
      cooldown: 10,
      userPermissions: [],
      botPermissions: [],
      ownerOnly: false,
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['lvlstats', 'xpstats'],
      examples: ['/levelstats', 'p!levelstats'],
    } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .setDMPermission(false)) as SlashCommandBuilder;
  }

  private async getStats(guildId: string) {
    const prisma = getPrismaClient();
    const [totalUsers, topEntry, totalXpAgg] = await Promise.all([
      prisma.leveling.count({ where: { guildId } }),
      prisma.leveling.findFirst({ where: { guildId }, orderBy: [{ level: 'desc' }, { totalXp: 'desc' }] }),
      prisma.leveling.aggregate({ where: { guildId }, _sum: { totalXp: true } }),
    ]);
    return { totalUsers, topEntry, totalXpGiven: totalXpAgg._sum.totalXp ?? 0 };
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply();
    try {
      const { totalUsers, topEntry, totalXpGiven } = await this.getStats(interaction.guildId!);
      let topUserStr = 'None';
      if (topEntry) {
        try {
          const u = await interaction.client.users.fetch(topEntry.userId);
          topUserStr = `${u.username} (Level ${topEntry.level}, ${topEntry.totalXp.toLocaleString()} XP)`;
        } catch {
          topUserStr = `<@${topEntry.userId}> (Level ${topEntry.level})`;
        }
      }

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.leveling} Leveling Statistics — ${interaction.guild?.name}`)
        .setColor(COLORS.gold)
        .setThumbnail(interaction.guild?.iconURL() ?? null)
        .addFields(
          { name: '👥 Users with XP', value: totalUsers.toLocaleString(), inline: true },
          { name: '✨ Total XP Given', value: totalXpGiven.toLocaleString(), inline: true },
          { name: '🏆 Highest Level User', value: topUserStr, inline: false },
        )
        .setFooter({ text: 'Leveling stats for this server' })
        .setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    } catch {
      await interaction.editReply({ content: `${EMOJIS.error} Failed to fetch leveling stats.` });
    }
  }

  public async executePrefix(message: Message, _args: string[]): Promise<void> {
    try {
      const { totalUsers, topEntry, totalXpGiven } = await this.getStats(message.guildId!);
      let topUserStr = 'None';
      if (topEntry) {
        try {
          const u = await message.client.users.fetch(topEntry.userId);
          topUserStr = `${u.username} (Level ${topEntry.level}, ${topEntry.totalXp.toLocaleString()} XP)`;
        } catch {
          topUserStr = `<@${topEntry.userId}> (Level ${topEntry.level})`;
        }
      }

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.leveling} Leveling Statistics — ${message.guild?.name}`)
        .setColor(COLORS.gold)
        .setThumbnail(message.guild?.iconURL() ?? null)
        .addFields(
          { name: '👥 Users with XP', value: totalUsers.toLocaleString(), inline: true },
          { name: '✨ Total XP Given', value: totalXpGiven.toLocaleString(), inline: true },
          { name: '🏆 Highest Level User', value: topUserStr, inline: false },
        )
        .setFooter({ text: 'Leveling stats for this server' })
        .setTimestamp();
      await message.reply({ embeds: [embed] });
    } catch {
      await message.reply(`${EMOJIS.error} Failed to fetch leveling stats.`);
    }
  }
}

export default LevelstatsCommand;
