/**
 * ═══════════════════════════════════════════════════
 *  Panindigan Premium Success Handler
 *  Professional success messages with next actions
 * ═══════════════════════════════════════════════════
 */
import { ChatInputCommandInteraction, Message } from 'discord.js';
export interface SuccessOptions {
    title?: string;
    description: string;
    summary?: string;
    nextActions?: string[];
    showTimestamp?: boolean;
    ephemeral?: boolean;
}
export declare class SuccessHandler {
    /**
     * Send success response with professional formatting
     */
    static send(source: ChatInputCommandInteraction | Message, options: SuccessOptions): Promise<void>;
    /**
     * Send moderation success
     */
    static moderation(source: ChatInputCommandInteraction | Message, action: string, target: string, reason?: string): Promise<void>;
    /**
     * Send economy success
     */
    static economy(source: ChatInputCommandInteraction | Message, action: string, amount: number, target?: string): Promise<void>;
    /**
     * Send music success
     */
    static music(source: ChatInputCommandInteraction | Message, action: string, trackName: string): Promise<void>;
    /**
     * Send configuration success
     */
    static configuration(source: ChatInputCommandInteraction | Message, setting: string, value: string): Promise<void>;
    /**
     * Send level up success
     */
    static levelUp(source: ChatInputCommandInteraction | Message, level: number, xp: number, rewards?: string[]): Promise<void>;
    /**
     * Send premium activation success
     */
    static premium(source: ChatInputCommandInteraction | Message, tier: string, features: string[]): Promise<void>;
    /**
     * Send playlist success
     */
    static playlist(source: ChatInputCommandInteraction | Message, action: string, playlistName: string, songCount?: number): Promise<void>;
    /**
     * Send giveaway success
     */
    static giveaway(source: ChatInputCommandInteraction | Message, action: string, prize: string): Promise<void>;
    /**
     * Send ticket success
     */
    static ticket(source: ChatInputCommandInteraction | Message, action: string, ticketId: string): Promise<void>;
    /**
     * Send role success
     */
    static role(source: ChatInputCommandInteraction | Message, action: string, roleName: string, target?: string): Promise<void>;
    /**
     * Send channel success
     */
    static channel(source: ChatInputCommandInteraction | Message, action: string, channelName: string): Promise<void>;
    /**
     * Send generic success
     */
    static generic(source: ChatInputCommandInteraction | Message, description: string, nextActions?: string[]): Promise<void>;
}
export default SuccessHandler;
//# sourceMappingURL=SuccessHandler.d.ts.map