export declare function calculateLevelFromXP(xp: number): number;
export declare function calculateXPForLevel(level: number): number;
export declare function getXPForNextLevel(currentXP: number): {
    current: number;
    required: number;
    remaining: number;
};
export declare function getRandomXP(): number;
export declare function addXP(userId: string, guildId: string, amount: number): Promise<{
    newXP: number;
    newLevel: number;
    leveledUp: boolean;
    oldLevel: number;
}>;
export declare function addVoiceXP(userId: string, guildId: string, minutes: number): Promise<{
    newXP: number;
    newLevel: number;
    leveledUp: boolean;
}>;
export declare function getLeaderboard(guildId: string, limit?: number, page?: number): Promise<{
    entries: any[];
    total: number;
}>;
export declare function getUserRank(userId: string, guildId: string): Promise<number>;
export declare function setUserXP(userId: string, guildId: string, xp: number): Promise<void>;
export declare class LevelingHandler {
    giveXP(userId: string, guildId: string, amount: number): Promise<void>;
    removeXP(userId: string, guildId: string, amount: number): Promise<void>;
    setXP(userId: string, guildId: string, amount: number): Promise<void>;
}
//# sourceMappingURL=LevelingHandler.d.ts.map