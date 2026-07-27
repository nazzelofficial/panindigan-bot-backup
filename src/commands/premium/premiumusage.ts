// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';
import { getRedisClient } from '../../database/redis/client.js';

const DAILY_AI_LIMITS: Record<string, number> = {
  free: 0, bronze: 5, silver: 15, gold: 40, diamond: -1,
};

export class PremiumUsageCommand extends BaseCommand {
  constructor() {
    super({
      name: 'premiumusage',
      description: 'View how many AI image credits and premium slots you\'ve used today',
      category: 'premium',
      premiumTier: 'silver',
      cooldown: 10,
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['usage', 'credits', 'aiusage'],
      examples: ['/premiumusage', 'p!premiumusage'],
    } as CommandOptions);
  }

  private async buildEmbed(userId: string): Promise<EmbedBuilder> {
    const prisma = getPrismaClient();
    const redis = getRedisClient();

    let tier = 'free';
    try {
      const prem = await (prisma as any).premium?.findUnique({ where: { userId } }).catch(() => null);
      if (prem?.active) tier = prem.tier || 'free';
    } catch {}

    const todayKey = `panindigan:ai_image_usage:${userId}:${new Date().toISOString().split('T')[0]}`;
    const chatKey = `panindigan:ai_chat_usage:${userId}:${new Date().toISOString().split('T')[0]}`;

    let imagesUsed = 0;
    let chatUsed = 0;
    try {
      imagesUsed = parseInt(await redis.get(todayKey) || '0');
      chatUsed = parseInt(await redis.get(chatKey) || '0');
    } catch {}

    const imageLimit = DAILY_AI_LIMITS[tier] ?? 0;
    const chatLimit = tier === 'diamond' ? -1 : tier === 'gold' ? 200 : tier === 'silver' ? 100 : tier === 'bronze' ? 50 : 5;

    const formatLimit = (used: number, limit: number) => {
      if (limit === -1) return `${used} / ♾️ Unlimited`;
      const bar = Math.round((used / limit) * 10);
      return `${used} / ${limit} \`${'█'.repeat(bar)}${'░'.repeat(10 - bar)}\``;
    };

    const tierLabels: Record<string, string> = { free: '🆓 Free', bronze: '🥉 Bronze', silver: '⭐ Silver', gold: '💎 Gold', diamond: '👑 Diamond' };

    return new EmbedBuilder()
      .setTitle(`${EMOJIS.premium} Premium Usage`)
      .setColor(COLORS.gold)
      .addFields(
        { name: '💎 Your Tier', value: tierLabels[tier] || '🆓 Free', inline: true },
        { name: '🔄 Resets', value: 'Daily at midnight UTC', inline: true },
        { name: '\u200B', value: '\u200B', inline: false },
        { name: '🖼️ AI Image Generation', value: formatLimit(imagesUsed, imageLimit), inline: false },
        { name: '💬 AI Chat Messages', value: formatLimit(chatUsed, chatLimit), inline: false },
      )
      .setFooter({ text: 'Upgrade your tier for higher limits • p!premium upgrade' })
      .setTimestamp();
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply({ ephemeral: true });
    const embed = await this.buildEmbed(interaction.user.id);
    await interaction.editReply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const embed = await this.buildEmbed(message.author.id);
    await message.reply({ embeds: [embed] });
  }
}

export default PremiumUsageCommand;
