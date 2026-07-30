/**
 * ═══════════════════════════════════════════════════
 *  Panindigan Premium Formatters
 *  Professional formatting utilities
 * ═══════════════════════════════════════════════════
 */

// ─── Duration Formatter ───────────────────────────────────────────────────────────
export class DurationFormatter {
  /**
   * Format milliseconds to human-readable duration
   */
  static format(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}d ${hours % 24}h ${minutes % 60}m`;
    }
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    }
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  }

  /**
   * Format milliseconds to time format (HH:MM:SS)
   */
  static formatTime(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
    }
    return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
  }

  /**
   * Format milliseconds to short time format (MM:SS)
   */
  static formatShort(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
  }

  /**
   * Format milliseconds to precise format (Xh Ym Zs)
   */
  static formatPrecise(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    const parts: string[] = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours % 24}h`);
    if (minutes > 0) parts.push(`${minutes % 60}m`);
    if (seconds > 0 || parts.length === 0) parts.push(`${seconds % 60}s`);

    return parts.join(' ');
  }

  /**
   * Parse human-readable duration to milliseconds
   */
  static parse(duration: string): number {
    const regex = /(\d+)(d|h|m|s)/g;
    let total = 0;
    let match;

    while ((match = regex.exec(duration)) !== null) {
      const value = parseInt(match[1]);
      const unit = match[2];

      switch (unit) {
        case 'd':
          total += value * 24 * 60 * 60 * 1000;
          break;
        case 'h':
          total += value * 60 * 60 * 1000;
          break;
        case 'm':
          total += value * 60 * 1000;
          break;
        case 's':
          total += value * 1000;
          break;
      }
    }

    return total;
  }
}

// ─── Number Formatter ─────────────────────────────────────────────────────────────
export class NumberFormatter {
  /**
   * Format number with commas
   */
  static format(num: number): string {
    return num.toLocaleString();
  }

  /**
   * Format number with specified decimal places
   */
  static formatDecimal(num: number, decimals: number = 2): string {
    return num.toFixed(decimals);
  }

  /**
   * Format number as percentage
   */
  static formatPercentage(num: number, decimals: number = 1): string {
    return `${num.toFixed(decimals)}%`;
  }

  /**
   * Format number as currency (Philippine Peso)
   */
  static formatCurrency(num: number, symbol: string = '₱'): string {
    return `${symbol}${num.toLocaleString()}`;
  }

  /**
   * Format number with suffix (K, M, B, T)
   */
  static formatCompact(num: number): string {
    if (num >= 1e12) return `${(num / 1e12).toFixed(1)}T`;
    if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
    return num.toString();
  }

  /**
   * Format number with ordinal suffix (1st, 2nd, 3rd, etc.)
   */
  static formatOrdinal(num: number): string {
    const suffixes = ['th', 'st', 'nd', 'rd'];
    const value = num % 100;
    const suffix = suffixes[(value - 20) % 10] || suffixes[value] || suffixes[0];
    return `${num}${suffix}`;
  }

  /**
   * Format bytes to human-readable format
   */
  static formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  }
}

