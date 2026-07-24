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

function formatBalance(n: bigint | number): string {
  return `₱${BigInt(n).toLocaleString()}`;
}

function formatBirthday(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

async function buildProfileEmbed(
  targetUser: User,
  guildId: string,
  guildName: string,
): Promise<EmbedBuilder> {
  const prisma = getPrismaClient();

  // Fetch all data in parallel
  const [userData, economyData, levelData, coupleData, premiumData] = await Promise.all([
    prisma.user.findUnique({ where: { userId_guildId: { userId: targetUser.id, guildId } } }),
    prisma.economy.findUnique({ where: { userId_guildId: { userId: targetUser.id, guildId } } }),
    prisma.leveling.findUnique({ where: { userId_guildId: { userId: targetUser.id, guildId } } }),
    prisma.couple.findFirst({
      where: { guildId, OR: [{ userId1: targetUser.id }, { userId2: targetUser.id }] },
    }),
    prisma.premium.findUnique({ where: { userId_guildId: { userId: targetUser.id, guildId } } }),
  ]);

  // Leveling info
  const level = levelData?.level ?? 0;
  const xp = levelData?.xp ?? 0;
  const messages = levelData?.totalMessages ?? 0;

  const xpForNext = LEVEL_XP_REQUIREMENTS[level + 1] ?? LEVEL_XP_REQUIREMENTS[LEVEL_XP_REQUIREMENTS.length - 1];
  const xpForCurrent = LEVEL_XP_REQUIREMENTS[level] ?? 0;
  const xpIntoLevel = Math.max(0, xp - xpForCurrent);
  const xpNeeded = Math.max(1, xpForNext - xpForCurrent);
  const progressPct = Math.min(100, Math.round((xpIntoLevel / xpNeeded) * 100));

  // Rank
  const rank = await prisma.leveling.count({ where: { guildId, xp: { gt: xp } } });

  // Economy
  const wallet = economyData?.wallet ?? BigInt(0);
  const bank = economyData?.bank ?? BigInt(0);
  const networth = wallet + bank;

  // Premium tier
  const tier = premiumData?.tier || userData?.premiumTier || 'free';
  const tierEmojis: Record<string, string> = {
    free: '🆓', bronze: '🥉', silver: '⭐', gold: '💎', diamond: '👑',
  };
  const tierLabel = `${tierEmojis[tier] || '🆓'} ${tier.charAt(0).toUpperCase() + tier.slice(1)}`;

  // Couple
  let coupleField = 'Single 💔';
  if (coupleData) {
    const spouseId = coupleData.userId1 === targetUser.id ? coupleData.userId2 : coupleData.userId1;
    const daysMarried = Math.floor((Date.now() - coupleData.marriedAt.getTime()) / (1000 * 60 * 60 * 24));
    coupleField = `<@${spouseId}> 💕 (${daysMarried}d)`;
  }

  // Bio
  const bio = userData?.bio || '*No bio set*';
  const repPoints = userData?.repPoints ?? 0;

  const embed = new EmbedBuilder()
    .setTitle(`${EMOJIS.social} ${targetUser.username}'s Profile`)
    .setColor(COLORS.default)
    .setThumbnail(targetUser.displayAvatarURL({ size: 256 }))
    .setDescription(bio.slice(0, 200))
    .addFields(
      // Leveling row
      { name: '🎖️ Level', value: `**${level}**`, inline: true },
      { name: '✨ XP', value: `**${xp.toLocaleString()}** (${progressPct}%)`, inline: true },
      { name: '🏆 Rank', value: `**#${rank + 1}**`, inline: true },
      // Economy row
      { name: '💳 Wallet', value: formatBalance(wallet), inline: true },
      { name: '🏦 Bank', value: formatBalance(bank), inline: true },
      { name: '💰 Net Worth', value: formatBalance(networth), inline: true },
      // Social row
      { name: '⭐ Rep', value: `**${repPoints}** pts`, inline: true },
      { name: '💑 Partner', value: coupleField, inline: true },
      { name: '💎 Premium', value: tierLabel, inline: true },
      // Stats
      { name: '💬 Messages', value: `**${messages.toLocaleString()}**`, inline: true },
      ...(userData?.birthday
        ? [{ name: '🎂 Birthday', value: formatBirthday(userData.birthday), inline: true }]
        : []),
      ...(userData?.timezone
        ? [{ name: '🕐 Timezone', value: userData.timezone, inline: true }]
        : []),
    )
    .setFooter({ text: guildName })
    .setTimestamp();

  return embed;
}

export class ProfileCommand extends BaseCommand {
  constructor() {
    super({
      name: 'profile',
      description: "Display a user's full profile",
      category: 'utility',
      premiumTier: 'free',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['me', 'card', 'whois'],
      examples: ['/profile', '/profile user:@someone', 'p!profile', 'p!profile @someone'],
    } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addUserOption(o =>
        o.setName('user')
          .setDescription('User to view profile of (default: yourself)')
          .setRequired(false),
      )
      .setDMPermission(false) as SlashCommandBuilder;
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const target = interaction.options.getUser('user') || interaction.user;
    await interaction.deferReply();

    try {
      const embed = await buildProfileEmbed(
        target,
        interaction.guildId!,
        interaction.guild?.name || 'Server',
      );
      await interaction.editReply({ embeds: [embed] });
    } catch (err: any) {
      await interaction.editReply({
        content: `${EMOJIS.error} Failed to load profile: ${err.message}`,
      });
    }
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const target = message.mentions.users.first() || message.author;
    const thinking = await message.reply(`${EMOJIS.loading} Loading profile...`);

    try {
      const embed = await buildProfileEmbed(
        target,
        message.guildId!,
        message.guild?.name || 'Server',
      );
      await thinking.edit({ content: null, embeds: [embed] });
    } catch (err: any) {
      await thinking.edit(`${EMOJIS.error} Failed to load profile: ${err.message}`);
    }
  }
}

export default ProfileCommand;
