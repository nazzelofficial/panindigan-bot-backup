/**
 * ══════════════════════════════════════════════════
 *  Panindigan Metrics Collector
 *  Prometheus-compatible text + JSON metrics
 * ══════════════════════════════════════════════════
 */
import { EventEmitter } from 'events';
export interface RuntimeMetrics {
    cpuUsagePercent: number;
    memoryUsedMB: number;
    memoryTotalMB: number;
    memoryRssMB: number;
    heapUsedMB: number;
    heapTotalMB: number;
    externalMB: number;
    arrayBuffersMB: number;
    eventLoopDelayMs: number;
    uptimeSeconds: number;
    pid: number;
    guildCount: number;
    memberCount: number;
    shardCount: number;
    gatewayLatencyMs: number;
    restLatencyMs: number;
    commandCount: number;
    eventCount: number;
    voiceConnections: number;
    activeMusicPlayers: number;
    commandsExecuted: number;
    commandErrors: number;
    interactionsTotal: number;
    guildJoins: number;
    guildLeaves: number;
    cacheHits: number;
    cacheMisses: number;
    dbQueries: number;
    redisOps: number;
    musicSessions: number;
    httpRequests: number;
    httpLatencyMs: number;
}
declare class MetricsCollector extends EventEmitter {
    private counters;
    private gauges;
    private histograms;
    private eventLoopDelayMs;
    private cpuUsage;
    private lastCpuCheck;
    private lastCpuUsage;
    private readonly startTime;
    private loopDelayTimer;
    constructor();
    increment(metric: string, value?: number): void;
    getCounter(metric: string): number;
    setGauge(metric: string, value: number): void;
    getGauge(metric: string): number;
    observe(metric: string, value: number): void;
    getP99(metric: string): number;
    getAvg(metric: string): number;
    private startEventLoopMonitor;
    private startCpuMonitor;
    snapshot(): RuntimeMetrics;
    toPrometheusText(): string;
    destroy(): void;
}
export declare const metrics: MetricsCollector;
export default metrics;
//# sourceMappingURL=MetricsCollector.d.ts.map