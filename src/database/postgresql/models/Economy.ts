/**
 * Economy model helpers — typed wrappers around Prisma's Economy operations.
 */

import { getPrismaClient } from '../client';
import type { Economy, Prisma } from '@prisma/client';

export async function findOrCreateEconomy(userId: string, guildId: string): Promise<Economy> {
  const prisma = getPrismaClient();
  return prisma.economy.upsert({
    where: { userId_guildId: { userId, guildId } },
    create: { userId, guildId },
    update: {},
  });
}

export async function getEconomy(userId: string, guildId: string): Promise<Economy | null> {
  const prisma = getPrismaClient();
  return prisma.economy.findUnique({ where: { userId_guildId: { userId, guildId } } });
}

export async function updateEconomy(
  userId: string,
  guildId: string,
  data: Prisma.EconomyUpdateInput,
): Promise<Economy> {
  const prisma = getPrismaClient();
  return prisma.economy.upsert({
    where: { userId_guildId: { userId, guildId } },
    create: { userId, guildId, ...(data as Prisma.EconomyCreateInput) },
    update: data,
  });
}

/** Add or subtract from the user's wallet (clamps at 0). */
export async function adjustWallet(
  userId: string,
  guildId: string,
  amount: bigint,
): Promise<Economy> {
  const prisma = getPrismaClient();
  const eco = await findOrCreateEconomy(userId, guildId);
  const newWallet = eco.wallet + amount < 0n ? 0n : eco.wallet + amount;
  return prisma.economy.update({
    where: { userId_guildId: { userId, guildId } },
    data: { wallet: newWallet },
  });
}

/** Transfer from wallet to bank. */
export async function deposit(userId: string, guildId: string, amount: bigint): Promise<Economy> {
  const prisma = getPrismaClient();
  const eco = await findOrCreateEconomy(userId, guildId);
  const depositAmount = amount > eco.wallet ? eco.wallet : amount;
  return prisma.economy.update({
    where: { userId_guildId: { userId, guildId } },
    data: {
      wallet: eco.wallet - depositAmount,
      bank: eco.bank + depositAmount,
    },
  });
}

/** Transfer from bank to wallet. */
export async function withdraw(userId: string, guildId: string, amount: bigint): Promise<Economy> {
  const prisma = getPrismaClient();
  const eco = await findOrCreateEconomy(userId, guildId);
  const withdrawAmount = amount > eco.bank ? eco.bank : amount;
  return prisma.economy.update({
    where: { userId_guildId: { userId, guildId } },
    data: {
      wallet: eco.wallet + withdrawAmount,
      bank: eco.bank - withdrawAmount,
    },
  });
}

/** Richest users in a guild (by wallet + bank). */
export async function getRichestUsers(
  guildId: string,
  limit = 10,
): Promise<Economy[]> {
  const prisma = getPrismaClient();
  return prisma.economy.findMany({
    where: { guildId },
    orderBy: [{ wallet: 'desc' }, { bank: 'desc' }],
    take: limit,
  });
}

export async function isCooldownExpired(
  eco: Economy,
  field: keyof Pick<
    Economy,
    | 'lastDaily'
    | 'lastWeekly'
    | 'lastMonthly'
    | 'lastWork'
    | 'lastCrime'
    | 'lastRob'
    | 'lastBeg'
    | 'lastFish'
    | 'lastHunt'
    | 'lastMine'
    | 'lastFarm'
    | 'lastChop'
    | 'lastDig'
  >,
  cooldownMs: number,
): Promise<boolean> {
  const last = eco[field] as Date | null;
  if (!last) return true;
  return Date.now() - last.getTime() >= cooldownMs;
}