// ─── Relative Time Formatter ───────────────────────────────────────────────────────
export class RelativeTimeFormatter {
  /**
   * Format date as relative time (e.g., "2 hours ago")
   */
  static format(date: Date | string): string {
    const now = new Date();
    const target = typeof date === 'string' ? new Date(date) : date;
    const diff = now.getTime() - target.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (years > 0) return `${years} year${years !== 1 ? 's' : ''} ago`;
    if (months > 0) return `${months} month${months !== 1 ? 's' : ''} ago`;
    if (weeks > 0) return `${weeks} week${weeks !== 1 ? 's' : ''} ago`;
    if (days > 0) return `${days} day${days !== 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    if (seconds > 0) return `${seconds} second${seconds !== 1 ? 's' : ''} ago`;
    return 'just now';
  }

  /**
   * Format date as relative time in future (e.g., "in 2 hours")
   */
  static formatFuture(date: Date | string): string {
    const now = new Date();
    const target = typeof date === 'string' ? new Date(date) : date;
    const diff = target.getTime() - now.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (years > 0) return `in ${years} year${years !== 1 ? 's' : ''}`;
    if (months > 0) return `in ${months} month${months !== 1 ? 's' : ''}`;
    if (weeks > 0) return `in ${weeks} week${weeks !== 1 ? 's' : ''}`;
    if (days > 0) return `in ${days} day${days !== 1 ? 's' : ''}`;
    if (hours > 0) return `in ${hours} hour${hours !== 1 ? 's' : ''}`;
    if (minutes > 0) return `in ${minutes} minute${minutes !== 1 ? 's' : ''}`;
    if (seconds > 0) return `in ${seconds} second${seconds !== 1 ? 's' : ''}`;
    return 'now';
  }

  /**
   * Format date in a specific format
   */
  static formatDate(date: Date | string, format: 'short' | 'long' | 'full' = 'short'): string {
    const target = typeof date === 'string' ? new Date(date) : date;

    switch (format) {
      case 'short':
        return target.toLocaleDateString();
      case 'long':
        return target.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      case 'full':
        return target.toLocaleString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
  }
}

// ─── Permission Formatter ────────────────────────────────────────────────────────
export class PermissionFormatter {
  /**
   * Format permission flags to human-readable names
   */
  static formatPermissions(permissions: bigint | string[]): string {
    if (Array.isArray(permissions)) {
      return permissions.map(p => this.formatPermission(p)).join(', ');
    }

    const permissionNames: string[] = [];
    const flags = typeof permissions === 'bigint' ? permissions : BigInt(permissions);

    // Common permission flags
    const permissionMap: Record<string, string> = {
      '1': 'Create Instant Invite',
      '2': 'Manage Channels',
      '4': 'Add Reactions',
      '8': 'View Audit Log',
      '16': 'Priority Speaker',
      '32': 'Stream',
      '64': 'Read Messages',
      '128': 'Send Messages',
      '256': 'Send TTS Messages',
      '512': 'Manage Messages',
      '1024': 'Embed Links',
      '2048': 'Attach Files',
      '4096': 'Read Message History',
      '8192': 'Mention Everyone',
      '16384': 'Use External Emojis',
      '32768': 'View Guild Insights',
      '65536': 'Connect',
      '131072': 'Speak',
      '262144': 'Mute Members',
      '524288': 'Deafen Members',
      '1048576': 'Move Members',
      '2097152': 'Use Voice Activity',
      '4194304': 'Change Nickname',
      '8388608': 'Manage Nicknames',
      '16777216': 'Manage Roles',
      '33554432': 'Manage Webhooks',
      '67108864': 'Manage Expressions',
      '134217728': 'Manage Events',
      '268435456': 'Manage Threads',
      '536870912': 'Create Public Threads',
      '1073741824': 'Create Private Threads',
      '2147483648': 'Use External Stickers',
      '4294967296': 'Manage Messages',
      '8589934592': 'Manage Applications',
      '17179869184': 'Manage Guild',
    };

    for (const [flag, name] of Object.entries(permissionMap)) {
      if ((flags & BigInt(flag)) === BigInt(flag)) {
        permissionNames.push(name as string);
      }
    }

    return permissionNames.length > 0 ? permissionNames.join(', ') : 'None';
  }

  /**
   * Format single permission flag to human-readable name
   */
  static formatPermission(permission: string): string {
    const permissionMap: Record<string, string> = {
      CREATE_INSTANT_INVITE: 'Create Instant Invite',
      KICK_MEMBERS: 'Kick Members',
      BAN_MEMBERS: 'Ban Members',
      ADMINISTRATOR: 'Administrator',
      MANAGE_CHANNELS: 'Manage Channels',
      MANAGE_GUILD: 'Manage Server',
      ADD_REACTIONS: 'Add Reactions',
      VIEW_AUDIT_LOG: 'View Audit Log',
      PRIORITY_SPEAKER: 'Priority Speaker',
      STREAM: 'Stream',
      READ_MESSAGES: 'Read Messages',
      SEND_MESSAGES: 'Send Messages',
      SEND_TTS_MESSAGES: 'Send TTS Messages',
      MANAGE_MESSAGES: 'Manage Messages',
      EMBED_LINKS: 'Embed Links',
      ATTACH_FILES: 'Attach Files',
      READ_MESSAGE_HISTORY: 'Read Message History',
      MENTION_EVERYONE: 'Mention Everyone',
      USE_EXTERNAL_EMOJIS: 'Use External Emojis',
      VIEW_GUILD_INSIGHTS: 'View Server Insights',
      CONNECT: 'Connect',
      SPEAK: 'Speak',
      MUTE_MEMBERS: 'Mute Members',
      DEAFEN_MEMBERS: 'Deafen Members',
      MOVE_MEMBERS: 'Move Members',
      USE_VOICE_ACTIVITY: 'Use Voice Activity',
      CHANGE_NICKNAME: 'Change Nickname',
      MANAGE_NICKNAMES: 'Manage Nicknames',
      MANAGE_ROLES: 'Manage Roles',
      MANAGE_WEBHOOKS: 'Manage Webhooks',
      MANAGE_EXPRESSIONS: 'Manage Expressions',
      MANAGE_EVENTS: 'Manage Events',
      MANAGE_THREADS: 'Manage Threads',
      CREATE_PUBLIC_THREADS: 'Create Public Threads',
      CREATE_PRIVATE_THREADS: 'Create Private Threads',
      USE_EXTERNAL_STICKERS: 'Use External Stickers',
      MANAGE_APPLICATIONS: 'Manage Applications',
    };

    return permissionMap[permission] || permission;
  }

  /**
   * Check if user has administrator permission
   */
  static isAdministrator(permissions: bigint | string[]): boolean {
    if (Array.isArray(permissions)) {
      return permissions.includes('ADMINISTRATOR');
    }
    const flags = typeof permissions === 'bigint' ? permissions : BigInt(permissions);
    return ((flags & 8n) === 8n);
  }

  /**
   * Check if user has moderator permissions
   */
  static isModerator(permissions: bigint | string[]): boolean {
    if (Array.isArray(permissions)) {
      return permissions.some(p => ['KICK_MEMBERS', 'BAN_MEMBERS', 'MANAGE_MESSAGES'].includes(p));
    }
    const flags = typeof permissions === 'bigint' ? permissions : BigInt(permissions);
    return ((flags & 2n) === 2n) || ((flags & 4n) === 4n) || ((flags & 512n) === 512n);
  }
}

// ─── Text Formatter ───────────────────────────────────────────────────────────────
export class TextFormatter {
  /**
   * Truncate text to specified length
   */
  static truncate(text: string, maxLength: number, suffix: string = '...'): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - suffix.length) + suffix;
  }

  /**
   * Capitalize first letter
   */
  static capitalize(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }

  /**
   * Convert to title case
   */
  static titleCase(text: string): string {
    return text
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Escape markdown characters
   */
  static escapeMarkdown(text: string): string {
    const markdownChars = ['\\', '*', '_', '~', '`', '>', '#', '+', '-', '|', '!', '{', '}', '[', ']', '(', ')', '.', '!'];
    let escaped = text;
    for (const char of markdownChars) {
      escaped = escaped.replace(new RegExp(`\\${char}`, 'g'), `\\${char}`);
    }
    return escaped;
  }

