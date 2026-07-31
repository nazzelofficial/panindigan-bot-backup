/**
 * ══════════════════════════════════════════════════════════════
 *  Panindigan Enterprise Logger  v2
 *  Asia/Manila timezone · Colored console · JSON prod
 *  Module icons · Structured events · Auto-redaction
 *  Per-module child loggers · Webhook batching
 * ══════════════════════════════════════════════════════════════
 */
import winston from 'winston';
export declare function manilaTimestampFull(): string;
export declare const logger: winston.Logger;
export declare const loggers: {
    readonly bot: winston.Logger;
    readonly shard: winston.Logger;
    readonly commands: winston.Logger;
    readonly events: winston.Logger;
    readonly loader: winston.Logger;
    readonly music: winston.Logger;
    readonly lyrics: winston.Logger;
    readonly voice: winston.Logger;
    readonly database: winston.Logger;
    readonly mongodb: winston.Logger;
    readonly postgresql: winston.Logger;
    readonly redis: winston.Logger;
    readonly economy: winston.Logger;
    readonly moderation: winston.Logger;
    readonly tickets: winston.Logger;
    readonly giveaways: winston.Logger;
    readonly ai: winston.Logger;
    readonly leveling: winston.Logger;
    readonly starboard: winston.Logger;
    readonly premium: winston.Logger;
    readonly automod: winston.Logger;
    readonly antinuke: winston.Logger;
    readonly interactions: winston.Logger;
    readonly health: winston.Logger;
    readonly uptime: winston.Logger;
    readonly monitoring: winston.Logger;
    readonly security: winston.Logger;
    readonly cache: winston.Logger;
    readonly scheduler: winston.Logger;
    readonly telemetry: winston.Logger;
    readonly api: winston.Logger;
    readonly network: winston.Logger;
    readonly performance: winston.Logger;
};
/** Create an ad-hoc child logger for any module name. */
export declare function createModuleLogger(module: string, extra?: Record<string, unknown>): winston.Logger;
export declare function createShardLogger(shardId: number): winston.Logger;
export declare function generateRequestId(): string;
export declare function generateCorrelationId(): string;
/** Log command execution (slash or prefix). */
export declare function logCommandExecution(shardId: number, guildId: string, userId: string, command: string, _args: string[], executionTime: number, success: boolean): void;
/** Log a component / modal interaction. */
export declare function logInteraction(type: 'button' | 'selectMenu' | 'modal' | 'autocomplete' | 'contextMenu', opts: {
    customId?: string;
    command?: string;
    guildId?: string;
    userId?: string;
    channelId?: string;
    shardId?: number;
    durationMs?: number;
    success?: boolean;
    requestId?: string;
}): void;
/** Log a voice channel state event. */
export declare function logVoiceEvent(event: 'join' | 'leave' | 'move' | 'mute' | 'deafen' | 'stream' | 'update', opts: {
    guildId: string;
    userId: string;
    channelId?: string;
    oldChannelId?: string;
    shardId?: number;
}): void;
/** Log a music playback event. */
export declare function logMusicEvent(event: 'trackStart' | 'trackEnd' | 'trackError' | 'queueEnd' | 'pause' | 'resume' | 'skip' | 'stop' | 'search' | 'add' | 'remove' | 'volume', opts: {
    guildId: string;
    userId?: string;
    track?: string;
    source?: string;
    durationMs?: number;
    queueSize?: number;
    shardId?: number;
}): void;
/** Log an AI provider request. */
export declare function logAIRequest(provider: 'openai' | 'anthropic' | 'gemini' | 'groq' | string, opts: {
    model?: string;
    guildId?: string;
    userId?: string;
    promptTokens?: number;
    completionTokens?: number;
    durationMs?: number;
    success: boolean;
    error?: string;
    requestId?: string;
}): void;
/** Log a cache lookup (hit or miss). */
export declare function logCacheEvent(type: 'hit' | 'miss' | 'set' | 'del' | 'expire', opts: {
    key: string;
    store?: 'redis' | 'memory' | string;
    ttl?: number;
    durationMs?: number;
}): void;
/** Log an outbound API request. */
export declare function logAPIRequest(method: string, url: string, opts: {
    statusCode?: number;
    durationMs?: number;
    success?: boolean;
    requestId?: string;
    error?: string;
}): void;
/** Log a security event (rate limit, permission denial, suspicious activity, etc.). */
export declare function logSecurityEvent(event: 'rateLimit' | 'permissionDenied' | 'suspiciousActivity' | 'spamDetected' | 'blacklisted' | 'antiNuke' | string, opts: {
    guildId?: string;
    userId?: string;
    channelId?: string;
    details?: string;
    severity?: 'low' | 'medium' | 'high' | 'critical';
    shardId?: number;
}): void;
/** Log a performance measurement. */
export declare function logPerformance(operation: string, durationMs: number, opts?: {
    threshold?: number;
    guildId?: string;
    userId?: string;
    meta?: Record<string, unknown>;
}): void;
/** Log a generic error with full context. */
export declare function logError(shardId: number, error: Error, context?: Record<string, unknown>): void;
export declare function registerGlobalErrorHandlers(): void;
export declare function startHealthCheckLogger(getStats: () => Record<string, unknown>, intervalMs?: number): NodeJS.Timeout;
//# sourceMappingURL=Logger.d.ts.map