/**
 * ══════════════════════════════════════════════════
 *  Panindigan Graceful Shutdown Manager
 *  SIGINT / SIGTERM / SIGHUP + uncaught exceptions
 * ══════════════════════════════════════════════════
 */
type ShutdownHook = () => Promise<void> | void;
declare class GracefulShutdown {
    private hooks;
    private isShuttingDown;
    private registered;
    private shutdownTimeoutMs;
    constructor(shutdownTimeoutMs?: number);
    /**
     * Register a cleanup hook. Lower priority = runs first.
     */
    register(name: string, fn: ShutdownHook, priority?: number): void;
    /**
     * Attach OS signal handlers. Call once during startup.
     */
    attach(): void;
    /**
     * Execute all registered shutdown hooks in priority order.
     */
    shutdown(signal?: string, exitCode?: number): Promise<void>;
    get shuttingDown(): boolean;
}
export declare const gracefulShutdown: GracefulShutdown;
export default gracefulShutdown;
//# sourceMappingURL=GracefulShutdown.d.ts.map