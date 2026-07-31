/**
 * ══════════════════════════════════════════════════
 *  Panindigan Graceful Shutdown Manager
 *  SIGINT / SIGTERM / SIGHUP + uncaught exceptions
 * ══════════════════════════════════════════════════
 */
import { loggers } from '../utils/Logger.js';
class GracefulShutdown {
    hooks = [];
    isShuttingDown = false;
    registered = false;
    shutdownTimeoutMs;
    constructor(shutdownTimeoutMs = 15_000) {
        this.shutdownTimeoutMs = shutdownTimeoutMs;
    }
    /**
     * Register a cleanup hook. Lower priority = runs first.
     */
    register(name, fn, priority = 50) {
        this.hooks.push({ name, fn, priority });
        this.hooks.sort((a, b) => a.priority - b.priority);
    }
    /**
     * Attach OS signal handlers. Call once during startup.
     */
    attach() {
        if (this.registered)
            return;
        this.registered = true;
        const handle = (signal) => async () => {
            if (this.isShuttingDown)
                return;
            loggers.bot.info(`${signal} received — initiating graceful shutdown`);
            await this.shutdown(signal, 0);
        };
        process.once('SIGTERM', handle('SIGTERM'));
        process.once('SIGINT', handle('SIGINT'));
        process.once('SIGHUP', handle('SIGHUP'));
        process.on('uncaughtException', async (error) => {
            loggers.bot.error('Uncaught exception — shutting down', {
                errorMessage: error.message,
                stack: error.stack,
            });
            if (!this.isShuttingDown) {
                await this.shutdown('uncaughtException', 1);
            }
        });
        process.on('unhandledRejection', (reason) => {
            loggers.bot.error('Unhandled promise rejection', {
                reason: reason instanceof Error ? reason.message : String(reason),
                stack: reason instanceof Error ? reason.stack : undefined,
            });
            // Don't exit — Discord.js handles this via reconnects
        });
    }
    /**
     * Execute all registered shutdown hooks in priority order.
     */
    async shutdown(signal = 'manual', exitCode = 0) {
        if (this.isShuttingDown)
            return;
        this.isShuttingDown = true;
        loggers.bot.info('Graceful shutdown started', {
            signal,
            hooks: this.hooks.length,
            timeoutMs: this.shutdownTimeoutMs,
        });
        const forceExit = setTimeout(() => {
            loggers.bot.error('Shutdown timeout exceeded — forcing exit', {
                timeoutMs: this.shutdownTimeoutMs,
            });
            process.exit(exitCode === 0 ? 1 : exitCode);
        }, this.shutdownTimeoutMs);
        if (forceExit.unref)
            forceExit.unref();
        for (const { name, fn } of this.hooks) {
            const t0 = Date.now();
            try {
                await Promise.resolve(fn());
                loggers.bot.info(`Shutdown hook completed: ${name}`, { ms: Date.now() - t0 });
            }
            catch (err) {
                loggers.bot.error(`Shutdown hook failed: ${name}`, {
                    ms: Date.now() - t0,
                    error: err instanceof Error ? err.message : String(err),
                });
            }
        }
        clearTimeout(forceExit);
        loggers.bot.info('Graceful shutdown complete', { signal, exitCode });
        process.exit(exitCode);
    }
    get shuttingDown() {
        return this.isShuttingDown;
    }
}
export const gracefulShutdown = new GracefulShutdown(parseInt(process.env.SHUTDOWN_TIMEOUT_MS ?? '15000', 10));
export default gracefulShutdown;
//# sourceMappingURL=GracefulShutdown.js.map