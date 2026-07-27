// @ts-nocheck
/**
 * Guild model helpers — typed wrappers around Prisma's Guild operations.
 * All database logic that touches the `guilds` table should go through here.
 */
import { getPrismaClient } from '../client.js';
export async function findOrCreateGuild(guildId) {
    const prisma = getPrismaClient();
    return prisma.guild.upsert({
        where: { guildId },
        create: { guildId },
        update: {},
    });
}
export async function getGuild(guildId) {
    const prisma = getPrismaClient();
    return prisma.guild.findUnique({ where: { guildId } });
}
export async function updateGuild(guildId, data) {
    const prisma = getPrismaClient();
    return prisma.guild.upsert({
        where: { guildId },
        create: { guildId, ...data },
        update: data,
    });
}
export async function deleteGuild(guildId) {
    const prisma = getPrismaClient();
    await prisma.guild.deleteMany({ where: { guildId } });
}
export async function getGuildPrefix(guildId) {
    const guild = await getGuild(guildId);
    return guild?.prefix ?? 'p!';
}
export async function getGuildLanguage(guildId) {
    const guild = await getGuild(guildId);
    return guild?.language ?? 'fil';
}
export async function isGuildBlacklisted(guildId) {
    const guild = await getGuild(guildId);
    return guild?.isBlacklisted ?? false;
}
