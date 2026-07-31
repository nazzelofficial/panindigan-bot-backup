/**
 * ═══════════════════════════════════════════════════
 *  Panindigan Premium Error Handler
 *  Professional error messages with solutions
 * ═══════════════════════════════════════════════════
 */
import { ChatInputCommandInteraction, Message } from 'discord.js';
export interface ErrorOptions {
    title?: string;
    description: string;
    whatHappened?: string;
    why?: string;
    howToFix?: string;
    suggestedActions?: string[];
    showTimestamp?: boolean;
    ephemeral?: boolean;
}
export declare class ErrorHandler {
    /**
     * Send error response with professional formatting
     */
    static send(source: ChatInputCommandInteraction | Message, options: ErrorOptions): Promise<void>;
    /**
     * Send permission error
     */
    static permission(source: ChatInputCommandInteraction | Message, missingPermissions: string[]): Promise<void>;
    /**
     * Send bot permission error
     */
    static botPermission(source: ChatInputCommandInteraction | Message, missingPermissions: string[]): Promise<void>;
    /**
     * Send cooldown error
     */
    static cooldown(source: ChatInputCommandInteraction | Message, remainingTime: number): Promise<void>;
    /**
     * Send rate limit error
     */
    static rateLimit(source: ChatInputCommandInteraction | Message, resetTime: number): Promise<void>;
    /**
     * Send invalid argument error
     */
    static invalidArgument(source: ChatInputCommandInteraction | Message, argumentName: string, expected: string): Promise<void>;
    /**
     * Send not found error
     */
    static notFound(source: ChatInputCommandInteraction | Message, resourceType: string, identifier: string): Promise<void>;
    /**
     * Send generic error
     */
    static generic(source: ChatInputCommandInteraction | Message, error: Error): Promise<void>;
    /**
     * Send music error
     */
    static music(source: ChatInputCommandInteraction | Message, errorType: 'not_in_voice' | 'no_track' | 'queue_empty' | 'already_playing' | 'join_failed'): Promise<void>;
    /**
     * Send economy error
     */
    static economy(source: ChatInputCommandInteraction | Message, errorType: 'insufficient_funds' | 'negative_amount' | 'self_transfer' | 'invalid_user'): Promise<void>;
    /**
     * Send moderation error
     */
    static moderation(source: ChatInputCommandInteraction | Message, errorType: 'hierarchy' | 'cannot_moderate' | 'already_punished' | 'immune'): Promise<void>;
}
export default ErrorHandler;
//# sourceMappingURL=ErrorHandler.d.ts.map