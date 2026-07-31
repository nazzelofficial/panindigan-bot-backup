/**
 * Premium model helpers — typed wrappers around Prisma's Premium and PremiumKey operations.
 * Supports the one-time permanent purchase model (Bronze → Silver → Gold → Diamond).
 */
import type { Premium, PremiumKey, Prisma } from '@prisma/client';
import type { PremiumTier } from '../../../structures/BaseCommand.js';
export declare const TIER_ORDER: PremiumTier[];
export declare function tierIndex(tier: PremiumTier): number;
export declare function getPremium(userId: string, guildId: string): Promise<Premium | null>;
export declare function upsertPremium(userId: string, guildId: string, data: Partial<Prisma.PremiumCreateInput>): Promise<Premium>;
/** Generate a new premium key (called by owner commands). */
export declare function generateKey(tier: PremiumTier, createdBy: string, notes?: string): Promise<PremiumKey>;
export declare function revokeKey(key: string, revokedBy: string): Promise<PremiumKey | null>;
export declare function getKeyInfo(key: string): Promise<PremiumKey | null>;
export declare function listKeys(page?: number, perPage?: number): Promise<PremiumKey[]>;
export declare function getAIImageCount(userId: string, guildId: string): Promise<number>;
export declare function incrementAIImageCount(userId: string, guildId: string): Promise<void>;
//# sourceMappingURL=Premium.d.ts.map