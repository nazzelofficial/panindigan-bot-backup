// @ts-nocheck
import { PermissionFlagsBits } from 'discord.js';
import { getPrismaClient } from '../database/postgresql/client.js';
import { getRedisClient } from '../database/redis/client.js';
import { getCollection } from '../database/mongodb/client.js';
import { logger } from '../utils/Logger.js';
const SPAM_WINDOW_MS = 5000;
const SPAM_THRESHOLD = 5;
const PHISHING_DOMAINS = [
    'discord-gift', 'discordgift', 'discordnitro', 'free-nitro',
    'steamgift', 'csgo-skin', 'bit.ly/discord', 'tinyurl.com/discord',
];
export class AutoModHandler {
    async checkMessage(message, client) {
        if (!message.guild || !message.member)
            return;
        if (message.member.permissions.has(PermissionFlagsBits.ManageMessages))
            return;
        if (message.author.bot)
            return;
        const prisma = getPrismaClient();
        const guild = await prisma.guild.findUnique({ where: { guildId: message.guild.id } });
        if (!guild)
            return;
        const violations = [];
        if (guild.antiSpamEnabled) {
            const isSpam = await this.checkSpam(message);
            if (isSpam)
                violations.push('spam');
        }
        if (guild.antiLinkEnabled) {
            const hasLink = this.checkLinks(message);
            if (hasLink)
                violations.push('link');
        }
        if (guild.antiSwearEnabled && guild.antiSwearWords?.length) {
            const hasSwear = this.checkBadWords(message, guild.antiSwearWords);
            if (hasSwear)
                violations.push('swear');
        }
        if (violations.length > 0) {
            await this.handleViolation(message, violations[0], guild);
        }
    }
    async checkSpam(message) {
        const redis = getRedisClient();
        if (!redis)
            return false;
        const key = `automod:spam:${message.guild.id}:${message.author.id}`;
        const now = Date.now();
        try {
            const raw = await redis.get(key);
            let timestamps = raw ? JSON.parse(raw) : [];
            // Filter to recent window
            timestamps = timestamps.filter(ts => now - ts < SPAM_WINDOW_MS);
            timestamps.push(now);
            await redis.setEx(key, 10, JSON.stringify(timestamps));
            return timestamps.length >= SPAM_THRESHOLD;
        }
        catch {
            return false;
        }
    }
    checkLinks(message) {
        const urlRegex = /https?:\/\/[^\s]+|discord\.gg\/[^\s]+/gi;
        return urlRegex.test(message.content);
    }
    checkBadWords(message, words) {
        const lower = message.content.toLowerCase();
        return words.some(word => lower.includes(word.toLowerCase()));
    }
    checkPhishing(message) {
        const lower = message.content.toLowerCase();
        return PHISHING_DOMAINS.some(domain => lower.includes(domain));
    }
    async checkNewMember(member, client) {
        const prisma = getPrismaClient();
        const guild = await prisma.guild.findUnique({ where: { guildId: member.guild.id } });
        if (!guild?.antiAltEnabled)
            return;
        const accountAgeDays = (Date.now() - member.user.createdTimestamp) / 86400000;
        if (accountAgeDays < (guild.antiAltMinAge || 7)) {
            try {
                await member.send(`⛔ Your account is too new to join **${member.guild.name}**.\n` +
                    `Your account must be at least **${guild.antiAltMinAge || 7} days old**.`).catch(() => { });
                await member.kick(`Anti-alt: Account is ${Math.floor(accountAgeDays)} days old (minimum: ${guild.antiAltMinAge} days)`);
                logger.info('Anti-alt kicked member', { guildId: member.guild.id, userId: member.user.id });
            }
            catch (err) {
                logger.error('Anti-alt kick failed', { error: String(err) });
            }
        }
    }
    async handleViolation(message, violationType, guildConfig) {
        const { member, guild } = message;
        if (!member || !guild)
            return;
        try {
            await message.delete().catch(() => { });
        }
        catch { /* already deleted */ }
        const violationMessages = {
            spam: '🚫 Spam detected! Please slow down.',
            link: '🔗 Links are not allowed in this server.',
            swear: '🤬 Please keep your language appropriate.',
            phishing: '⚠️ Phishing/scam link detected!',
        };
        const warning = await message.channel.send({
            content: `${message.author}, ${violationMessages[violationType] || 'AutoMod violation detected.'}`,
        });
        setTimeout(() => warning.delete().catch(() => { }), 5000);
        // Log to MongoDB
        try {
            const collection = getCollection('event_logs');
            await collection.insertOne({
                type: 'automod',
                guildId: guild.id,
                userId: message.author.id,
                violation: violationType,
                content: message.content.slice(0, 500),
                timestamp: new Date(),
            });
        }
        catch { /* non-critical */ }
        // Check warning count and apply action
        try {
            const prisma = getPrismaClient();
            const mod = await prisma.moderation.upsert({
                where: { userId_guildId: { userId: message.author.id, guildId: guild.id } },
                create: {
                    userId: message.author.id,
                    guildId: guild.id,
                    warnings: [{ reason: `AutoMod: ${violationType}`, timestamp: new Date(), moderatorId: 'AUTOMOD' }],
                    cases: [],
                },
                update: {
                    warnings: {
                        push: { reason: `AutoMod: ${violationType}`, timestamp: new Date(), moderatorId: 'AUTOMOD' },
                    },
                },
            });
            const warningCount = mod.warnings.length;
            const maxWarnings = 3;
            if (warningCount >= maxWarnings) {
                await member.timeout(600000, `AutoMod: ${warningCount} violations`);
                await message.channel.send({
                    content: `⚠️ ${message.author} has been muted for 10 minutes due to repeated violations.`,
                }).then(m => setTimeout(() => m.delete().catch(() => { }), 8000));
            }
        }
        catch (err) {
            logger.error('AutoMod violation handling failed', { error: String(err) });
        }
    }
    async checkAntiRaid(guild, joinCount, timeWindowMs) {
        const redis = getRedisClient();
        if (!redis)
            return false;
        const key = `automod:raid:${guild.id}`;
        const now = Date.now();
        try {
            const raw = await redis.get(key);
            let joins = raw ? JSON.parse(raw) : [];
            joins = joins.filter((ts) => now - ts < timeWindowMs);
            joins.push(now);
            await redis.setEx(key, Math.ceil(timeWindowMs / 1000), JSON.stringify(joins));
            return joins.length >= joinCount;
        }
        catch {
            return false;
        }
    }
}
export const autoModHandler = new AutoModHandler();
