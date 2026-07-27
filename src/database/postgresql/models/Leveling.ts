// @ts-nocheck
/**
 * Leveling model helpers — typed wrappers around Prisma's Leveling operations.
 */

import { getPrismaClient } from '../client.js';
import type { Leveling, Prisma } from '@prisma/client';
import { calculateLevelFromXP, getXPForNextLevel } from '../../../handlers/LevelingHandler.js';

export async function findOrCreateLeveling(userId: string, guildId: string): Promise<Leveling> {
  const prisma = getPrismaClient();
  return prisma.leveling.upsert({
    where: { userId_guildId: { userId, guildId } },
    create: { userId, guildId },
    update: {},
  });
}

export async function getLeveling(userId: string, guildId: string): Promise<Leveling | null> {
  const prisma = getPrismaClient();
  return prisma.leveling.findUnique({ where: { userId_guildId: { userId, guildId } } });
}

export async function updateLeveling(
  userId: string,
  guildId: string,
  data: Prisma.LevelingUpdateInput,
): Promise<Leveling> {
  const prisma = getPrismaClient();
  return prisma.leveling.upsert({
    where: { userId_guildId: { userId, guildId } },
    create: { userId, guildId, ...(data as Prisma.LevelingCreateInput) },
    update: data,
  });
}

export async function getServerLeaderboard(
  guildId: string,
  limit = 10,
): Promise<Leveling[]> {
  const prisma = getPrismaClient();
  return prisma.leveling.findMany({
    where: { guildId },
    orderBy: { xp: 'desc' },
    take: limit,
  });
}

export async function getUserRank(userId: string, guildId: string): Promise<number> {
  const prisma = getPrismaClient();
  const user = await getLeveling(userId, guildId);
  if (!user) return 0;

  const rank = await prisma.leveling.count({
    where: { guildId, xp: { gt: user.xp } },
  });

  return rank + 1;
}

export interface LevelCard {
  userId: string;
  guildId: string;
  level: number;
  xp: number;
  xpForNextLevel: { current: number; required: number; remaining: number };
  rank: number;
  totalMessages: number;
  voiceMinutes: number;
  rankCardColor: string;
  rankCardBg: string | null;
}

export async function getLevelCard(userId: string, guildId: string): Promise<LevelCard | null> {
  const leveling = await getLeveling(userId, guildId);
  if (!leveling) return null;

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

export async function setXP(userId: string, guildId: string, xp: number): Promise<Leveling> {
  const level = calculateLevelFromXP(xp);
  return updateLeveling(userId, guildId, { xp, level });
}

export async function resetLeveling(guildId: string, userId?: string): Promise<void> {
  const prisma = getPrismaClient();
  if (userId) {
    await prisma.leveling.updateMany({
      where: { userId, guildId },
      data: { xp: 0, level: 0, totalMessages: 0, voiceMinutes: 0, totalXpEarned: 0 },
    });
  } else {
    await prisma.leveling.updateMany({
      where: { guildId },
      data: { xp: 0, level: 0, totalMessages: 0, voiceMinutes: 0, totalXpEarned: 0 },
    });
  }
}
