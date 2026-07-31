/**
 * Giveaway model helpers — typed wrappers around Prisma's Giveaway and GiveawayEntry operations.
 */
import type { Giveaway, GiveawayEntry, Prisma } from '@prisma/client';
export declare function createGiveaway(data: Prisma.GiveawayCreateInput): Promise<Giveaway>;
export declare function getGiveaway(id: string): Promise<(Giveaway & {
    entries: GiveawayEntry[];
}) | null>;
export declare function getActiveGiveaways(guildId: string): Promise<Giveaway[]>;
export declare function getExpiredGiveaways(): Promise<Giveaway[]>;
export declare function updateGiveaway(id: string, data: Prisma.GiveawayUpdateInput): Promise<Giveaway>;
export declare function endGiveaway(id: string, winners: string[]): Promise<Giveaway>;
export declare function deleteGiveaway(id: string): Promise<void>;
export declare function enterGiveaway(giveawayId: string, userId: string, guildId: string, bonusEntries?: number): Promise<GiveawayEntry>;
export declare function getEntries(giveawayId: string): Promise<GiveawayEntry[]>;
/** Pick random winners weighted by entryCount. */
export declare function pickWinners(entries: GiveawayEntry[], count: number): string[];
export declare function getGiveawayHistory(guildId: string, limit?: number): Promise<Giveaway[]>;
//# sourceMappingURL=Giveaway.d.ts.map