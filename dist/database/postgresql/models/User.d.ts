/**
 * User model helpers — typed wrappers around Prisma's User operations.
 */
import type { User, Prisma } from '@prisma/client';
export declare function findOrCreateUser(userId: string, guildId: string): Promise<User>;
export declare function getUser(userId: string, guildId: string): Promise<User | null>;
export declare function updateUser(userId: string, guildId: string, data: Prisma.UserUpdateInput): Promise<User>;
export declare function getUsersByGuild(guildId: string): Promise<User[]>;
export declare function isGloballyBlacklisted(userId: string): Promise<boolean>;
export declare function setAfk(userId: string, guildId: string, message: string | null): Promise<void>;
export declare function getBirthday(userId: string, guildId: string): Promise<Date | null>;
export declare function getUpcomingBirthdays(guildId: string): Promise<User[]>;
//# sourceMappingURL=User.d.ts.map