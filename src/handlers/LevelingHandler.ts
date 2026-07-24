import { getPrismaClient } from '../database/postgresql/client';
import config from '../../config.json';

export interface LevelingConfig {
  xpPerMessage: { min: number; max: number };
  xpCooldownSeconds: number;
  levelUpNotification: boolean;
  stackRoles: boolean;
  voiceXpPerMinute: number;
}

export function calculateLevelFromXP(xp: number): number {
  let level = 0;
  let xpNeeded = 100;
  
  while (xp >= xpNeeded) {
    xp -= xpNeeded;
    level++;
    xpNeeded = Math.floor(xpNeeded * 1.5);
  }
  
  return level;
}

export function calculateXPForLevel(level: number): number {
  let totalXP = 0;
  let xpNeeded = 100;
  
  for (let i = 0; i < level; i++) {
    totalXP += xpNeeded;
    xpNeeded = Math.floor(xpNeeded * 1.5);
  }
  
  return totalXP;
}

export function getRandomXP(): number {
  const { min, max } = config.leveling.xpPerMessage;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export async function addXP(
  userId: string,
  guildId: string,
  amount: number
): Promise<{ newXP: number; newLevel: number; leveledUp: boolean }> {
  const prisma = getPrismaClient();
  
  try {
    const user = await prisma.user.findUnique({
      where: { userId_guildId: { userId, guildId } },
      include: { leveling: true },
    });

    if (!user) {
      return { newXP: 0, newLevel: 0, leveledUp: false };
    }

    const currentXP = user.leveling?.xp || 0;
    const newXP = currentXP + amount;
    const newLevel = calculateLevelFromXP(newXP);
    const currentLevel = user.leveling?.level || 0;
    const leveledUp = newLevel > currentLevel;

    await prisma.leveling.upsert({
      where: { userId_guildId: { userId, guildId } },
      update: {
        xp: newXP,
        level: newLevel,
        totalMessages: { increment: 1 },
      },
      create: {
        userId,
        guildId,
        xp: newXP,
        level: newLevel,
        totalMessages: 1,
      },
    });

    return { newXP, newLevel, leveledUp };
  } catch (error) {
    console.error('Error adding XP:', error);
    return { newXP: 0, newLevel: 0, leveledUp: false };
  }
}

export async function addVoiceXP(
  userId: string,
  guildId: string,
  minutes: number
): Promise<{ newXP: number; newLevel: number; leveledUp: boolean }> {
  const prisma = getPrismaClient();
  
  try {
    const user = await prisma.user.findUnique({
      where: { userId_guildId: { userId, guildId } },
      include: { leveling: true },
    });

    if (!user) {
      return { newXP: 0, newLevel: 0, leveledUp: false };
    }

    const xpToAdd = minutes * config.leveling.voiceXpPerMinute;
    const currentXP = user.leveling?.xp || 0;
    const newXP = currentXP + xpToAdd;
    const newLevel = calculateLevelFromXP(newXP);
    const currentLevel = user.leveling?.level || 0;
    const leveledUp = newLevel > currentLevel;

    await prisma.leveling.upsert({
      where: { userId_guildId: { userId, guildId } },
      update: {
        xp: newXP,
        level: newLevel,
        voiceMinutes: { increment: minutes },
      },
      create: {
        userId,
        guildId,
        xp: newXP,
        level: newLevel,
        voiceMinutes: minutes,
      },
    });

    return { newXP, newLevel, leveledUp };
  } catch (error) {
    console.error('Error adding voice XP:', error);
    return { newXP: 0, newLevel: 0, leveledUp: false };
  }
}

export async function getLeaderboard(guildId: string, limit: number = 10): Promise<any[]> {
  const prisma = getPrismaClient();
  
  try {
    const users = await prisma.leveling.findMany({
      where: { guildId },
      orderBy: { xp: 'desc' },
      take: limit,
      include: {
        user: true,
      },
    });

    return users.map((entry, index) => ({
      rank: index + 1,
      userId: entry.userId,
      xp: entry.xp,
      level: entry.level,
      totalMessages: entry.totalMessages,
      voiceMinutes: entry.voiceMinutes,
    }));
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }
}
