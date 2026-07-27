// @ts-nocheck
/**
 * User model helpers — typed wrappers around Prisma's User operations.
 */
import { getPrismaClient } from '../client.js';
export async function findOrCreateUser(userId, guildId) {
    const prisma = getPrismaClient();
    return prisma.user.upsert({
        where: { userId_guildId: { userId, guildId } },
        create: { userId, guildId },
        update: {},
    });
}
export async function getUser(userId, guildId) {
    const prisma = getPrismaClient();
    return prisma.user.findUnique({ where: { userId_guildId: { userId, guildId } } });
}
export async function updateUser(userId, guildId, data) {
    const prisma = getPrismaClient();
    return prisma.user.upsert({
        where: { userId_guildId: { userId, guildId } },
        create: { userId, guildId, ...data },
        update: data,
    });
}
export async function getUsersByGuild(guildId) {
    const prisma = getPrismaClient();
    return prisma.user.findMany({ where: { guildId } });
}
export async function isGloballyBlacklisted(userId) {
    const prisma = getPrismaClient();
    const user = await prisma.user.findFirst({
        where: { userId, isGlobalBlacklisted: true },
        select: { isGlobalBlacklisted: true },
    });
    return user?.isGlobalBlacklisted ?? false;
}
export async function setAfk(userId, guildId, message) {
    await updateUser(userId, guildId, {
        isAfk: message !== null,
        afkMessage: message,
        afkSetAt: message !== null ? new Date() : null,
    });
}
export async function getBirthday(userId, guildId) {
    const user = await getUser(userId, guildId);
    return user?.birthday ?? null;
}
export async function getUpcomingBirthdays(guildId) {
    const prisma = getPrismaClient();
    return prisma.user.findMany({
        where: { guildId, birthday: { not: null } },
        orderBy: { birthday: 'asc' },
    });
}
