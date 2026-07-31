export interface CoupleHistoryEntry {
    userId1: string;
    userId2: string;
    guildId: string;
    event: string;
    details?: string;
    timestamp: Date;
}
export declare class CoupleHistoryService {
    private get col();
    addEntry(entry: Omit<CoupleHistoryEntry, 'timestamp'>): Promise<void>;
    getHistory(userId1: string, userId2: string, guildId: string, limit?: number): Promise<CoupleHistoryEntry[]>;
    getUserHistory(userId: string, guildId: string, limit?: number): Promise<CoupleHistoryEntry[]>;
    recordMarriage(userId1: string, userId2: string, guildId: string): Promise<void>;
    recordDivorce(userId1: string, userId2: string, guildId: string): Promise<void>;
    recordMilestone(userId1: string, userId2: string, guildId: string, milestone: string): Promise<void>;
    recordAnniversary(userId1: string, userId2: string, guildId: string, years: number): Promise<void>;
    formatHistoryEntry(entry: CoupleHistoryEntry): string;
}
export declare const coupleHistoryService: CoupleHistoryService;
//# sourceMappingURL=CoupleHistoryService.d.ts.map