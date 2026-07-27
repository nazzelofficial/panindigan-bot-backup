// @ts-nocheck
/**
 * Premium model helpers — typed wrappers around Prisma's Premium and PremiumKey operations.
 * Supports the one-time permanent purchase model (Bronze → Silver → Gold → Diamond).
 */
import { getPrismaClient } from '../client.js';
export const TIER_ORDER = ['free', 'bronze', 'silver', 'gold', 'diamond'];
export function tierIndex(tier) {
    return TIER_ORDER.indexOf(tier);
}
export async function getPremium(userId, guildId) {
    const prisma = getPrismaClient();
    return prisma.premium.findUnique({ where: { userId_guildId: { userId, guildId } } });
}
export async function upsertPremium(userId, guildId, data) {
    const prisma = getPrismaClient();
    return prisma.premium.upsert({
        where: { userId_guildId: { userId, guildId } },
        create: { userId, guildId, ...data },
        update: { ...data },
    });
}
/** Generate a new premium key (called by owner commands). */
export async function generateKey(tier, createdBy, notes) {
    const prisma = getPrismaClient();
    const key = generateKeyString(tier);
    return prisma.premiumKey.create({
        data: { key, tier, createdBy, notes, isPermanent: true },
    });
}
function generateKeyString(tier) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const segment = () => Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    return `PANI-${tier.toUpperCase().slice(0, 2)}-${segment()}-${segment()}-${segment()}`;
}
export async function revokeKey(key, revokedBy) {
    const prisma = getPrismaClient();
    const existing = await prisma.premiumKey.findUnique({ where: { key } });
    if (!existing)
        return null;
    return prisma.premiumKey.update({
        where: { key },
        data: { isRevoked: true, revokedAt: new Date(), notes: `Revoked by ${revokedBy}` },
    });
}
export async function getKeyInfo(key) {
    const prisma = getPrismaClient();
    return prisma.premiumKey.findUnique({ where: { key } });
}
export async function listKeys(page = 1, perPage = 20) {
    const prisma = getPrismaClient();
    return prisma.premiumKey.findMany({
        skip: (page - 1) * perPage,
        take: perPage,
        orderBy: { createdAt: 'desc' },
    });
}
export async function getAIImageCount(userId, guildId) {
    const prisma = getPrismaClient();
    const premium = await prisma.premium.findUnique({
        where: { userId_guildId: { userId, guildId } },
        select: { aiImageCount: true, aiImageResetDate: true },
    });
    if (!premium)
        return 0;
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
export async function incrementAIImageCount(userId, guildId) {
    const prisma = getPrismaClient();
    await prisma.premium.upsert({
        where: { userId_guildId: { userId, guildId } },
        create: { userId, guildId, aiImageCount: 1 },
        update: { aiImageCount: { increment: 1 } },
    });
}
