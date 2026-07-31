/**
 * Guild model helpers — typed wrappers around Prisma's Guild operations.
 * All database logic that touches the `guilds` table should go through here.
 */
import type { Guild, Prisma } from '@prisma/client';
export declare function findOrCreateGuild(guildId: string): Promise<Guild>;
export declare function getGuild(guildId: string): Promise<Guild | null>;
export declare function updateGuild(guildId: string, data: Prisma.GuildUpdateInput): Promise<Guild>;
export declare function deleteGuild(guildId: string): Promise<void>;
export declare function getGuildPrefix(guildId: string): Promise<string>;
export declare function getGuildLanguage(guildId: string): Promise<string>;
export declare function isGuildBlacklisted(guildId: string): Promise<boolean>;
//# sourceMappingURL=Guild.d.ts.map