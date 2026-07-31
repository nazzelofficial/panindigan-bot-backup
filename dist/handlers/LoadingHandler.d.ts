/**
 * ═══════════════════════════════════════════════════
 *  Panindigan Premium Loading Handler
 *  Professional loading states with progress updates
 * ═══════════════════════════════════════════════════
 */
import { ChatInputCommandInteraction, Message } from 'discord.js';
export interface LoadingOptions {
    action: string;
    description?: string;
    progress?: number;
    total?: number;
    current?: string;
    showTimestamp?: boolean;
    ephemeral?: boolean;
}
export interface LoadingState {
    message: Message;
    action: string;
    progress: number;
    total: number;
    current: string;
}
export declare class LoadingHandler {
    /**
     * Send loading response with professional formatting
     */
    static send(source: ChatInputCommandInteraction | Message, options: LoadingOptions): Promise<Message | null>;
    /**
     * Update loading state with new progress
     */
    static update(state: LoadingState, progress: number, current?: string): Promise<void>;
    /**
     * Complete loading state with success
     */
    static complete(state: LoadingState, successMessage: string): Promise<void>;
    /**
     * Fail loading state with error
     */
    static fail(state: LoadingState, errorMessage: string): Promise<void>;
    /**
     * Create progress bar
     */
    private static createProgressBar;
    /**
     * Create loading state for tracking
     */
    static createState(message: Message, action: string, total?: number): LoadingState;
    /**
     * Send music loading
     */
    static music(source: ChatInputCommandInteraction | Message, trackName: string, action: 'searching' | 'loading' | 'processing'): Promise<Message | null>;
    /**
     * Send AI processing loading
     */
    static ai(source: ChatInputCommandInteraction | Message, model: string, prompt: string): Promise<Message | null>;
    /**
     * Send database operation loading
     */
    static database(source: ChatInputCommandInteraction | Message, operation: 'saving' | 'loading' | 'updating' | 'deleting'): Promise<Message | null>;
    /**
     * Send image generation loading
     */
    static image(source: ChatInputCommandInteraction | Message, prompt: string): Promise<Message | null>;
    /**
     * Send playlist loading
     */
    static playlist(source: ChatInputCommandInteraction | Message, playlistName: string, songCount: number): Promise<Message | null>;
    /**
     * Send moderation action loading
     */
    static moderation(source: ChatInputCommandInteraction | Message, action: string, target: string): Promise<Message | null>;
    /**
     * Send economy transaction loading
     */
    static economy(source: ChatInputCommandInteraction | Message, action: string, amount: number): Promise<Message | null>;
    /**
     * Send bulk operation loading
     */
    static bulk(source: ChatInputCommandInteraction | Message, operation: string, total: number): Promise<Message | null>;
    /**
     * Send API request loading
     */
    static api(source: ChatInputCommandInteraction | Message, endpoint: string): Promise<Message | null>;
    /**
     * Send generic loading with custom message
     */
    static generic(source: ChatInputCommandInteraction | Message, message: string): Promise<Message | null>;
}
export default LoadingHandler;
//# sourceMappingURL=LoadingHandler.d.ts.map