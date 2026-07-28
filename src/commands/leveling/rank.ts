// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { PALETTE, KIT, divider, errorEmbed } from '../../utils/EmbedSystem.js';
import { getPrismaClient } from '../../database/postgresql/client.js';

function xpBar(current: number, needed: number, length = 15): string {
  const filled = Math.min(length, Math.floor((current / needed) * length));
  return '█'.repeat(filled) + '░'.repeat(length - filled);
}

export class RankCommand extends BaseCommand {
  constructor() {
    super({
      name: 'rank', description: "Check your or another user's level and XP", category: 'leveling',
      cooldown: 5, userPermissions: [], botPermissions: [], guildOnly: true,
      slashCommand: true, prefixCommand: true,
      aliases: ['level', 'lvl', 'xp'], examples: ['/rank', '/rank @user', 'p!rank'],
    });
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName(this.name).setDescription(this.description).setDMPermission(false)
      .addUserOption(o => o.setName('user').setDescription('User to check').setRequired(false)) as SlashCommandBuilder;
  }

  private async run(targetUser: any, guildId: string): Promise<EmbedBuilder> {
    const prisma = getPrismaClient();

    const leveling = await prisma.leveling.findUnique({
      where: { userId_guildId: { userId: targetUser.id, guildId } },
    });

    if (!leveling) {
      return new EmbedBuilder()
        .setColor(PALETTE.leveling)
        .setAuthor({ name: `${targetUser.username} — Rank`, iconURL: targetUser.displayAvatarURL({ size: 64 }) })
        .setDescription(`${KIT.sparkle} This user hasn't earned any XP yet!\nSend some messages to start leveling up.`)
        .setTimestamp();
    }

    const level    = leveling.level ?? 0;
    const xp       = Number(leveling.xp ?? 0);
    const totalXp  = Number(leveling.totalXp ?? xp);
    const needed   = Math.floor(100 * Math.pow(1.5, level));
    const pct      = needed > 0 ? Math.min(100, Math.floor((xp / needed) * 100)) : 0;
    const bar      = xpBar(xp, needed);

    // Get rank position
    const rank = await prisma.leveling.count({
      where: { guildId, totalXp: { gt: leveling.totalXp ?? 0 } },
    }).then(c => c + 1).catch(() => '?');

    return new EmbedBuilder()
      .setColor(PALETTE.leveling)
      .setAuthor({ name: `${targetUser.username} — Rank`, iconURL: targetUser.displayAvatarURL({ size: 64 }) })
      .setThumbnail(targetUser.displayAvatarURL({ size: 128 }))
      .addFields(
        { name: `${KIT.leveling} Level`, value: `**${level}**`,                   inline: true },
        { name: `🏆 Server Rank`,        value: `**#${rank}**`,                   inline: true },
        { name: `✨ Total XP`,           value: `**${totalXp.toLocaleString()}**`,  inline: true },
        { name: `${KIT.dot} Progress`, value: `\`[${bar}]\` ${pct}%\n${xp.toLocaleString()} / ${needed.toLocaleString()} XP to Level ${level + 1}`, inline: false },
      )
      .setFooter({ text: 'Keep chatting to earn more XP!' })
      .setTimestamp();
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply();
    try {
      const target = interaction.options.getUser('user') ?? interaction.user;
      await interaction.editReply({ embeds: [await this.run(target, interaction.guildId!)] });
    } catch {
      await interaction.editReply({ embeds: [errorEmbed('Error', 'Failed to fetch rank data.')] });
    }
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    try {
      const target = message.mentions.users.first() ?? message.author;
      await message.reply({ embeds: [await this.run(target, message.guildId!)] });
    } catch {
      await message.reply({ embeds: [errorEmbed('Error', 'Failed to fetch rank data.')] });
    }
  }
}
export default RankCommand;
