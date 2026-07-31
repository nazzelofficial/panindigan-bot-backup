// @ts-nocheck
/**
 * Applications model helpers — typed wrappers around Prisma's ApplicationForm and Application operations.
 */
import { getPrismaClient } from '../client.js';
export async function createForm(data) {
    const prisma = getPrismaClient();
    return prisma.applicationForm.create({
        data: {
            guildId: data.guildId,
            name: data.name,
            description: data.description,
            questions: data.questions,
            reviewerRoleId: data.reviewerRoleId,
            logChannelId: data.logChannelId,
            autoRoleId: data.autoRoleId,
            cooldownHours: data.cooldownHours ?? 0,
            maxResponses: data.maxResponses,
            createdBy: data.createdBy,
        },
    });
}
export async function getForm(guildId, name) {
    const prisma = getPrismaClient();
    return prisma.applicationForm.findUnique({ where: { guildId_name: { guildId, name } } });
}
export async function listForms(guildId) {
    const prisma = getPrismaClient();
    return prisma.applicationForm.findMany({ where: { guildId }, orderBy: { createdAt: 'asc' } });
}
export async function updateForm(guildId, name, data) {
    const prisma = getPrismaClient();
    return prisma.applicationForm.update({ where: { guildId_name: { guildId, name } }, data });
}
export async function deleteForm(guildId, name) {
    const prisma = getPrismaClient();
    await prisma.applicationForm.delete({ where: { guildId_name: { guildId, name } } });
}
// ─── Applications ─────────────────────────────────────────────────────────────
export async function submitApplication(data) {
    const prisma = getPrismaClient();
    return prisma.application.create({
        data: {
            guildId: data.guildId,
            userId: data.userId,
            formId: data.formId,
            formName: data.formName,
            responses: data.responses,
            status: 'pending',
        },
    });
}
export async function getApplication(id) {
    const prisma = getPrismaClient();
    return prisma.application.findUnique({ where: { id } });
}
export async function getPendingApplications(guildId) {
    const prisma = getPrismaClient();
    return prisma.application.findMany({
        where: { guildId, status: 'pending' },
        orderBy: { createdAt: 'asc' },
    });
}
export async function reviewApplication(id, reviewedBy, status, notes) {
    const prisma = getPrismaClient();
    return prisma.application.update({
        where: { id },
        data: { status, reviewedBy, reviewedAt: new Date(), reviewNotes: notes },
    });
}
export async function getUserApplications(userId, guildId) {
    const prisma = getPrismaClient();
    return prisma.application.findMany({
        where: { userId, guildId },
        orderBy: { createdAt: 'desc' },
    });
}
export async function exportResponses(guildId, formName) {
    const prisma = getPrismaClient();
    return prisma.application.findMany({
        where: { guildId, formName },
        orderBy: { createdAt: 'asc' },
    });
}
//# sourceMappingURL=Applications.js.map