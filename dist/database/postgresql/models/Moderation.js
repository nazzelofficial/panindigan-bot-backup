// @ts-nocheck
/**
 * Moderation model helpers — typed wrappers around Prisma's Moderation and ModerationCase operations.
 */
import { getPrismaClient } from '../client.js';
export async function findOrCreateModeration(userId, guildId) {
    const prisma = getPrismaClient();
    return prisma.moderation.upsert({
        where: { userId_guildId: { userId, guildId } },
        create: { userId, guildId },
        update: {},
    });
}
export async function getModeration(userId, guildId) {
    const prisma = getPrismaClient();
    return prisma.moderation.findUnique({ where: { userId_guildId: { userId, guildId } } });
}
export async function updateModeration(userId, guildId, data) {
    const prisma = getPrismaClient();
    return prisma.moderation.upsert({
        where: { userId_guildId: { userId, guildId } },
        create: { userId, guildId, ...data },
        update: data,
    });
}
/** Create a new moderation case with an auto-incremented caseId per guild. */
export async function createCase(data) {
    const prisma = getPrismaClient();
    // Get the next case ID for this guild
    const last = await prisma.moderationCase.findFirst({
        where: { guildId: data.guildId },
        orderBy: { caseId: 'desc' },
        select: { caseId: true },
    });
    const nextCaseId = (last?.caseId ?? 0) + 1;
    return prisma.moderationCase.create({
        data: { ...data, caseId: nextCaseId },
    });
}
export async function getCase(guildId, caseId) {
    const prisma = getPrismaClient();
    return prisma.moderationCase.findUnique({ where: { guildId_caseId: { guildId, caseId } } });
}
export async function getCasesByUser(guildId, targetId) {
    const prisma = getPrismaClient();
    return prisma.moderationCase.findMany({
        where: { guildId, targetId, isDeleted: false },
        orderBy: { createdAt: 'desc' },
    });
}
export async function editCase(guildId, caseId, editedBy, editedReason) {
    const prisma = getPrismaClient();
    const existing = await getCase(guildId, caseId);
    if (!existing)
        return null;
    return prisma.moderationCase.update({
        where: { guildId_caseId: { guildId, caseId } },
        data: { editedReason, editedBy, editedAt: new Date() },
    });
}
export async function softDeleteCase(guildId, caseId) {
    const prisma = getPrismaClient();
    await prisma.moderationCase.update({
        where: { guildId_caseId: { guildId, caseId } },
        data: { isDeleted: true },
    });
}
export async function getWarnings(userId, guildId) {
    const mod = await getModeration(userId, guildId);
    return (mod?.warnings ?? []);
}
export async function addWarning(userId, guildId, warning) {
    const prisma = getPrismaClient();
    const mod = await findOrCreateModeration(userId, guildId);
    const warnings = [...(mod.warnings ?? []), warning];
    return prisma.moderation.update({
        where: { userId_guildId: { userId, guildId } },
        data: { warnings },
    });
}
export async function clearWarnings(userId, guildId) {
    const prisma = getPrismaClient();
    return prisma.moderation.update({
        where: { userId_guildId: { userId, guildId } },
        data: { warnings: [] },
    });
}
