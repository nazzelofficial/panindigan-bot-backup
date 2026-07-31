export interface CoupleRequestData {
    fromUserId: string;
    toUserId: string;
    guildId: string;
    requestedAt: string;
}
export declare class CoupleConsentService {
    private get redis();
    private get prisma();
    private requestKey;
    sendRequest(fromUserId: string, toUserId: string, guildId: string): Promise<{
        success: boolean;
        error?: string;
    }>;
    getPendingRequest(toUserId: string, guildId: string): Promise<CoupleRequestData | null>;
    acceptRequest(toUserId: string, guildId: string): Promise<{
        success: boolean;
        fromUserId?: string;
        error?: string;
    }>;
    declineRequest(toUserId: string, guildId: string): Promise<boolean>;
    cancelRequest(fromUserId: string, guildId: string): Promise<boolean>;
    divorce(userId: string, guildId: string): Promise<{
        success: boolean;
        spouseId?: string;
        error?: string;
    }>;
    getCouple(userId: string, guildId: string): Promise<{
        interactions: number;
        status: string;
        createdAt: Date;
        id: string;
        guildId: string;
        updatedAt: Date;
        marriedAt: Date;
        anniversaryDate: Date | null;
        userId1: string;
        userId2: string;
        coupleGoals: import("@prisma/client/runtime/client").JsonValue;
        sharedNickname: string | null;
        customBg: string | null;
        milestones: import("@prisma/client/runtime/client").JsonValue;
    } | null>;
    getCoupleStatus(userId: string, guildId: string): Promise<'single' | 'pending' | 'coupled'>;
}
export declare const coupleConsentService: CoupleConsentService;
//# sourceMappingURL=CoupleConsentService.d.ts.map