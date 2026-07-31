/**
 * ══════════════════════════════════════════════════
 *  Panindigan Health Checker
 *  Continuously monitors all service dependencies
 * ══════════════════════════════════════════════════
 */
export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
export interface DependencyHealth {
    name: string;
    status: HealthStatus;
    latencyMs?: number;
    message?: string;
    lastChecked: number;
    consecutive_failures: number;
}
export interface HealthReport {
    status: HealthStatus;
    timestamp: number;
    dependencies: Record<string, DependencyHealth>;
}
type CheckFn = () => Promise<{
    ok: boolean;
    latencyMs?: number;
    message?: string;
}>;
declare class HealthChecker {
    private deps;
    private checks;
    private checkIntervalMs;
    private cacheMs;
    private timer;
    private running;
    constructor(checkIntervalMs?: number, cacheMs?: number);
    register(name: string, checkFn: CheckFn): void;
    unregister(name: string): void;
    private runCheck;
    checkAll(): Promise<void>;
    get(name: string): Promise<DependencyHealth>;
    report(forceRefresh?: boolean): Promise<HealthReport>;
    start(): void;
    stop(): void;
    overallStatus(): HealthStatus;
    isReady(): boolean;
    isLive(): boolean;
}
export declare const healthChecker: HealthChecker;
export default healthChecker;
//# sourceMappingURL=HealthChecker.d.ts.map