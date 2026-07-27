// @ts-nocheck
/**
 * Giveaway model helpers — typed wrappers around Prisma's Giveaway and GiveawayEntry operations.
 */
import { getPrismaClient } from '../client.js';
export async function createGiveaway(data) {
    const prisma = getPrismaClient();
    return prisma.giveaway.create({ data });
}
export async function getGiveaway(id) {
    const prisma = getPrismaClient();
    return prisma.giveaway.findUnique({ where: { id }, include: { entries: true } });
}
export async function getActiveGiveaways(guildId) {
    const prisma = getPrismaClient();
    return prisma.giveaway.findMany({
        where: { guildId, isEnded: false, isPaused: false },
        orderBy: { endsAt: 'asc' },
    });
}
export async function getExpiredGiveaways() {
    const prisma = getPrismaClient();
    return prisma.giveaway.findMany({
        where: { isEnded: false, isPaused: false, endsAt: { lte: new Date() } },
    });
}
export async function updateGiveaway(id, data) {
    const prisma = getPrismaClient();
    return prisma.giveaway.update({ where: { id }, data });
}
export async function endGiveaway(id, winners) {
    const prisma = getPrismaClient();
    return prisma.giveaway.update({
        where: { id },
        data: { isEnded: true, endedAt: new Date(), winners },
    });
}
export async function deleteGiveaway(id) {
    const prisma = getPrismaClient();
    await prisma.giveaway.delete({ where: { id } });
}
export async function enterGiveaway(giveawayId, userId, guildId, bonusEntries = 0) {
    const prisma = getPrismaClient();
    return prisma.giveawayEntry.upsert({
        where: { giveawayId_userId: { giveawayId, userId } },
        create: { giveawayId, userId, guildId, entryCount: 1 + bonusEntries },
        update: { entryCount: { increment: bonusEntries } },
    });
}
export async function getEntries(giveawayId) {
    const prisma = getPrismaClient();
    return prisma.giveawayEntry.findMany({ where: { giveawayId } });
}
/** Pick random winners weighted by entryCount. */
export function pickWinners(entries, count) {
    const pool = [];
    for (const entry of entries) {
        for (let i = 0; i < entry.entryCount; i++) {
            pool.push(entry.userId);
        }
    }
    const winners = new Set();
    while (winners.size < count && pool.length > 0) {
        const idx = Math.floor(Math.random() * pool.length);
        winners.add(pool[idx]);
        // Remove all entries of this winner to avoid duplicates
        for (let i = pool.length - 1; i >= 0; i--) {
            if (pool[i] === pool[idx])
                pool.splice(i, 1);
        }
    }
    return [...winners];
}
export async function getGiveawayHistory(guildId, limit = 10) {
    const prisma = getPrismaClient();
    return prisma.giveaway.findMany({
        where: { guildId, isEnded: true },
        orderBy: { endedAt: 'desc' },
        take: limit,
    });
}
