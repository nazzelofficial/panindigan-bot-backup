// @ts-nocheck
import { EmbedBuilder, GuildMember, User } from 'discord.js';
import config from '../../config.json' with { type: 'json' };

export class Formatter {
  public static formatNumber(num: number): string {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  }

  public static formatCurrency(amount: number): string {
    return `${config.economy.currencySymbol}${this.formatNumber(amount)}`;
  }

  public static formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    }
    return `${secs}s`;
  }

  public static formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  public static formatRelativeTime(date: Date): string {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''}`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''}`;
    if (seconds > 0) return `${seconds} second${seconds > 1 ? 's' : ''}`;
    return 'now';
  }

  public static truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  }

  public static codeBlock(text: string, language: string = ''): string {
    return `\`\`\`${language}\n${text}\n\`\`\``;
  }

  public static inlineCode(text: string): string {
    return `\`${text}\``;
  }

  public static bold(text: string): string {
    return `**${text}**`;
  }

  public static italic(text: string): string {
    return `*${text}*`;
  }

  public static underline(text: string): string {
    return `__${text}__`;
  }

  public static strikethrough(text: string): string {
    return `~~${text}~~`;
  }

  public static spoiler(text: string): string {
    return `||${text}||`;
  }

  public static hyperlink(text: string, url: string): string {
    return `[${text}](${url})`;
  }

  public static createEmbed(options: {
    title?: string;
    description?: string;
    color?: number;
    fields?: Array<{ name: string; value: string; inline?: boolean }>;
    footer?: string;
    timestamp?: boolean;
    thumbnail?: string;
    image?: string;
    author?: { name: string; iconURL?: string };
  }): EmbedBuilder {
    const embed = new EmbedBuilder();

    if (options.title) embed.setTitle(options.title);
    if (options.description) embed.setDescription(options.description);
    if (options.color) embed.setColor(options.color);
    if (options.fields) embed.addFields(options.fields);
    if (options.footer) embed.setFooter({ text: options.footer });
    if (options.timestamp) embed.setTimestamp();
    if (options.thumbnail) embed.setThumbnail(options.thumbnail);
    if (options.image) embed.setImage(options.image);
    if (options.author) embed.setAuthor(options.author);

    return embed;
  }

  public static getUserTag(user: User | GuildMember): string {
    return user instanceof GuildMember ? user.user.tag : user.tag;
  }

  public static getAvatarURL(user: User | GuildMember, size: number = 256): string {
    const u = user instanceof GuildMember ? user.user : user;
    return u.displayAvatarURL({ size });
  }

  public static getBannerURL(user: User | GuildMember, size: number = 1024): string | null {
    const u = user instanceof GuildMember ? user.user : user;
    return u.bannerURL({ size });
  }

  public static progressBar(current: number, max: number, length: number = 10): string {
    const percentage = Math.min(1, Math.max(0, current / max));
    const filled = Math.round(percentage * length);
    const empty = length - filled;
    return '█'.repeat(filled) + '░'.repeat(empty);
  }

  public static capitalizeFirst(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }

  public static slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  public static escapeMarkdown(text: string): string {
    const specialChars = ['\\', '*', '_', '~', '`', '|', '>', '#'];
    let escaped = text;
    for (const char of specialChars) {
      escaped = escaped.replace(new RegExp(`\\${char}`, 'g'), `\\${char}`);
    }
    return escaped;
  }

  public static parseTime(timeString: string): number {
    const units: Record<string, number> = {
      s: 1,
      sec: 1,
      second: 1,
      seconds: 1,
      m: 60,
      min: 60,
      minute: 60,
      minutes: 60,
      h: 3600,
      hour: 3600,
      hours: 3600,
      d: 86400,
      day: 86400,
      days: 86400,
      w: 604800,
      week: 604800,
      weeks: 604800,
      mo: 2592000,
      month: 2592000,
      months: 2592000,
      y: 31536000,
      year: 31536000,
      years: 31536000,
    };

    const regex = /(\d+)\s*([a-zA-Z]+)/g;
    let match;
    let totalSeconds = 0;

    while ((match = regex.exec(timeString)) !== null) {
      const value = parseInt(match[1], 10);
      const unit = match[2].toLowerCase();
      const multiplier = units[unit];

      if (multiplier) {
        totalSeconds += value * multiplier;
      }
    }

    return totalSeconds;
  }
}
