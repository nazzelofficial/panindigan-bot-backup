/**
 * Moderation model helpers — typed wrappers around Prisma's Moderation and ModerationCase operations.
 */
import type { Moderation, ModerationCase, Prisma } from '@prisma/client';
export declare function findOrCreateModeration(userId: string, guildId: string): Promise<Moderation>;
export declare function getModeration(userId: string, guildId: string): Promise<Moderation | null>;
export declare function updateModeration(userId: string, guildId: string, data: Prisma.ModerationUpdateInput): Promise<Moderation>;
/** Create a new moderation case with an auto-incremented caseId per guild. */
export declare function createCase(data: {
    guildId: string;
    targetId: string;
    moderatorId: string;
    type: string;
    reason?: string;
    duration?: string;
    expiresAt?: Date;
}): Promise<ModerationCase>;
export declare function getCase(guildId: string, caseId: number): Promise<ModerationCase | null>;
export declare function getCasesByUser(guildId: string, targetId: string): Promise<ModerationCase[]>;
export declare function editCase(guildId: string, caseId: number, editedBy: string, editedReason: string): Promise<ModerationCase | null>;
export declare function softDeleteCase(guildId: string, caseId: number): Promise<void>;
export declare function getWarnings(userId: string, guildId: string): Promise<Array<{
    id: string;
    reason: string;
    moderatorId: string;
    createdAt: Date;
}>>;
export declare function addWarning(userId: string, guildId: string, warning: {
    id: string;
    reason: string;
    moderatorId: string;
    createdAt: Date;
}): Promise<Moderation>;
export declare function clearWarnings(userId: string, guildId: string): Promise<Moderation>;
//# sourceMappingURL=Moderation.d.ts.map