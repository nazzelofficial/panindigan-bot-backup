/**
 * ══════════════════════════════════════════════════
 *  Panindigan Health Checker
 *  Continuously monitors all service dependencies
 * ══════════════════════════════════════════════════
 */
import { loggers } from '../utils/Logger.js';
class HealthChecker {
    deps = new Map();
    checks = new Map();
    checkIntervalMs;
    cacheMs;
    timer = null;
    running = false;
    constructor(checkIntervalMs = 30_000, cacheMs = 15_000) {
        this.checkIntervalMs = checkIntervalMs;
        this.cacheMs = cacheMs;
    }
    // ── Register / remove ─────────────────────────────────────────────────────
    register(name, checkFn) {
        this.checks.set(name, checkFn);
        this.deps.set(name, {
            name,
            status: 'unknown',
            lastChecked: 0,
            consecutive_failures: 0,
        });
    }
    unregister(name) {
        this.checks.delete(name);
        this.deps.delete(name);
    }
    // ── Run a single check ────────────────────────────────────────────────────
    async runCheck(name) {
        const fn = this.checks.get(name);
        if (!fn)
            return;
        const prev = this.deps.get(name);
        const t0 = Date.now();
        try {
            const result = await Promise.race([
                fn(),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Health check timed out')), 10_000)),
            ]);
            const latencyMs = Date.now() - t0;
            this.deps.set(name, {
                name,
                status: result.ok ? 'healthy' : 'unhealthy',
                latencyMs,
                message: result.message,
                lastChecked: Date.now(),
                consecutive_failures: result.ok ? 0 : (prev.consecutive_failures + 1),
            });
        }
        catch (err) {
            const latencyMs = Date.now() - t0;
            const failures = prev.consecutive_failures + 1;
            this.deps.set(name, {
                name,
                status: failures >= 3 ? 'unhealthy' : 'degraded',
                latencyMs,
                message: err instanceof Error ? err.message : String(err),
                lastChecked: Date.now(),
                consecutive_failures: failures,
            });
            if (failures === 1 || failures % 5 === 0) {
                loggers.health.warn(`Dependency check failed: ${name}`, {
                    consecutiveFailures: failures,
                    error: err instanceof Error ? err.message : String(err),
                });
            }
        }
    }
    // ── Run all checks ────────────────────────────────────────────────────────
    async checkAll() {
        await Promise.allSettled(Array.from(this.checks.keys()).map((name) => this.runCheck(name)));
    }
    // ── Get single dependency (cached) ────────────────────────────────────────
    async get(name) {
        const dep = this.deps.get(name);
        if (!dep)
            return { name, status: 'unknown', lastChecked: 0, consecutive_failures: 0 };
        const stale = Date.now() - dep.lastChecked > this.cacheMs;
        if (stale)
            await this.runCheck(name);
        return this.deps.get(name);
    }
    // ── Full report ───────────────────────────────────────────────────────────
    async report(forceRefresh = false) {
        if (forceRefresh)
            await this.checkAll();
        const dependencies = {};
        for (const [name, dep] of this.deps) {
            const stale = Date.now() - dep.lastChecked > this.cacheMs;
            if (stale)
                await this.runCheck(name);
            dependencies[name] = this.deps.get(name);
        }
        const statuses = Object.values(dependencies).map((d) => d.status);
        let overall = 'healthy';
        if (statuses.some((s) => s === 'unhealthy'))
            overall = 'unhealthy';
        else if (statuses.some((s) => s === 'degraded' || s === 'unknown'))
            overall = 'degraded';
        return { status: overall, timestamp: Date.now(), dependencies };
    }
    // ── Start / stop background polling ──────────────────────────────────────
    start() {
        if (this.running)
            return;
        this.running = true;
        this.checkAll(); // immediate first run
        this.timer = setInterval(() => this.checkAll(), this.checkIntervalMs);
        if (this.timer.unref)
            this.timer.unref();
        loggers.health.info('Health checker started', {
            interval: this.checkIntervalMs,
            dependencies: Array.from(this.checks.keys()),
        });
    }
    stop() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        this.running = false;
        loggers.health.info('Health checker stopped');
    }
    // ── Convenience: aggregate status ────────────────────────────────────────
    overallStatus() {
        const statuses = Array.from(this.deps.values()).map((d) => d.status);
        if (statuses.length === 0)
            return 'unknown';
        if (statuses.some((s) => s === 'unhealthy'))
            return 'unhealthy';
        if (statuses.some((s) => s === 'degraded' || s === 'unknown'))
            return 'degraded';
        return 'healthy';
    }
    isReady() {
        const critical = ['discord', 'database', 'redis'];
        return critical.every((name) => {
            const dep = this.deps.get(name);
            return dep?.status === 'healthy';
        });
    }
    isLive() {
        // Process is alive and event loop is responsive — always true if we get here
        return true;
    }
}
export const healthChecker = new HealthChecker(parseInt(process.env.HEALTH_CHECK_INTERVAL_MS ?? '30000', 10), parseInt(process.env.HEALTH_CACHE_MS ?? '15000', 10));
export default healthChecker;
//# sourceMappingURL=HealthChecker.js.map