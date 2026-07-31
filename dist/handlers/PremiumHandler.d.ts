import { PremiumTier } from '../structures/BaseCommand.js';
export declare function getUserPremiumTier(userId: string, guildId: string): Promise<PremiumTier>;
export declare function getGuildPremiumTier(guildId: string): Promise<PremiumTier>;
export declare function activatePremiumKey(userId: string, guildId: string, key: string): Promise<{
    success: boolean;
    tier?: PremiumTier;
    error?: string;
}>;
export declare function activateFreeTrial(userId: string, guildId: string): Promise<{
    success: boolean;
    error?: string;
}>;
export declare function hasPremiumAccess(userId: string, guildId: string, requiredTier: PremiumTier): Promise<boolean>;
export declare function tierHierarchy(tier: PremiumTier): number;
export declare function getTierLabel(tier: PremiumTier): string;
export declare class PremiumHandler {
    setUserPremium(userId: string, tier: string, durationDays?: number): Promise<void>;
    revokePremium(userId: string): Promise<void>;
    getUserPremium(userId: string, guildId: string): Promise<PremiumTier>;
    /** Returns the premium status object expected by the premium command. */
    getUserPremiumStatus(userId: string): Promise<{
        tier: PremiumTier;
        active: boolean;
        expiresAt: Date | null;
    } | null>;
    /** Activates a premium key for the user (uses guildId 'global'). */
    activateKey(userId: string, key: string): Promise<{
        success: boolean;
        tier?: PremiumTier;
        error?: string;
    }>;
    /** Starts a free trial for the user (uses guildId 'global'). */
    activateFreeTrial(userId: string, _tier: string): Promise<{
        success: boolean;
        error?: string;
    }>;
}
//# sourceMappingURL=PremiumHandler.d.ts.map