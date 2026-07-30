// @ts-nocheck
import { Guild, GuildMember, PermissionFlagsBits, EmbedBuilder, AuditLogEvent } from 'discord.js';
import { PanindiganClient } from '../structures/PanindiganClient.js';
import { getPrismaClient } from '../database/postgresql/client.js';
import { getRedisClient } from '../database/redis/client.js';
import { getCollection } from '../database/mongodb/client.js';
import { logger } from '../utils/Logger.js';
import { COLORS } from '../constants/DesignSystem.js';

export type AntiNukeActionType =
  | 'ban'
  | 'kick'
  | 'channelDelete'
  | 'roleDelete'
  | 'massRole'
  | 'webhookCreate'
  | 'memberPrune';

interface AntiNukeConfig {
  banThreshold: number;
  kickThreshold: number;
  channelDeleteThreshold: number;
  roleDeleteThreshold: number;
  timeWindowSeconds: number;
}

const DEFAULT_CONFIG: AntiNukeConfig = {
  banThreshold: 3,
  kickThreshold: 5,
  channelDeleteThreshold: 3,
  roleDeleteThreshold: 3,
  timeWindowSeconds: 10,
};

export class AntiNukeHandler {
  private static instance: AntiNukeHandler;

  public static getInstance(): AntiNukeHandler {
    if (!AntiNukeHandler.instance) {
      AntiNukeHandler.instance = new AntiNukeHandler();
    }
    return AntiNukeHandler.instance;
  }

  public async trackAction(guildId: string, userId: string, actionType: AntiNukeActionType): Promise<void> {
    const redis = getRedisClient();
    if (!redis) return;

    const key = `antinuke:${guildId}:${userId}:${actionType}`;
    const now = Date.now();

    try {
      const raw = await redis.get(key);
      const timestamps: number[] = raw ? JSON.parse(raw) : [];
      timestamps.push(now);
      await redis.setEx(key, 60, JSON.stringify(timestamps));
    } catch (err) {
      logger.error('AntiNuke trackAction failed', { error: String(err) });
    }
  }

  public async checkThreshold(
    guildId: string,
    userId: string,
    actionType: AntiNukeActionType,
    config: Partial<AntiNukeConfig> = {}
  ): Promise<boolean> {
    const redis = getRedisClient();
    if (!redis) return false;

    const mergedConfig = { ...DEFAULT_CONFIG, ...config };
    const thresholdMap: Record<AntiNukeActionType, number> = {
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
      if (!raw) return false;
      const timestamps: number[] = JSON.parse(raw);
      const recent = timestamps.filter((ts: number) => now - ts < windowMs);
      return recent.length >= thresholdMap[actionType];
    } catch {
      return false;
    }
  }

  public async handleNukeAttempt(
    guild: Guild,
    userId: string,
    actionType: AntiNukeActionType,
    client: PanindiganClient
  ): Promise<void> {
    logger.warn('AntiNuke triggered', { guildId: guild.id, userId, actionType });

    try {
      // 1. Strip all roles from the offending member
      const member = await guild.members.fetch(userId).catch(() => null);
      if (member && !member.user.bot) {
        const roles = member.roles.cache.filter(r => r.id !== guild.id);
        for (const [, role] of roles) {
          await member.roles.remove(role, 'Anti-Nuke: Role strip').catch(() => {});
        }

        // 2. Timeout the member
        await member.timeout(3600000, 'Anti-Nuke protection triggered').catch(() => {});
      }

      // 3. DM the guild owner
      const owner = await guild.fetchOwner().catch(() => null);
      if (owner) {
        const embed = new EmbedBuilder()
          .setTitle('🛡️ Anti-Nuke Alert!')
          .setColor(COLORS.error)
          .setDescription(`A potential nuke attempt was detected and blocked in **${guild.name}**.`)
          .addFields(
            { name: '👤 User', value: `<@${userId}> (${userId})`, inline: true },
            { name: '⚡ Action', value: actionType, inline: true },
            { name: '🕐 Time', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: false },
            { name: '🔧 Action Taken', value: 'Roles stripped, member timed out for 1 hour.', inline: false },
          )
          .setTimestamp();
        await owner.send({ embeds: [embed] }).catch(() => {});
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
            .addFields(
              { name: '👤 Offender', value: `<@${userId}>`, inline: true },
              { name: '⚡ Action', value: actionType, inline: true },
              { name: '🔧 Response', value: 'Roles stripped, timed out 1h', inline: false },
            )
            .setTimestamp();
          await logChannel.send({ embeds: [embed] }).catch(() => {});
        }
      }
    } catch (err) {
      logger.error('AntiNuke handleNukeAttempt failed', { error: String(err) });
    }
  }

  public async isWhitelisted(guildId: string, userId: string): Promise<boolean> {
    try {
      const prisma = getPrismaClient();
      const guild = await prisma.guild.findUnique({ where: { guildId } });
      if (!guild) return false;
      const whitelist = guild.antiNukeWhitelist as string[];
      return whitelist.includes(userId);
    } catch {
      return false;
    }
  }

  public async getAntiNukeConfig(guildId: string): Promise<AntiNukeConfig> {
    // Could be stored in guild config JSON field; return defaults for now
    return DEFAULT_CONFIG;
  }

  public async getAuditLogs(guildId: string, limit = 20): Promise<any[]> {
    try {
      const collection = getCollection('event_logs');
      return await collection
        .find({ type: 'antinuke', guildId })
        .sort({ timestamp: -1 })
        .limit(limit)
        .toArray();
    } catch {
      return [];
    }
  }

  /**
   * Called from guild event handlers to check and act on destructive events
   */
  public async onDestructiveAction(
    guild: Guild,
    executorId: string,
    actionType: AntiNukeActionType,
    client: PanindiganClient
  ): Promise<void> {
    const prisma = getPrismaClient();
    const guildConfig = await prisma.guild.findUnique({ where: { guildId: guild.id } });

    if (!guildConfig?.antiNukeEnabled) return;

    // Check if executor is bot owner or whitelisted
    if (client.isOwner(executorId)) return;
    if (await this.isWhitelisted(guild.id, executorId)) return;

    // Check if guild owner
    if (executorId === guild.ownerId) return;

    await this.trackAction(guild.id, executorId, actionType);
    const nukeConfig = await this.getAntiNukeConfig(guild.id);

    const exceeded = await this.checkThreshold(guild.id, executorId, actionType, nukeConfig);
    if (exceeded) {
      await this.handleNukeAttempt(guild, executorId, actionType, client);
    }
  }
}

export const antiNukeHandler = AntiNukeHandler.getInstance();
