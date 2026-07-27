// @ts-nocheck
/**
 * Giveaway model helpers — typed wrappers around Prisma's Giveaway and GiveawayEntry operations.
 */

import { getPrismaClient } from '../client.js';
import type { Giveaway, GiveawayEntry, Prisma } from '@prisma/client';

export async function createGiveaway(
  data: Prisma.GiveawayCreateInput,
): Promise<Giveaway> {
  const prisma = getPrismaClient();
  return prisma.giveaway.create({ data });
}

export async function getGiveaway(id: string): Promise<(Giveaway & { entries: GiveawayEntry[] }) | null> {
  const prisma = getPrismaClient();
  return prisma.giveaway.findUnique({ where: { id }, include: { entries: true } });
}

export async function getActiveGiveaways(guildId: string): Promise<Giveaway[]> {
  const prisma = getPrismaClient();
  return prisma.giveaway.findMany({
    where: { guildId, isEnded: false, isPaused: false },
    orderBy: { endsAt: 'asc' },
  });
}

export async function getExpiredGiveaways(): Promise<Giveaway[]> {
  const prisma = getPrismaClient();
  return prisma.giveaway.findMany({
    where: { isEnded: false, isPaused: false, endsAt: { lte: new Date() } },
  });
}

export async function updateGiveaway(
  id: string,
  data: Prisma.GiveawayUpdateInput,
): Promise<Giveaway> {
  const prisma = getPrismaClient();
  return prisma.giveaway.update({ where: { id }, data });
}

export async function endGiveaway(id: string, winners: string[]): Promise<Giveaway> {
  const prisma = getPrismaClient();
  return prisma.giveaway.update({
    where: { id },
    data: { isEnded: true, endedAt: new Date(), winners },
  });
}

export async function deleteGiveaway(id: string): Promise<void> {
  const prisma = getPrismaClient();
  await prisma.giveaway.delete({ where: { id } });
}

export async function enterGiveaway(
  giveawayId: string,
  userId: string,
  guildId: string,
  bonusEntries = 0,
): Promise<GiveawayEntry> {
  const prisma = getPrismaClient();
  return prisma.giveawayEntry.upsert({
    where: { giveawayId_userId: { giveawayId, userId } },
    create: { giveawayId, userId, guildId, entryCount: 1 + bonusEntries },
    update: { entryCount: { increment: bonusEntries } },
  });
}

export async function getEntries(giveawayId: string): Promise<GiveawayEntry[]> {
  const prisma = getPrismaClient();
  return prisma.giveawayEntry.findMany({ where: { giveawayId } });
}

/** Pick random winners weighted by entryCount. */
export function pickWinners(entries: GiveawayEntry[], count: number): string[] {
  const pool: string[] = [];
  for (const entry of entries) {
    for (let i = 0; i < entry.entryCount; i++) {
      pool.push(entry.userId);
    }
  }

  const winners = new Set<string>();
  while (winners.size < count && pool.length > 0) {
    const idx = Math.floor(Math.random() * pool.length);
    winners.add(pool[idx]);
    // Remove all entries of this winner to avoid duplicates
    for (let i = pool.length - 1; i >= 0; i--) {
      if (pool[i] === pool[idx]) pool.splice(i, 1);
    }
  }

  return [...winners];
}

export async function getGiveawayHistory(guildId: string, limit = 10): Promise<Giveaway[]> {
  const prisma = getPrismaClient();
  return prisma.giveaway.findMany({
    where: { guildId, isEnded: true },
    orderBy: { endedAt: 'desc' },
    take: limit,
  });
}
