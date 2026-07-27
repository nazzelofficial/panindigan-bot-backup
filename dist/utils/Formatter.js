// @ts-nocheck
import { EmbedBuilder, GuildMember } from 'discord.js';
import config from '../../config.json' with { type: 'json' };
export class Formatter {
    static formatNumber(num) {
        if (num >= 1000000) {
            return `${(num / 1000000).toFixed(1)}M`;
        }
        if (num >= 1000) {
            return `${(num / 1000).toFixed(1)}K`;
        }
        return num.toString();
    }
    static formatCurrency(amount) {
        return `${config.economy.currencySymbol}${this.formatNumber(amount)}`;
    }
    static formatDuration(seconds) {
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
    static formatDate(date) {
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    }
    static formatRelativeTime(date) {
        const now = new Date();
        const diff = date.getTime() - now.getTime();
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        if (days > 0)
            return `${days} day${days > 1 ? 's' : ''}`;
        if (hours > 0)
            return `${hours} hour${hours > 1 ? 's' : ''}`;
        if (minutes > 0)
            return `${minutes} minute${minutes > 1 ? 's' : ''}`;
        if (seconds > 0)
            return `${seconds} second${seconds > 1 ? 's' : ''}`;
        return 'now';
    }
    static truncate(text, maxLength) {
        if (text.length <= maxLength)
            return text;
        return text.substring(0, maxLength - 3) + '...';
    }
    static codeBlock(text, language = '') {
        return `\`\`\`${language}\n${text}\n\`\`\``;
    }
    static inlineCode(text) {
        return `\`${text}\``;
    }
    static bold(text) {
        return `**${text}**`;
    }
    static italic(text) {
        return `*${text}*`;
    }
    static underline(text) {
        return `__${text}__`;
    }
    static strikethrough(text) {
        return `~~${text}~~`;
    }
    static spoiler(text) {
        return `||${text}||`;
    }
    static hyperlink(text, url) {
        return `[${text}](${url})`;
    }
    static createEmbed(options) {
        const embed = new EmbedBuilder();
        if (options.title)
            embed.setTitle(options.title);
        if (options.description)
            embed.setDescription(options.description);
        if (options.color)
            embed.setColor(options.color);
        if (options.fields)
            embed.addFields(options.fields);
        if (options.footer)
            embed.setFooter({ text: options.footer });
        if (options.timestamp)
            embed.setTimestamp();
        if (options.thumbnail)
            embed.setThumbnail(options.thumbnail);
        if (options.image)
            embed.setImage(options.image);
        if (options.author)
            embed.setAuthor(options.author);
        return embed;
    }
    static getUserTag(user) {
        return user instanceof GuildMember ? user.user.tag : user.tag;
    }
    static getAvatarURL(user, size = 256) {
        const u = user instanceof GuildMember ? user.user : user;
        return u.displayAvatarURL({ size });
    }
    static getBannerURL(user, size = 1024) {
        const u = user instanceof GuildMember ? user.user : user;
        return u.bannerURL({ size });
    }
    static progressBar(current, max, length = 10) {
        const percentage = Math.min(1, Math.max(0, current / max));
        const filled = Math.round(percentage * length);
        const empty = length - filled;
        return '█'.repeat(filled) + '░'.repeat(empty);
    }
    static capitalizeFirst(text) {
        return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    }
    static slugify(text) {
        return text
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
    static escapeMarkdown(text) {
        const specialChars = ['\\', '*', '_', '~', '`', '|', '>', '#'];
        let escaped = text;
        for (const char of specialChars) {
            escaped = escaped.replace(new RegExp(`\\${char}`, 'g'), `\\${char}`);
        }
        return escaped;
    }
    static parseTime(timeString) {
        const units = {
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
