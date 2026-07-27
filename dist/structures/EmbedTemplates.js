// @ts-nocheck
import { EmbedBuilder } from 'discord.js';
import { COLORS } from '../utils/Constants.js';
export class EmbedTemplates {
    static success(title, description) {
        return new EmbedBuilder()
            .setTitle(`✅ ${title}`)
            .setColor(COLORS.success)
            .setDescription(description || null)
            .setTimestamp();
    }
    static error(title, description) {
        return new EmbedBuilder()
            .setTitle(`❌ ${title}`)
            .setColor(COLORS.error)
            .setDescription(description || null)
            .setTimestamp();
    }
    static warning(title, description) {
        return new EmbedBuilder()
            .setTitle(`⚠️ ${title}`)
            .setColor(COLORS.warning)
            .setDescription(description || null)
            .setTimestamp();
    }
    static info(title, description) {
        return new EmbedBuilder()
            .setTitle(`ℹ️ ${title}`)
            .setColor(COLORS.info)
            .setDescription(description || null)
            .setTimestamp();
    }
    static premium(tier) {
        const tierColors = {
            bronze: COLORS.bronze,
            silver: COLORS.silver,
            gold: COLORS.gold,
            diamond: COLORS.diamond,
        };
        const tierEmojis = {
            free: '🆓',
            bronze: '🥉',
            silver: '⭐',
            gold: '💎',
            diamond: '👑',
        };
        return new EmbedBuilder()
            .setTitle(`${tierEmojis[tier] || '💎'} ${tier.charAt(0).toUpperCase() + tier.slice(1)} Premium`)
            .setColor((tierColors[tier] || COLORS.gold))
            .setTimestamp();
    }
    static modAction(action, target, moderator, reason, caseId) {
        const actionEmojis = {
            ban: '🔨', kick: '👢', mute: '🔇', warn: '⚠️', unban: '🔓',
            unmute: '🔊', softban: '⚡', tempban: '⏱️', note: '📝', timeout: '⏰',
        };
        return new EmbedBuilder()
            .setTitle(`${actionEmojis[action.toLowerCase()] || '🛡️'} ${action.charAt(0).toUpperCase() + action.slice(1)}`)
            .setColor(COLORS.error)
            .addFields({ name: '👤 User', value: `${target.tag} (${target.id})`, inline: true }, { name: '🛡️ Moderator', value: `${moderator.tag} (${moderator.id})`, inline: true }, { name: '📝 Reason', value: reason, inline: false }, ...(caseId !== undefined ? [{ name: '📋 Case #', value: `${caseId}`, inline: true }] : []))
            .setTimestamp();
    }
    static economy(title, description, amount, symbol = '₱') {
        const embed = new EmbedBuilder()
            .setTitle(`💰 ${title}`)
            .setColor(COLORS.gold)
            .setDescription(description || null)
            .setTimestamp();
        if (amount !== undefined) {
            embed.addFields({ name: 'Amount', value: `${symbol}${Number(amount).toLocaleString()}`, inline: true });
        }
        return embed;
    }
    static music(title, description) {
        return new EmbedBuilder()
            .setTitle(`🎵 ${title}`)
            .setColor(COLORS.default)
            .setDescription(description || null)
            .setTimestamp();
    }
    static loading(title, description) {
        return new EmbedBuilder()
            .setTitle(`⏳ ${title}`)
            .setColor(COLORS.info)
            .setDescription(description || null);
    }
    static custom(color, title, description) {
        return new EmbedBuilder()
            .setTitle(title)
            .setColor(color)
            .setDescription(description || null)
            .setTimestamp();
    }
}
