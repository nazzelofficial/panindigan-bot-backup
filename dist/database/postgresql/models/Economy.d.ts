/**
 * Economy model helpers — typed wrappers around Prisma's Economy operations.
 */
import type { Economy, Prisma } from '@prisma/client';
export declare function findOrCreateEconomy(userId: string, guildId: string): Promise<Economy>;
export declare function getEconomy(userId: string, guildId: string): Promise<Economy | null>;
export declare function updateEconomy(userId: string, guildId: string, data: Prisma.EconomyUpdateInput): Promise<Economy>;
/** Add or subtract from the user's wallet (clamps at 0). */
export declare function adjustWallet(userId: string, guildId: string, amount: bigint): Promise<Economy>;
/** Transfer from wallet to bank. */
export declare function deposit(userId: string, guildId: string, amount: bigint): Promise<Economy>;
/** Transfer from bank to wallet. */
export declare function withdraw(userId: string, guildId: string, amount: bigint): Promise<Economy>;
/** Richest users in a guild (by wallet + bank). */
export declare function getRichestUsers(guildId: string, limit?: number): Promise<Economy[]>;
export declare function isCooldownExpired(eco: Economy, field: keyof Pick<Economy, 'lastDaily' | 'lastWeekly' | 'lastMonthly' | 'lastWork' | 'lastCrime' | 'lastRob' | 'lastBeg' | 'lastFish' | 'lastHunt' | 'lastMine' | 'lastFarm' | 'lastChop' | 'lastDig'>, cooldownMs: number): Promise<boolean>;
//# sourceMappingURL=Economy.d.ts.map