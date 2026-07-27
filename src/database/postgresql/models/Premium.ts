// @ts-nocheck
/**
 * Premium model helpers — typed wrappers around Prisma's Premium and PremiumKey operations.
 * Supports the one-time permanent purchase model (Bronze → Silver → Gold → Diamond).
 */

import { getPrismaClient } from '../client.js';
import type { Premium, PremiumKey, Prisma } from '@prisma/client';
import type { PremiumTier } from '../../../structures/BaseCommand.js';

export const TIER_ORDER: PremiumTier[] = ['free', 'bronze', 'silver', 'gold', 'diamond'];

export function tierIndex(tier: PremiumTier): number {
  return TIER_ORDER.indexOf(tier);
}

export async function getPremium(userId: string, guildId: string): Promise<Premium | null> {
  const prisma = getPrismaClient();
  return prisma.premium.findUnique({ where: { userId_guildId: { userId, guildId } } });
}

export async function upsertPremium(
  userId: string,
  guildId: string,
  data: Partial<Prisma.PremiumCreateInput>,
): Promise<Premium> {
  const prisma = getPrismaClient();
  return prisma.premium.upsert({
    where: { userId_guildId: { userId, guildId } },
    create: { userId, guildId, ...data },
    update: { ...data },
  });
}

/** Generate a new premium key (called by owner commands). */
export async function generateKey(
  tier: PremiumTier,
  createdBy: string,
  notes?: string,
): Promise<PremiumKey> {
  const prisma = getPrismaClient();
  const key = generateKeyString(tier);
  return prisma.premiumKey.create({
    data: { key, tier, createdBy, notes, isPermanent: true },
  });
}

function generateKeyString(tier: string): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const segment = () =>
    Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `PANI-${tier.toUpperCase().slice(0, 2)}-${segment()}-${segment()}-${segment()}`;
}

export async function revokeKey(key: string, revokedBy: string): Promise<PremiumKey | null> {
  const prisma = getPrismaClient();
  const existing = await prisma.premiumKey.findUnique({ where: { key } });
  if (!existing) return null;
  return prisma.premiumKey.update({
    where: { key },
    data: { isRevoked: true, revokedAt: new Date(), notes: `Revoked by ${revokedBy}` },
  });
}

export async function getKeyInfo(key: string): Promise<PremiumKey | null> {
  const prisma = getPrismaClient();
  return prisma.premiumKey.findUnique({ where: { key } });
}

export async function listKeys(page = 1, perPage = 20): Promise<PremiumKey[]> {
  const prisma = getPrismaClient();
  return prisma.premiumKey.findMany({
    skip: (page - 1) * perPage,
    take: perPage,
    orderBy: { createdAt: 'desc' },
  });
}

export async function getAIImageCount(userId: string, guildId: string): Promise<number> {
  const prisma = getPrismaClient();
  const premium = await prisma.premium.findUnique({
    where: { userId_guildId: { userId, guildId } },
    select: { aiImageCount: true, aiImageResetDate: true },
  });
  if (!premium) return 0;

  // Reset daily count if the reset date is in the past
  const now = new Date();
  if (!premium.aiImageResetDate || premium.aiImageResetDate < now) {
    await prisma.premium.update({
      where: { userId_guildId: { userId, guildId } },
      data: {
        aiImageCount: 0,
        aiImageResetDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1),
      },
    });
    return 0;
  }

  return premium.aiImageCount;
}

export async function incrementAIImageCount(userId: string, guildId: string): Promise<void> {
  const prisma = getPrismaClient();
  await prisma.premium.upsert({
    where: { userId_guildId: { userId, guildId } },
    create: { userId, guildId, aiImageCount: 1 },
    update: { aiImageCount: { increment: 1 } },
  });
}