  /**
   * Clean text (remove special characters)
   */
  static clean(text: string): string {
    return text.replace(/[^\w\s]/gi, '').trim();
  }

  /**
   * Format code block
   */
  static codeBlock(text: string, language: string = ''): string {
    return `\`\`\`${language}\n${text}\n\`\`\``;
  }

  /**
   * Format inline code
   */
  static inlineCode(text: string): string {
    return `\`${text}\``;
  }

  /**
   * Format bold text
   */
  static bold(text: string): string {
    return `**${text}**`;
  }

  /**
   * Format italic text
   */
  static italic(text: string): string {
    return `*${text}*`;
  }

  /**
   * Format underline text
   */
  static underline(text: string): string {
    return `__${text}__`;
  }

  /**
   * Format strikethrough text
   */
  static strikethrough(text: string): string {
    return `~~${text}~~`;
  }

  /**
   * Format spoiler
   */
  static spoiler(text: string): string {
    return `||${text}||`;
  }

  /**
   * Format quote
   */
  static quote(text: string): string {
    return `> ${text}`;
  }

  /**
   * Format hyperlink
   */
  static hyperlink(text: string, url: string): string {
    return `[${text}](${url})`;
  }

  /**
   * Format mention
   */
  static mention(id: string, type: 'user' | 'role' | 'channel' = 'user'): string {
    switch (type) {
      case 'user':
        return `<@${id}>`;
      case 'role':
        return `<@&${id}>`;
      case 'channel':
        return `<#${id}>`;
    }
  }

  /**
   * Format timestamp
   */
  static timestamp(date: Date | number, style: 't' | 'T' | 'd' | 'D' | 'f' | 'F' | 'R' = 'f'): string {
    const timestamp = typeof date === 'number' ? date : Math.floor(date.getTime() / 1000);
    return `<t:${timestamp}:${style}>`;
  }
}

// ─── Export all formatters ──────────────────────────────────────────────────────────
export const Formatters = {
  duration: DurationFormatter,
  number: NumberFormatter,
  relativeTime: RelativeTimeFormatter,
  permission: PermissionFormatter,
  text: TextFormatter,
} as const;
