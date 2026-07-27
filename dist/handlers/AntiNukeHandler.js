// @ts-nocheck
import { EmbedBuilder } from 'discord.js';
import { getPrismaClient } from '../database/postgresql/client.js';
import { getRedisClient } from '../database/redis/client.js';
import { getCollection } from '../database/mongodb/client.js';
import { logger } from '../utils/Logger.js';
import { COLORS } from '../utils/Constants.js';
const DEFAULT_CONFIG = {
    banThreshold: 3,
    kickThreshold: 5,
    channelDeleteThreshold: 3,
    roleDeleteThreshold: 3,
    timeWindowSeconds: 10,
};
export class AntiNukeHandler {
    static instance;
    static getInstance() {
        if (!AntiNukeHandler.instance) {
            AntiNukeHandler.instance = new AntiNukeHandler();
        }
        return AntiNukeHandler.instance;
    }
    async trackAction(guildId, userId, actionType) {
        const redis = getRedisClient();
        if (!redis)
            return;
        const key = `antinuke:${guildId}:${userId}:${actionType}`;
        const now = Date.now();
        try {
            const raw = await redis.get(key);
            const timestamps = raw ? JSON.parse(raw) : [];
            timestamps.push(now);
            await redis.setEx(key, 60, JSON.stringify(timestamps));
        }
        catch (err) {
            logger.error('AntiNuke trackAction failed', { error: String(err) });
        }
    }
    async checkThreshold(guildId, userId, actionType, config = {}) {
        const redis = getRedisClient();
        if (!redis)
            return false;
        const mergedConfig = { ...DEFAULT_CONFIG, ...config };
        const thresholdMap = {
            ban: mergedConfig.banThreshold,
            kick: mergedConfig.kickThreshold,
            channelDelete: mergedConfig.channelDeleteThreshold,
            roleDelete: mergedConfig.roleDeleteThreshold,
            massRole: 3,
            webhookCreate: 3,
            memberPrune: 1,
        };
        const key = `antinuke:${guildId}:${userId}:${actionType}`;
        const windowMs = mergedConfig.timeWindowSeconds * 1000;
        const now = Date.now();
        try {
            const raw = await redis.get(key);
            if (!raw)
                return false;
            const timestamps = JSON.parse(raw);
            const recent = timestamps.filter((ts) => now - ts < windowMs);
            return recent.length >= thresholdMap[actionType];
        }
        catch {
            return false;
        }
    }
    async handleNukeAttempt(guild, userId, actionType, client) {
        logger.warn('AntiNuke triggered', { guildId: guild.id, userId, actionType });
        try {
            // 1. Strip all roles from the offending member
            const member = await guild.members.fetch(userId).catch(() => null);
            if (member && !member.user.bot) {
                const roles = member.roles.cache.filter(r => r.id !== guild.id);
                for (const [, role] of roles) {
                    await member.roles.remove(role, 'Anti-Nuke: Role strip').catch(() => { });
                }
                // 2. Timeout the member
                await member.timeout(3600000, 'Anti-Nuke protection triggered').catch(() => { });
            }
            // 3. DM the guild owner
            const owner = await guild.fetchOwner().catch(() => null);
            if (owner) {
                const embed = new EmbedBuilder()
                    .setTitle('🛡️ Anti-Nuke Alert!')
                    .setColor(COLORS.error)
                    .setDescription(`A potential nuke attempt was detected and blocked in **${guild.name}**.`)
                    .addFields({ name: '👤 User', value: `<@${userId}> (${userId})`, inline: true }, { name: '⚡ Action', value: actionType, inline: true }, { name: '🕐 Time', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: false }, { name: '🔧 Action Taken', value: 'Roles stripped, member timed out for 1 hour.', inline: false })
                    .setTimestamp();
                await owner.send({ embeds: [embed] }).catch(() => { });
            }
            // 4. Log to MongoDB
            const collection = getCollection('event_logs');
            await collection.insertOne({
                type: 'antinuke',
                guildId: guild.id,
                userId,
                actionType,
                timestamp: new Date(),
                actionsRolesStripped: true,
                memberTimedOut: true,
            });
            // 5. Log to guild log channel
            const prisma = getPrismaClient();
            const guildConfig = await prisma.guild.findUnique({ where: { guildId: guild.id } });
            if (guildConfig?.logChannelId) {
                const logChannel = guild.channels.cache.get(guildConfig.logChannelId);
                if (logChannel?.isTextBased()) {
                    const embed = new EmbedBuilder()
                        .setTitle('🛡️ Anti-Nuke Triggered')
                        .setColor(COLORS.error)
                        .addFields({ name: '👤 Offender', value: `<@${userId}>`, inline: true }, { name: '⚡ Action', value: actionType, inline: true }, { name: '🔧 Response', value: 'Roles stripped, timed out 1h', inline: false })
                        .setTimestamp();
                    await logChannel.send({ embeds: [embed] }).catch(() => { });
                }
            }
        }
        catch (err) {
            logger.error('AntiNuke handleNukeAttempt failed', { error: String(err) });
        }
    }
    async isWhitelisted(guildId, userId) {
        try {
            const prisma = getPrismaClient();
            const guild = await prisma.guild.findUnique({ where: { guildId } });
            if (!guild)
                return false;
            const whitelist = guild.antiNukeWhitelist;
            return whitelist.includes(userId);
        }
        catch {
            return false;
        }
    }
    async getAntiNukeConfig(guildId) {
        // Could be stored in guild config JSON field; return defaults for now
        return DEFAULT_CONFIG;
    }
    async getAuditLogs(guildId, limit = 20) {
        try {
            const collection = getCollection('event_logs');
            return await collection
                .find({ type: 'antinuke', guildId })
                .sort({ timestamp: -1 })
                .limit(limit)
                .toArray();
        }
        catch {
            return [];
        }
    }
    /**
     * Called from guild event handlers to check and act on destructive events
     */
    async onDestructiveAction(guild, executorId, actionType, client) {
        const prisma = getPrismaClient();
        const guildConfig = await prisma.guild.findUnique({ where: { guildId: guild.id } });
        if (!guildConfig?.antiNukeEnabled)
            return;
        // Check if executor is bot owner or whitelisted
        if (client.isOwner(executorId))
            return;
        if (await this.isWhitelisted(guild.id, executorId))
            return;
        // Check if guild owner
        if (executorId === guild.ownerId)
            return;
        await this.trackAction(guild.id, executorId, actionType);
        const nukeConfig = await this.getAntiNukeConfig(guild.id);
        const exceeded = await this.checkThreshold(guild.id, executorId, actionType, nukeConfig);
        if (exceeded) {
            await this.handleNukeAttempt(guild, executorId, actionType, client);
        }
    }
}
export const antiNukeHandler = AntiNukeHandler.getInstance();
