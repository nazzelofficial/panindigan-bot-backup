// @ts-nocheck
import { getPrismaClient } from '../database/postgresql/client.js';
import { loggers } from '../utils/Logger.js';
import config from '../../config.json' with { type: 'json' };
export function calculateLevelFromXP(xp) {
    let level = 0;
    let xpNeeded = 100;
    let remaining = xp;
    while (remaining >= xpNeeded) {
        remaining -= xpNeeded;
        level++;
        xpNeeded = Math.floor(xpNeeded * 1.5);
    }
    return level;
}
export function calculateXPForLevel(level) {
    let totalXP = 0;
    let xpNeeded = 100;
    for (let i = 0; i < level; i++) {
        totalXP += xpNeeded;
        xpNeeded = Math.floor(xpNeeded * 1.5);
    }
    return totalXP;
}
export function getXPForNextLevel(currentXP) {
    const level = calculateLevelFromXP(currentXP);
    const xpForCurrentLevel = calculateXPForLevel(level);
    const xpForNextLevel = calculateXPForLevel(level + 1);
    return {
        current: currentXP - xpForCurrentLevel,
        required: xpForNextLevel - xpForCurrentLevel,
        remaining: xpForNextLevel - currentXP,
    };
}
export function getRandomXP() {
    const { min, max } = config.leveling.xpPerMessage;
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
export async function addXP(userId, guildId, amount) {
    const prisma = getPrismaClient();
    try {
        // Check cooldown
        const existing = await prisma.leveling.findUnique({
            where: { userId_guildId: { userId, guildId } },
        });
        const now = new Date();
        if (existing?.lastXpAt) {
            const elapsed = (now.getTime() - existing.lastXpAt.getTime()) / 1000;
            if (elapsed < config.leveling.xpCooldownSeconds) {
                return {
                    newXP: existing.xp,
                    newLevel: existing.level,
                    leveledUp: false,
                    oldLevel: existing.level,
                };
            }
        }
        const currentXP = existing?.xp || 0;
        const currentLevel = existing?.level || 0;
        const newXP = currentXP + amount;
        const newLevel = calculateLevelFromXP(newXP);
        const leveledUp = newLevel > currentLevel;
        await prisma.leveling.upsert({
            where: { userId_guildId: { userId, guildId } },
            update: {
                xp: newXP,
                level: newLevel,
                totalMessages: { increment: 1 },
                totalXpEarned: { increment: amount },
                lastXpAt: now,
            },
            create: {
                userId,
                guildId,
                xp: newXP,
                level: newLevel,
                totalMessages: 1,
                totalXpEarned: amount,
                lastXpAt: now,
            },
        });
        return { newXP, newLevel, leveledUp, oldLevel: currentLevel };
    }
    catch (error) {
        loggers.leveling.error('Error adding XP', { userId, guildId, errorMessage: String(error) });
        return { newXP: 0, newLevel: 0, leveledUp: false, oldLevel: 0 };
    }
}
export async function addVoiceXP(userId, guildId, minutes) {
    const prisma = getPrismaClient();
    try {
        const existing = await prisma.leveling.findUnique({
            where: { userId_guildId: { userId, guildId } },
        });
        const xpToAdd = minutes * config.leveling.voiceXpPerMinute;
        const currentXP = existing?.xp || 0;
        const currentLevel = existing?.level || 0;
        const newXP = currentXP + xpToAdd;
        const newLevel = calculateLevelFromXP(newXP);
        const leveledUp = newLevel > currentLevel;
        await prisma.leveling.upsert({
            where: { userId_guildId: { userId, guildId } },
            update: {
                xp: newXP,
                level: newLevel,
                voiceMinutes: { increment: minutes },
                totalXpEarned: { increment: xpToAdd },
            },
            create: {
                userId,
                guildId,
                xp: newXP,
                level: newLevel,
                voiceMinutes: minutes,
                totalXpEarned: xpToAdd,
            },
        });
        return { newXP, newLevel, leveledUp };
    }
    catch (error) {
        loggers.leveling.error('Error adding voice XP', { userId, guildId, errorMessage: String(error) });
        return { newXP: 0, newLevel: 0, leveledUp: false };
    }
}
export async function getLeaderboard(guildId, limit = 10, page = 1) {
    const prisma = getPrismaClient();
    try {
        const [entries, total] = await Promise.all([
            prisma.leveling.findMany({
                where: { guildId },
                orderBy: { xp: 'desc' },
                take: limit,
                skip: (page - 1) * limit,
            }),
            prisma.leveling.count({ where: { guildId } }),
        ]);
        return {
            entries: entries.map((entry, index) => ({
                rank: (page - 1) * limit + index + 1,
                userId: entry.userId,
                xp: entry.xp,
                level: entry.level,
                totalMessages: entry.totalMessages,
                voiceMinutes: entry.voiceMinutes,
            })),
            total,
        };
    }
    catch (error) {
        loggers.leveling.error('Error fetching leaderboard', { guildId, errorMessage: String(error) });
        return { entries: [], total: 0 };
    }
}
export async function getUserRank(userId, guildId) {
    const prisma = getPrismaClient();
    try {
        const user = await prisma.leveling.findUnique({
            where: { userId_guildId: { userId, guildId } },
        });
        if (!user)
            return 0;
        const rank = await prisma.leveling.count({
            where: { guildId, xp: { gt: user.xp } },
        });
        return rank + 1;
    }
    catch {
        return 0;
    }
}
export async function setUserXP(userId, guildId, xp) {
    const prisma = getPrismaClient();
    const level = calculateLevelFromXP(xp);
    await prisma.leveling.upsert({
        where: { userId_guildId: { userId, guildId } },
        create: { userId, guildId, xp, level },
        update: { xp, level },
    });
}
