import { getPrismaClient } from '../database/postgresql/client';
import { Guild, User } from 'discord.js';
import { PremiumTier } from '../structures/BaseCommand';

export async function getUserPremiumTier(userId: string, guildId: string): Promise<PremiumTier> {
  const prisma = getPrismaClient();
  
  try {
    const user = await prisma.user.findUnique({
      where: {
        userId_guildId: {
          userId,
          guildId,
        },
      },
      select: {
        premiumTier: true,
        premiumExpiresAt: true,
      },
    });

    if (!user) {
      return 'free';
    }

    if (user.premiumExpiresAt && new Date() > user.premiumExpiresAt) {
      await prisma.user.update({
        where: { userId_guildId: { userId, guildId } },
        data: { premiumTier: 'free', premiumExpiresAt: null },
      });
      return 'free';
    }

    return user.premiumTier as PremiumTier || 'free';
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
      select: {
        premiumTier: true,
        premiumExpiresAt: true,
      },
    });

    if (!guild) {
      return 'free';
    }

    if (guild.premiumExpiresAt && new Date() > guild.premiumExpiresAt) {
      await prisma.guild.update({
        where: { guildId },
        data: { premiumTier: 'free', premiumExpiresAt: null },
      });
      return 'free';
    }

    return guild.premiumTier as PremiumTier || 'free';
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
    const premiumKey = await prisma.premiumKey.findUnique({
      where: { key },
    });

    if (!premiumKey) {
      return { success: false, error: 'Invalid premium key' };
    }

    if (premiumKey.activatedBy) {
      return { success: false, error: 'Premium key already used' };
    }

    const now = new Date();
    const expiresAt = premiumKey.isPermanent ? null : new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);

    await prisma.$transaction([
      prisma.premiumKey.update({
        where: { key },
        data: {
          activatedBy: userId,
          activatedAt: now,
        },
      }),
      prisma.user.update({
        where: { userId_guildId: { userId, guildId } },
        data: {
          premiumTier: premiumKey.tier as PremiumTier,
          premiumExpiresAt: expiresAt,
        },
        create: {
          userId,
          guildId,
          premiumTier: premiumKey.tier as PremiumTier,
          premiumExpiresAt: expiresAt,
        },
      }),
    ]);

    return { success: true, tier: premiumKey.tier as PremiumTier };
  } catch (error) {
    console.error('Error activating premium key:', error);
    return { success: false, error: 'Failed to activate premium key' };
  }
}

export async function hasPremiumAccess(
  userId: string,
  guildId: string,
  requiredTier: PremiumTier
): Promise<boolean> {
  const userTier = await getUserPremiumTier(userId, guildId);
  const guildTier = await getGuildPremiumTier(guildId);

  const tierOrder = ['free', 'bronze', 'silver', 'gold', 'diamond'];
  const userTierIndex = tierOrder.indexOf(userTier);
  const guildTierIndex = tierOrder.indexOf(guildTier);
  const requiredTierIndex = tierOrder.indexOf(requiredTier);

  return Math.max(userTierIndex, guildTierIndex) >= requiredTierIndex;
}
