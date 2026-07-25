/**
 * Applications model helpers — typed wrappers around Prisma's ApplicationForm and Application operations.
 */

import { getPrismaClient } from '../client';
import type { ApplicationForm, Application, Prisma } from '@prisma/client';

// ─── Application Forms ────────────────────────────────────────────────────────

export interface FormQuestion {
  id: string;
  label: string;
  type: 'short' | 'long' | 'multiple_choice';
  required: boolean;
  choices?: string[];
}

export async function createForm(data: {
  guildId: string;
  name: string;
  description?: string;
  questions: FormQuestion[];
  reviewerRoleId?: string;
  logChannelId?: string;
  autoRoleId?: string;
  cooldownHours?: number;
  maxResponses?: number;
  createdBy: string;
}): Promise<ApplicationForm> {
  const prisma = getPrismaClient();
  return prisma.applicationForm.create({
    data: {
      guildId: data.guildId,
      name: data.name,
      description: data.description,
      questions: data.questions as any,
      reviewerRoleId: data.reviewerRoleId,
      logChannelId: data.logChannelId,
      autoRoleId: data.autoRoleId,
      cooldownHours: data.cooldownHours ?? 0,
      maxResponses: data.maxResponses,
      createdBy: data.createdBy,
    },
  });
}

export async function getForm(guildId: string, name: string): Promise<ApplicationForm | null> {
  const prisma = getPrismaClient();
  return prisma.applicationForm.findUnique({ where: { guildId_name: { guildId, name } } });
}

export async function listForms(guildId: string): Promise<ApplicationForm[]> {
  const prisma = getPrismaClient();
  return prisma.applicationForm.findMany({ where: { guildId }, orderBy: { createdAt: 'asc' } });
}

export async function updateForm(
  guildId: string,
  name: string,
  data: Prisma.ApplicationFormUpdateInput,
): Promise<ApplicationForm | null> {
  const prisma = getPrismaClient();
  return prisma.applicationForm.update({ where: { guildId_name: { guildId, name } }, data });
}

export async function deleteForm(guildId: string, name: string): Promise<void> {
  const prisma = getPrismaClient();
  await prisma.applicationForm.delete({ where: { guildId_name: { guildId, name } } });
}

// ─── Applications ─────────────────────────────────────────────────────────────

export async function submitApplication(data: {
  guildId: string;
  userId: string;
  formId: string;
  formName: string;
  responses: Record<string, string>;
}): Promise<Application> {
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

export async function getApplication(id: string): Promise<Application | null> {
  const prisma = getPrismaClient();
  return prisma.application.findUnique({ where: { id } });
}

export async function getPendingApplications(guildId: string): Promise<Application[]> {
  const prisma = getPrismaClient();
  return prisma.application.findMany({
    where: { guildId, status: 'pending' },
    orderBy: { createdAt: 'asc' },
  });
}

export async function reviewApplication(
  id: string,
  reviewedBy: string,
  status: 'accepted' | 'denied',
  notes?: string,
): Promise<Application> {
  const prisma = getPrismaClient();
  return prisma.application.update({
    where: { id },
    data: { status, reviewedBy, reviewedAt: new Date(), reviewNotes: notes },
  });
}

export async function getUserApplications(
  userId: string,
  guildId: string,
): Promise<Application[]> {
  const prisma = getPrismaClient();
  return prisma.application.findMany({
    where: { userId, guildId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function exportResponses(
  guildId: string,
  formName: string,
): Promise<Application[]> {
  const prisma = getPrismaClient();
  return prisma.application.findMany({
    where: { guildId, formName },
    orderBy: { createdAt: 'asc' },
  });
}
