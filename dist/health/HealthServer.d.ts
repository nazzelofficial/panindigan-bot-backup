/**
 * ══════════════════════════════════════════════════
 *  Panindigan Enterprise Health Server
 *  Production HTTP server — all monitoring endpoints
 *  Compatible with UptimeRobot, BetterStack, Prometheus,
 *  Datadog, Grafana, Healthchecks.io, Uptime Kuma, etc.
 * ══════════════════════════════════════════════════
 */
interface HealthServerOptions {
    port?: number;
    host?: string;
    authToken?: string;
    authHeader?: string;
    allowedIps?: string[];
    bootTimestamp?: number;
}
interface BotContextProvider {
    getGuildCount(): number;
    getMemberCount(): number;
    getShardCount(): number;
    getShardId(): number;
    getGatewayLatency(): number;
    getCommandCount(): number;
    getEventCount(): number;
    getVoiceConnections(): number;
    getMusicPlayers(): number;
    isReady(): boolean;
}
export declare class HealthServer {
    private readonly port;
    private readonly host;
    private readonly authToken?;
    private readonly allowedIps;
    private readonly bootTimestamp;
    private readonly hostingInfo;
    private readonly versionInfo;
    private botContext;
    private server;
    constructor(options?: HealthServerOptions);
    setBotContext(ctx: BotContextProvider): void;
    start(): Promise<void>;
    stop(): Promise<void>;
    private handleIndex;
    private handleHealth;
    private handleLive;
    private handleReady;
    private handleMetrics;
    private handleVersion;
    private handleStatus;
    private handleInfo;
    private handleStartup;
    private cachedReport;
    private lastReportMs;
    private readonly REPORT_CACHE_MS;
    private getCachedReport;
}
export default HealthServer;
//# sourceMappingURL=HealthServer.d.ts.map