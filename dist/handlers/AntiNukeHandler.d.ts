import { Guild } from 'discord.js';
import { PanindiganClient } from '../structures/PanindiganClient.js';
export type AntiNukeActionType = 'ban' | 'kick' | 'channelDelete' | 'roleDelete' | 'massRole' | 'webhookCreate' | 'memberPrune';
interface AntiNukeConfig {
    banThreshold: number;
    kickThreshold: number;
    channelDeleteThreshold: number;
    roleDeleteThreshold: number;
    timeWindowSeconds: number;
}
export declare class AntiNukeHandler {
    private static instance;
    static getInstance(): AntiNukeHandler;
    trackAction(guildId: string, userId: string, actionType: AntiNukeActionType): Promise<void>;
    checkThreshold(guildId: string, userId: string, actionType: AntiNukeActionType, config?: Partial<AntiNukeConfig>): Promise<boolean>;
    handleNukeAttempt(guild: Guild, userId: string, actionType: AntiNukeActionType, client: PanindiganClient): Promise<void>;
    isWhitelisted(guildId: string, userId: string): Promise<boolean>;
    getAntiNukeConfig(guildId: string): Promise<AntiNukeConfig>;
    getAuditLogs(guildId: string, limit?: number): Promise<any[]>;
    /**
     * Called from guild event handlers to check and act on destructive events
     */
    onDestructiveAction(guild: Guild, executorId: string, actionType: AntiNukeActionType, client: PanindiganClient): Promise<void>;
}
export declare const antiNukeHandler: AntiNukeHandler;
export {};
//# sourceMappingURL=AntiNukeHandler.d.ts.map