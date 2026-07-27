// @ts-nocheck
/**
 * Moderation model helpers — typed wrappers around Prisma's Moderation and ModerationCase operations.
 */

import { getPrismaClient } from '../client.js';
import type { Moderation, ModerationCase, Prisma } from '@prisma/client';

export async function findOrCreateModeration(
  userId: string,
  guildId: string,
): Promise<Moderation> {
  const prisma = getPrismaClient();
  return prisma.moderation.upsert({
    where: { userId_guildId: { userId, guildId } },
    create: { userId, guildId },
    update: {},
  });
}

export async function getModeration(
  userId: string,
  guildId: string,
): Promise<Moderation | null> {
  const prisma = getPrismaClient();
  return prisma.moderation.findUnique({ where: { userId_guildId: { userId, guildId } } });
}

export async function updateModeration(
  userId: string,
  guildId: string,
  data: Prisma.ModerationUpdateInput,
): Promise<Moderation> {
  const prisma = getPrismaClient();
  return prisma.moderation.upsert({
    where: { userId_guildId: { userId, guildId } },
    create: { userId, guildId, ...(data as Prisma.ModerationCreateInput) },
    update: data,
  });
}

/** Create a new moderation case with an auto-incremented caseId per guild. */
export async function createCase(data: {
  guildId: string;
  targetId: string;
  moderatorId: string;
  type: string;
  reason?: string;
  duration?: string;
  expiresAt?: Date;
}): Promise<ModerationCase> {
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

export async function getCase(guildId: string, caseId: number): Promise<ModerationCase | null> {
  const prisma = getPrismaClient();
  return prisma.moderationCase.findUnique({ where: { guildId_caseId: { guildId, caseId } } });
}

export async function getCasesByUser(
  guildId: string,
  targetId: string,
): Promise<ModerationCase[]> {
  const prisma = getPrismaClient();
  return prisma.moderationCase.findMany({
    where: { guildId, targetId, isDeleted: false },
    orderBy: { createdAt: 'desc' },
  });
}

export async function editCase(
  guildId: string,
  caseId: number,
  editedBy: string,
  editedReason: string,
): Promise<ModerationCase | null> {
  const prisma = getPrismaClient();
  const existing = await getCase(guildId, caseId);
  if (!existing) return null;
  return prisma.moderationCase.update({
    where: { guildId_caseId: { guildId, caseId } },
    data: { editedReason, editedBy, editedAt: new Date() },
  });
}

export async function softDeleteCase(guildId: string, caseId: number): Promise<void> {
  const prisma = getPrismaClient();
  await prisma.moderationCase.update({
    where: { guildId_caseId: { guildId, caseId } },
    data: { isDeleted: true },
  });
}

export async function getWarnings(
  userId: string,
  guildId: string,
): Promise<Array<{ id: string; reason: string; moderatorId: string; createdAt: Date }>> {
  const mod = await getModeration(userId, guildId);
  return (mod?.warnings ?? []) as any[];
}

export async function addWarning(
  userId: string,
  guildId: string,
  warning: { id: string; reason: string; moderatorId: string; createdAt: Date },
): Promise<Moderation> {
  const prisma = getPrismaClient();
  const mod = await findOrCreateModeration(userId, guildId);
  const warnings = [...((mod.warnings as any[]) ?? []), warning];
  return prisma.moderation.update({
    where: { userId_guildId: { userId, guildId } },
    data: { warnings },
  });
}

export async function clearWarnings(userId: string, guildId: string): Promise<Moderation> {
  const prisma = getPrismaClient();
  return prisma.moderation.update({
    where: { userId_guildId: { userId, guildId } },
    data: { warnings: [] },
  });
}
