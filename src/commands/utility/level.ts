import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import {
  ChatInputCommandInteraction,
  Message,
  EmbedBuilder,
  SlashCommandBuilder,
  User,
} from 'discord.js';
import { COLORS, EMOJIS, LEVEL_XP_REQUIREMENTS } from '../../utils/Constants';
import { getPrismaClient } from '../../database/postgresql/client';

function getXpForNextLevel(level: number): number {
  return LEVEL_XP_REQUIREMENTS[level + 1] ?? LEVEL_XP_REQUIREMENTS[LEVEL_XP_REQUIREMENTS.length - 1];
}

function buildXpBar(current: number, target: number, length = 20): string {
  const ratio = Math.min(current / target, 1);
  const filled = Math.round(ratio * length);
  const empty = length - filled;
  return `[${'█'.repeat(filled)}${'░'.repeat(empty)}] ${Math.round(ratio * 100)}%`;
}

async function getLevelEmbed(
  targetUser: User,
  guildId: string,
  guildName: string,
): Promise<EmbedBuilder> {
  const prisma = getPrismaClient();

  const levelData = await prisma.leveling.findUnique({
    where: { userId_guildId: { userId: targetUser.id, guildId } },
  });

  if (!levelData) {
    return new EmbedBuilder()
      .setTitle(`${EMOJIS.leveling} Level — ${targetUser.username}`)
      .setColor(COLORS.info)
      .setThumbnail(targetUser.displayAvatarURL({ size: 128 }))
      .setDescription(`**${targetUser.username}** hasn't earned any XP yet.\nThey can earn XP by chatting in the server!`)
      .setTimestamp();
  }

  const level = levelData.level;
  const xp = levelData.xp;
  const xpForCurrent = LEVEL_XP_REQUIREMENTS[level] ?? 0;
  const xpForNext = getXpForNextLevel(level);
  const xpIntoLevel = xp - xpForCurrent;
  const xpNeededForNext = xpForNext - xpForCurrent;
  const progressBar = buildXpBar(xpIntoLevel, xpNeededForNext);

  // Get rank among all users in guild
  const rank = await prisma.leveling.count({
    where: { guildId, xp: { gt: xp } },
  });

  const isMaxLevel = level >= LEVEL_XP_REQUIREMENTS.length - 1;

  return new EmbedBuilder()
    .setTitle(`${EMOJIS.leveling} Level — ${targetUser.username}`)
    .setColor(COLORS.gold)
    .setThumbnail(targetUser.displayAvatarURL({ size: 128 }))
    .addFields(
      { name: '🎖️ Level', value: `**${level}**`, inline: true },
      { name: '✨ Total XP', value: `**${xp.toLocaleString()}**`, inline: true },
      { name: '🏆 Server Rank', value: `**#${rank + 1}**`, inline: true },
      {
        name: isMaxLevel ? '🎯 XP Progress' : `📈 Progress to Level ${level + 1}`,
        value: isMaxLevel
          ? '⭐ **MAX LEVEL REACHED!**'
          : `${progressBar}\n**${xpIntoLevel.toLocaleString()}** / **${xpNeededForNext.toLocaleString()}** XP`,
      },
      { name: '💬 Messages', value: `**${levelData.totalMessages.toLocaleString()}**`, inline: true },
      { name: '🎙️ Voice Minutes', value: `**${levelData.voiceMinutes.toLocaleString()}**`, inline: true },
    )
    .setFooter({ text: guildName })
    .setTimestamp();
}

export class LevelCommand extends BaseCommand {
  constructor() {
    super({
      name: 'level',
      description: "Display your level or another user's level",
      category: 'utility',
      premiumTier: 'free',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['lvl', 'xp', 'rank'],
      examples: ['/level', '/level user:@someone', 'p!level', 'p!level @someone'],
    } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addUserOption(o =>
        o.setName('user')
          .setDescription('User to check level for (default: yourself)')
          .setRequired(false),
      )
      .setDMPermission(false) as SlashCommandBuilder;
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const target = interaction.options.getUser('user') || interaction.user;
    await interaction.deferReply();

    try {
      const embed = await getLevelEmbed(target, interaction.guildId!, interaction.guild?.name || 'Server');
      await interaction.editReply({ embeds: [embed] });
    } catch (err: any) {
      await interaction.editReply({ content: `${EMOJIS.error} Failed to fetch level data: ${err.message}` });
    }
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const target = message.mentions.users.first() || message.author;
    const thinking = await message.reply(`${EMOJIS.loading} Fetching level data...`);

    try {
      const embed = await getLevelEmbed(target, message.guildId!, message.guild?.name || 'Server');
      await thinking.edit({ content: null, embeds: [embed] });
    } catch (err: any) {
      await thinking.edit(`${EMOJIS.error} Failed to fetch level data: ${err.message}`);
    }
  }
}

export default LevelCommand;
