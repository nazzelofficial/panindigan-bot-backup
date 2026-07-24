import { getPrismaClient } from '../database/postgresql/client';
import { PremiumTier } from '../structures/BaseCommand';
import config from '../../config.json';

export async function getUserPremiumTier(userId: string, guildId: string): Promise<PremiumTier> {
  const prisma = getPrismaClient();

  try {
    const premium = await prisma.premium.findUnique({
      where: { userId_guildId: { userId, guildId } },
      select: { tier: true, expiresAt: true, isPermanent: true },
    });

    if (!premium) {
      // Also check User record for tier
      const user = await prisma.user.findUnique({
        where: { userId_guildId: { userId, guildId } },
        select: { premiumTier: true, premiumExpiresAt: true },
      });
      if (!user) return 'free';
      if (user.premiumExpiresAt && new Date() > user.premiumExpiresAt) {
        await prisma.user.update({
          where: { userId_guildId: { userId, guildId } },
          data: { premiumTier: 'free', premiumExpiresAt: null },
        });
        return 'free';
      }
      return (user.premiumTier as PremiumTier) || 'free';
    }

    if (!premium.isPermanent && premium.expiresAt && new Date() > premium.expiresAt) {
      await prisma.premium.update({
        where: { userId_guildId: { userId, guildId } },
        data: { tier: 'free', expiresAt: null },
      });
      return 'free';
    }

    return (premium.tier as PremiumTier) || 'free';
  } catch (error) {
    console.error('Error fetching user premium tier:', error);
    return 'free';
  }
}

export async function getGuildPremiumTier(guildId: string): Promise<PremiumTier> {
  const prisma = getPrismaClient();

  try {
    const guild = await prisma.guild.findUnique({
      where: { guildId },
      select: { premiumTier: true, premiumExpiresAt: true },
    });

    if (!guild) return 'free';

    if (guild.premiumExpiresAt && new Date() > guild.premiumExpiresAt) {
      await prisma.guild.update({
        where: { guildId },
        data: { premiumTier: 'free', premiumExpiresAt: null },
      });
      return 'free';
    }

    return (guild.premiumTier as PremiumTier) || 'free';
  } catch (error) {
    console.error('Error fetching guild premium tier:', error);
    return 'free';
  }
}

export async function activatePremiumKey(
  userId: string,
  guildId: string,
  key: string
): Promise<{ success: boolean; tier?: PremiumTier; error?: string }> {
  const prisma = getPrismaClient();

  try {
    const premiumKey = await prisma.premiumKey.findUnique({ where: { key } });

    if (!premiumKey) return { success: false, error: 'Invalid premium key' };
    if (premiumKey.isRevoked) return { success: false, error: 'This key has been revoked' };
    if (premiumKey.activatedBy) return { success: false, error: 'Premium key already used' };

    const now = new Date();

    await prisma.$transaction([
      prisma.premiumKey.update({
        where: { key },
        data: { activatedBy: userId, activatedAt: now },
      }),
      prisma.premium.upsert({
        where: { userId_guildId: { userId, guildId } },
        create: {
          userId,
          guildId,
          tier: premiumKey.tier,
          key,
          activatedAt: now,
          expiresAt: premiumKey.isPermanent ? null : new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000),
          isPermanent: premiumKey.isPermanent,
        },
        update: {
          tier: premiumKey.tier,
          key,
          activatedAt: now,
          expiresAt: premiumKey.isPermanent ? null : new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000),
          isPermanent: premiumKey.isPermanent,
        },
      }),
      prisma.user.upsert({
        where: { userId_guildId: { userId, guildId } },
        create: {
          userId,
          guildId,
          premiumTier: premiumKey.tier,
          premiumActivatedAt: now,
          premiumExpiresAt: premiumKey.isPermanent ? null : new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000),
        },
        update: {
          premiumTier: premiumKey.tier,
          premiumActivatedAt: now,
          premiumExpiresAt: premiumKey.isPermanent ? null : new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000),
        },
      }),
    ]);

    return { success: true, tier: premiumKey.tier as PremiumTier };
  } catch (error) {
    console.error('Error activating premium key:', error);
    return { success: false, error: 'Failed to activate premium key' };
  }
}

export async function activateFreeTrial(
  userId: string,
  guildId: string
): Promise<{ success: boolean; error?: string }> {
  if (!config.premium.trial.enabled) {
    return { success: false, error: 'Free trial is currently disabled' };
  }

  const prisma = getPrismaClient();

  try {
    const user = await prisma.user.findUnique({
      where: { userId_guildId: { userId, guildId } },
      select: { trialUsed: true },
    });

    if (user?.trialUsed) {
      return { success: false, error: 'You have already used your free trial' };
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + config.premium.trial.durationDays * 24 * 60 * 60 * 1000);

    await prisma.$transaction([
      prisma.user.upsert({
        where: { userId_guildId: { userId, guildId } },
        create: { userId, guildId, trialUsed: true, premiumTier: config.premium.trial.tier, premiumExpiresAt: expiresAt },
        update: { trialUsed: true, premiumTier: config.premium.trial.tier, premiumExpiresAt: expiresAt },
      }),
      prisma.premium.upsert({
        where: { userId_guildId: { userId, guildId } },
        create: { userId, guildId, tier: config.premium.trial.tier, activatedAt: now, expiresAt, isPermanent: false },
        update: { tier: config.premium.trial.tier, activatedAt: now, expiresAt, isPermanent: false },
      }),
    ]);

    return { success: true };
  } catch (error) {
    console.error('Error activating free trial:', error);
    return { success: false, error: 'Failed to activate free trial' };
  }
}

export async function hasPremiumAccess(
  userId: string,
  guildId: string,
  requiredTier: PremiumTier
): Promise<boolean> {
  const tierOrder: PremiumTier[] = ['free', 'bronze', 'silver', 'gold', 'diamond'];

  const [userTier, guildTier] = await Promise.all([
    getUserPremiumTier(userId, guildId),
    getGuildPremiumTier(guildId),
  ]);

  const userIdx = tierOrder.indexOf(userTier);
  const guildIdx = tierOrder.indexOf(guildTier);
  const requiredIdx = tierOrder.indexOf(requiredTier);

  return Math.max(userIdx, guildIdx) >= requiredIdx;
}

export function tierHierarchy(tier: PremiumTier): number {
  const order: PremiumTier[] = ['free', 'bronze', 'silver', 'gold', 'diamond'];
  return order.indexOf(tier);
}

export function getTierLabel(tier: PremiumTier): string {
  const labels: Record<PremiumTier, string> = {
    free: '🆓 Free',
    bronze: '🥉 Bronze',
    silver: '⭐ Silver',
    gold: '💎 Gold',
    diamond: '👑 Diamond',
  };
  return labels[tier] || '🆓 Free';
}
