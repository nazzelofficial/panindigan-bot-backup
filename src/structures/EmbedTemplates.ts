import { EmbedBuilder, ColorResolvable } from 'discord.js';
import { COLORS } from '../utils/Constants';

export class EmbedTemplates {
  public static success(title: string, description?: string): EmbedBuilder {
    return new EmbedBuilder()
      .setTitle(`✅ ${title}`)
      .setColor(COLORS.success as ColorResolvable)
      .setDescription(description || null)
      .setTimestamp();
  }

  public static error(title: string, description?: string): EmbedBuilder {
    return new EmbedBuilder()
      .setTitle(`❌ ${title}`)
      .setColor(COLORS.error as ColorResolvable)
      .setDescription(description || null)
      .setTimestamp();
  }

  public static warning(title: string, description?: string): EmbedBuilder {
    return new EmbedBuilder()
      .setTitle(`⚠️ ${title}`)
      .setColor(COLORS.warning as ColorResolvable)
      .setDescription(description || null)
      .setTimestamp();
  }

  public static info(title: string, description?: string): EmbedBuilder {
    return new EmbedBuilder()
      .setTitle(`ℹ️ ${title}`)
      .setColor(COLORS.info as ColorResolvable)
      .setDescription(description || null)
      .setTimestamp();
  }

  public static premium(tier: string): EmbedBuilder {
    const tierColors: Record<string, number> = {
      bronze: COLORS.bronze,
      silver: COLORS.silver,
      gold: COLORS.gold,
      diamond: COLORS.diamond,
    };
    const tierEmojis: Record<string, string> = {
      free: '🆓',
      bronze: '🥉',
      silver: '⭐',
      gold: '💎',
      diamond: '👑',
    };
    return new EmbedBuilder()
      .setTitle(`${tierEmojis[tier] || '💎'} ${tier.charAt(0).toUpperCase() + tier.slice(1)} Premium`)
      .setColor((tierColors[tier] || COLORS.gold) as ColorResolvable)
      .setTimestamp();
  }

  public static modAction(
    action: string,
    target: { tag: string; id: string },
    moderator: { tag: string; id: string },
    reason: string,
    caseId?: number
  ): EmbedBuilder {
    const actionEmojis: Record<string, string> = {
      ban: '🔨', kick: '👢', mute: '🔇', warn: '⚠️', unban: '🔓',
      unmute: '🔊', softban: '⚡', tempban: '⏱️', note: '📝', timeout: '⏰',
    };
    return new EmbedBuilder()
      .setTitle(`${actionEmojis[action.toLowerCase()] || '🛡️'} ${action.charAt(0).toUpperCase() + action.slice(1)}`)
      .setColor(COLORS.error as ColorResolvable)
      .addFields(
        { name: '👤 User', value: `${target.tag} (${target.id})`, inline: true },
        { name: '🛡️ Moderator', value: `${moderator.tag} (${moderator.id})`, inline: true },
        { name: '📝 Reason', value: reason, inline: false },
        ...(caseId !== undefined ? [{ name: '📋 Case #', value: `${caseId}`, inline: true }] : []),
      )
      .setTimestamp();
  }

  public static economy(title: string, description?: string, amount?: bigint | number, symbol = '₱'): EmbedBuilder {
    const embed = new EmbedBuilder()
      .setTitle(`💰 ${title}`)
      .setColor(COLORS.gold as ColorResolvable)
      .setDescription(description || null)
      .setTimestamp();
    if (amount !== undefined) {
      embed.addFields({ name: 'Amount', value: `${symbol}${Number(amount).toLocaleString()}`, inline: true });
    }
    return embed;
  }

  public static music(title: string, description?: string): EmbedBuilder {
    return new EmbedBuilder()
      .setTitle(`🎵 ${title}`)
      .setColor(COLORS.default as ColorResolvable)
      .setDescription(description || null)
      .setTimestamp();
  }

  public static loading(title: string, description?: string): EmbedBuilder {
    return new EmbedBuilder()
      .setTitle(`⏳ ${title}`)
      .setColor(COLORS.info as ColorResolvable)
      .setDescription(description || null);
  }

  public static custom(color: number, title: string, description?: string): EmbedBuilder {
    return new EmbedBuilder()
      .setTitle(title)
      .setColor(color as ColorResolvable)
      .setDescription(description || null)
      .setTimestamp();
  }
}
