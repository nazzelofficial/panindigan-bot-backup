/**
 * Leveling model helpers — typed wrappers around Prisma's Leveling operations.
 */
import type { Leveling, Prisma } from '@prisma/client';
export declare function findOrCreateLeveling(userId: string, guildId: string): Promise<Leveling>;
export declare function getLeveling(userId: string, guildId: string): Promise<Leveling | null>;
export declare function updateLeveling(userId: string, guildId: string, data: Prisma.LevelingUpdateInput): Promise<Leveling>;
export declare function getServerLeaderboard(guildId: string, limit?: number): Promise<Leveling[]>;
export declare function getUserRank(userId: string, guildId: string): Promise<number>;
export interface LevelCard {
    userId: string;
    guildId: string;
    level: number;
    xp: number;
    xpForNextLevel: {
        current: number;
        required: number;
        remaining: number;
    };
    rank: number;
    totalMessages: number;
    voiceMinutes: number;
    rankCardColor: string;
    rankCardBg: string | null;
}
export declare function getLevelCard(userId: string, guildId: string): Promise<LevelCard | null>;
export declare function setXP(userId: string, guildId: string, xp: number): Promise<Leveling>;
export declare function resetLeveling(guildId: string, userId?: string): Promise<void>;
//# sourceMappingURL=Leveling.d.ts.map