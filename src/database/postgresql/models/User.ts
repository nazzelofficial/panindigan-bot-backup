// @ts-nocheck
/**
 * User model helpers — typed wrappers around Prisma's User operations.
 */

import { getPrismaClient } from '../client.js';
import type { User, Prisma } from '@prisma/client';

export async function findOrCreateUser(userId: string, guildId: string): Promise<User> {
  const prisma = getPrismaClient();
  return prisma.user.upsert({
    where: { userId_guildId: { userId, guildId } },
    create: { userId, guildId },
    update: {},
  });
}

export async function getUser(userId: string, guildId: string): Promise<User | null> {
  const prisma = getPrismaClient();
  return prisma.user.findUnique({ where: { userId_guildId: { userId, guildId } } });
}

export async function updateUser(
  userId: string,
  guildId: string,
  data: Prisma.UserUpdateInput,
): Promise<User> {
  const prisma = getPrismaClient();
  return prisma.user.upsert({
    where: { userId_guildId: { userId, guildId } },
    create: { userId, guildId, ...(data as Prisma.UserCreateInput) },
    update: data,
  });
}

export async function getUsersByGuild(guildId: string): Promise<User[]> {
  const prisma = getPrismaClient();
  return prisma.user.findMany({ where: { guildId } });
}

export async function isGloballyBlacklisted(userId: string): Promise<boolean> {
  const prisma = getPrismaClient();
  const user = await prisma.user.findFirst({
    where: { userId, isGlobalBlacklisted: true },
    select: { isGlobalBlacklisted: true },
  });
  return user?.isGlobalBlacklisted ?? false;
}

export async function setAfk(
  userId: string,
  guildId: string,
  message: string | null,
): Promise<void> {
  await updateUser(userId, guildId, {
    isAfk: message !== null,
    afkMessage: message,
    afkSetAt: message !== null ? new Date() : null,
  });
}

export async function getBirthday(userId: string, guildId: string): Promise<Date | null> {
  const user = await getUser(userId, guildId);
  return user?.birthday ?? null;
}

export async function getUpcomingBirthdays(guildId: string): Promise<User[]> {
  const prisma = getPrismaClient();
  return prisma.user.findMany({
    where: { guildId, birthday: { not: null } },
    orderBy: { birthday: 'asc' },
  });
}
