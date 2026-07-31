// @ts-nocheck
import { getPrismaClient } from '../database/postgresql/client.js';
import { loggers } from '../utils/Logger.js';
export async function createGiveaway(data) {
    const prisma = getPrismaClient();
    try {
        const giveaway = await prisma.giveaway.create({
            data: {
                guildId: data.guildId,
                channelId: data.channelId,
                prize: data.prize,
                winnerCount: data.winnerCount,
                endsAt: data.endsAt,
                requiredRoleId: data.requiredRoleId,
                requiredLevel: data.requiredLevel,
                bonusRoles: data.bonusRoles,
                blacklistRoles: data.blacklistRoles,
            },
        });
        return giveaway.id;
    }
    catch (error) {
        loggers.giveaways.error('Error creating giveaway', { guildId: data.guildId, errorMessage: String(error) });
        throw error;
    }
}
export async function endGiveaway(giveawayId) {
    const prisma = getPrismaClient();
    try {
        const giveaway = await prisma.giveaway.findUnique({
            where: { id: giveawayId },
            include: { entries: true },
        });
        if (!giveaway) {
            throw new Error('Giveaway not found');
        }
        if (giveaway.endedAt) {
            throw new Error('Giveaway already ended');
        }
        const entries = giveaway.entries;
        if (entries.length === 0) {
            await prisma.giveaway.update({
                where: { id: giveawayId },
                data: { endedAt: new Date() },
            });
            return [];
        }
        const shuffled = entries.sort(() => Math.random() - 0.5);
        const winners = shuffled.slice(0, giveaway.winnerCount).map((e) => e.userId);
        await prisma.giveaway.update({
            where: { id: giveawayId },
            data: {
                endedAt: new Date(),
                winners,
            },
        });
        return winners;
    }
    catch (error) {
        loggers.giveaways.error('Error ending giveaway', { giveawayId, errorMessage: String(error) });
        throw error;
    }
}
export async function enterGiveaway(giveawayId, userId, guildId) {
    const prisma = getPrismaClient();
    try {
        const giveaway = await prisma.giveaway.findUnique({
            where: { id: giveawayId },
        });
        if (!giveaway) {
            return { success: false, error: 'Giveaway not found' };
        }
        if (giveaway.endedAt) {
            return { success: false, error: 'Giveaway already ended' };
        }
        if (giveaway.isPaused) {
            return { success: false, error: 'Giveaway is paused' };
        }
        if (new Date() > giveaway.endsAt) {
            return { success: false, error: 'Giveaway has ended' };
        }
        const existingEntry = await prisma.giveawayEntry.findUnique({
            where: {
                giveawayId_userId: {
                    giveawayId,
                    userId,
                },
            },
        });
        if (existingEntry) {
            return { success: false, error: 'Already entered' };
        }
        let entryCount = 1;
        if (giveaway.bonusRoles.length > 0) {
            const user = await prisma.user.findUnique({
                where: { userId_guildId: { userId, guildId } },
            });
            if (user) {
                const guild = await prisma.guild.findUnique({
                    where: { guildId },
                });
                if (guild) {
                    const userRoles = [];
                    for (const bonusRoleId of giveaway.bonusRoles) {
                        if (userRoles.includes(bonusRoleId)) {
                            entryCount++;
                        }
                    }
                }
            }
        }
        await prisma.giveawayEntry.create({
            data: {
                giveawayId,
                userId,
                guildId,
                entryCount,
            },
        });
        return { success: true };
    }
    catch (error) {
        loggers.giveaways.error('Error entering giveaway', { giveawayId, userId, errorMessage: String(error) });
        return { success: false, error: 'Failed to enter giveaway' };
    }
}
export async function getActiveGiveaways(guildId) {
    const prisma = getPrismaClient();
    try {
        const giveaways = await prisma.giveaway.findMany({
            where: {
                guildId,
                endedAt: null,
                endsAt: { gt: new Date() },
            },
            orderBy: { endsAt: 'asc' },
        });
        return giveaways.map((g) => ({
            id: g.id,
            prize: g.prize,
            winnerCount: g.winnerCount,
            endsAt: g.endsAt,
            channelId: g.channelId,
        }));
    }
    catch (error) {
        loggers.giveaways.error('Error fetching active giveaways', { guildId, errorMessage: String(error) });
        return [];
    }
}
export async function getGiveawayEntries(giveawayId) {
    const prisma = getPrismaClient();
    try {
        const entries = await prisma.giveawayEntry.findMany({
            where: { giveawayId },
            orderBy: { enteredAt: 'asc' },
        });
        return entries.map((e) => ({
            userId: e.userId,
            entryCount: e.entryCount,
            enteredAt: e.enteredAt,
        }));
    }
    catch (error) {
        loggers.giveaways.error('Error fetching giveaway entries', { giveawayId, errorMessage: String(error) });
        return [];
    }
}
//# sourceMappingURL=GiveawayHandler.js.map