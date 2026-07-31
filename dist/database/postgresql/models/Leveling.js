// @ts-nocheck
/**
 * Leveling model helpers — typed wrappers around Prisma's Leveling operations.
 */
import { getPrismaClient } from '../client.js';
import { calculateLevelFromXP, getXPForNextLevel } from '../../../handlers/LevelingHandler.js';
export async function findOrCreateLeveling(userId, guildId) {
    const prisma = getPrismaClient();
    return prisma.leveling.upsert({
        where: { userId_guildId: { userId, guildId } },
        create: { userId, guildId },
        update: {},
    });
}
export async function getLeveling(userId, guildId) {
    const prisma = getPrismaClient();
    return prisma.leveling.findUnique({ where: { userId_guildId: { userId, guildId } } });
}
export async function updateLeveling(userId, guildId, data) {
    const prisma = getPrismaClient();
    return prisma.leveling.upsert({
        where: { userId_guildId: { userId, guildId } },
        create: { userId, guildId, ...data },
        update: data,
    });
}
export async function getServerLeaderboard(guildId, limit = 10) {
    const prisma = getPrismaClient();
    return prisma.leveling.findMany({
        where: { guildId },
        orderBy: { xp: 'desc' },
        take: limit,
    });
}
export async function getUserRank(userId, guildId) {
    const prisma = getPrismaClient();
    const user = await getLeveling(userId, guildId);
    if (!user)
        return 0;
    const rank = await prisma.leveling.count({
        where: { guildId, xp: { gt: user.xp } },
    });
    return rank + 1;
}
export async function getLevelCard(userId, guildId) {
    const leveling = await getLeveling(userId, guildId);
    if (!leveling)
        return null;
    const level = calculateLevelFromXP(leveling.xp);
    const rank = await getUserRank(userId, guildId);
    return {
        userId: leveling.userId,
        guildId: leveling.guildId,
        level,
        xp: leveling.xp,
        xpForNextLevel: getXPForNextLevel(leveling.xp),
        rank,
        totalMessages: leveling.totalMessages,
        voiceMinutes: leveling.voiceMinutes,
        rankCardColor: leveling.rankCardColor,
        rankCardBg: leveling.rankCardBg,
    };
}
export async function setXP(userId, guildId, xp) {
    const level = calculateLevelFromXP(xp);
    return updateLeveling(userId, guildId, { xp, level });
}
export async function resetLeveling(guildId, userId) {
    const prisma = getPrismaClient();
    if (userId) {
        await prisma.leveling.updateMany({
            where: { userId, guildId },
            data: { xp: 0, level: 0, totalMessages: 0, voiceMinutes: 0, totalXpEarned: 0 },
        });
    }
    else {
        await prisma.leveling.updateMany({
            where: { guildId },
            data: { xp: 0, level: 0, totalMessages: 0, voiceMinutes: 0, totalXpEarned: 0 },
        });
    }
}
//# sourceMappingURL=Leveling.js.map