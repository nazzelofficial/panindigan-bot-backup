/**
 * Guild model helpers — typed wrappers around Prisma's Guild operations.
 * All database logic that touches the `guilds` table should go through here.
 */

import { getPrismaClient } from '../client';
import type { Guild, Prisma } from '@prisma/client';

export async function findOrCreateGuild(guildId: string): Promise<Guild> {
  const prisma = getPrismaClient();
  return prisma.guild.upsert({
    where: { guildId },
    create: { guildId },
    update: {},
  });
}

export async function getGuild(guildId: string): Promise<Guild | null> {
  const prisma = getPrismaClient();
  return prisma.guild.findUnique({ where: { guildId } });
}

export async function updateGuild(
  guildId: string,
  data: Prisma.GuildUpdateInput,
): Promise<Guild> {
  const prisma = getPrismaClient();
  return prisma.guild.upsert({
    where: { guildId },
    create: { guildId, ...(data as Prisma.GuildCreateInput) },
    update: data,
  });
}

export async function deleteGuild(guildId: string): Promise<void> {
  const prisma = getPrismaClient();
  await prisma.guild.deleteMany({ where: { guildId } });
}

export async function getGuildPrefix(guildId: string): Promise<string> {
  const guild = await getGuild(guildId);
  return guild?.prefix ?? 'p!';
}

export async function getGuildLanguage(guildId: string): Promise<string> {
  const guild = await getGuild(guildId);
  return guild?.language ?? 'fil';
}

export async function isGuildBlacklisted(guildId: string): Promise<boolean> {
  const guild = await getGuild(guildId);
  return guild?.isBlacklisted ?? false;
}
