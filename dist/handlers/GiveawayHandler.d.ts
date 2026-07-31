export interface GiveawayData {
    guildId: string;
    channelId: string;
    prize: string;
    winnerCount: number;
    endsAt: Date;
    requiredRoleId?: string;
    requiredLevel?: number;
    bonusRoles: string[];
    blacklistRoles: string[];
}
export declare function createGiveaway(data: GiveawayData): Promise<string>;
export declare function endGiveaway(giveawayId: string): Promise<string[]>;
export declare function enterGiveaway(giveawayId: string, userId: string, guildId: string): Promise<{
    success: boolean;
    error?: string;
}>;
export declare function getActiveGiveaways(guildId: string): Promise<any[]>;
export declare function getGiveawayEntries(giveawayId: string): Promise<any[]>;
//# sourceMappingURL=GiveawayHandler.d.ts.map