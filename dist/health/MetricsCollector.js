// @ts-nocheck
/**
 * ══════════════════════════════════════════════════
 *  Panindigan Metrics Collector
 *  Prometheus-compatible text + JSON metrics
 * ══════════════════════════════════════════════════
 */
import { EventEmitter } from 'events';
class MetricsCollector extends EventEmitter {
    counters = new Map();
    gauges = new Map();
    histograms = new Map();
    eventLoopDelayMs = 0;
    cpuUsage = { user: 0, system: 0 };
    lastCpuCheck = process.hrtime.bigint();
    lastCpuUsage = process.cpuUsage();
    startTime = Date.now();
    loopDelayTimer = null;
    constructor() {
        super();
        this.startEventLoopMonitor();
        this.startCpuMonitor();
    }
    // ── Counter methods ────────────────────────────────────────────────────────
    increment(metric, value = 1) {
        this.counters.set(metric, (this.counters.get(metric) ?? 0) + value);
    }
    getCounter(metric) {
        return this.counters.get(metric) ?? 0;
    }
    // ── Gauge methods ──────────────────────────────────────────────────────────
    setGauge(metric, value) {
        this.gauges.set(metric, value);
    }
    getGauge(metric) {
        return this.gauges.get(metric) ?? 0;
    }
    // ── Histogram ─────────────────────────────────────────────────────────────
    observe(metric, value) {
        if (!this.histograms.has(metric))
            this.histograms.set(metric, []);
        const arr = this.histograms.get(metric);
        arr.push(value);
        // Keep last 1000 observations to avoid unbounded memory
        if (arr.length > 1000)
            arr.splice(0, arr.length - 1000);
    }
    getP99(metric) {
        const arr = this.histograms.get(metric);
        if (!arr || arr.length === 0)
            return 0;
        const sorted = [...arr].sort((a, b) => a - b);
        return sorted[Math.floor(sorted.length * 0.99)] ?? 0;
    }
    getAvg(metric) {
        const arr = this.histograms.get(metric);
        if (!arr || arr.length === 0)
            return 0;
        return arr.reduce((a, b) => a + b, 0) / arr.length;
    }
    // ── Event loop monitor ────────────────────────────────────────────────────
    startEventLoopMonitor() {
        const CHECK_INTERVAL = 500;
        let last = Date.now();
        this.loopDelayTimer = setInterval(() => {
            const now = Date.now();
            const delay = now - last - CHECK_INTERVAL;
            this.eventLoopDelayMs = Math.max(0, delay);
            last = now;
        }, CHECK_INTERVAL);
        if (this.loopDelayTimer.unref)
            this.loopDelayTimer.unref();
    }
    // ── CPU monitor ───────────────────────────────────────────────────────────
    startCpuMonitor() {
        const timer = setInterval(() => {
            const now = process.hrtime.bigint();
            const usage = process.cpuUsage();
            const elapsed = Number(now - this.lastCpuCheck) / 1e6; // ms
            if (elapsed > 0) {
                const userDelta = (usage.user - this.lastCpuUsage.user) / 1000; // ms
                const sysDelta = (usage.system - this.lastCpuUsage.system) / 1000; // ms
                this.cpuUsage = {
                    user: Math.min(100, (userDelta / elapsed) * 100),
                    system: Math.min(100, (sysDelta / elapsed) * 100),
                };
            }
            this.lastCpuCheck = now;
            this.lastCpuUsage = usage;
        }, 5000);
        if (timer.unref)
            timer.unref();
    }
    // ── Snapshot ───────────────────────────────────────────────────────────────
    snapshot() {
        const mem = process.memoryUsage();
        const toMB = (bytes) => Math.round(bytes / 1024 / 1024 * 10) / 10;
        return {
            // Process
            cpuUsagePercent: Math.round((this.cpuUsage.user + this.cpuUsage.system) * 10) / 10,
            memoryUsedMB: toMB(mem.heapUsed),
            memoryTotalMB: toMB(mem.heapTotal),
            memoryRssMB: toMB(mem.rss),
            heapUsedMB: toMB(mem.heapUsed),
            heapTotalMB: toMB(mem.heapTotal),
            externalMB: toMB(mem.external),
            arrayBuffersMB: toMB(mem.arrayBuffers ?? 0),
            eventLoopDelayMs: this.eventLoopDelayMs,
            uptimeSeconds: Math.floor(process.uptime()),
            pid: process.pid,
            // Discord (from gauges set by bot)
            guildCount: this.getGauge('discord.guilds'),
            memberCount: this.getGauge('discord.members'),
            shardCount: this.getGauge('discord.shards'),
            gatewayLatencyMs: this.getGauge('discord.gateway_latency'),
            restLatencyMs: this.getGauge('discord.rest_latency'),
            commandCount: this.getGauge('bot.command_count'),
            eventCount: this.getGauge('bot.event_count'),
            voiceConnections: this.getGauge('music.voice_connections'),
            activeMusicPlayers: this.getGauge('music.active_players'),
            // Counters
            commandsExecuted: this.getCounter('commands.executed'),
            commandErrors: this.getCounter('commands.errors'),
            interactionsTotal: this.getCounter('interactions.total'),
            guildJoins: this.getCounter('guilds.joins'),
            guildLeaves: this.getCounter('guilds.leaves'),
            cacheHits: this.getCounter('cache.hits'),
            cacheMisses: this.getCounter('cache.misses'),
            dbQueries: this.getCounter('db.queries'),
            redisOps: this.getCounter('redis.ops'),
            musicSessions: this.getCounter('music.sessions'),
            httpRequests: this.getCounter('http.requests'),
            httpLatencyMs: Math.round(this.getAvg('http.latency')),
        };
    }
    // ── Prometheus text format ────────────────────────────────────────────────
    toPrometheusText() {
        const m = this.snapshot();
        const ts = Date.now();
        const lines = [
            '# HELP panindigan_cpu_usage_percent CPU usage percentage',
            '# TYPE panindigan_cpu_usage_percent gauge',
            `panindigan_cpu_usage_percent ${m.cpuUsagePercent} ${ts}`,
            '',
            '# HELP panindigan_memory_heap_used_bytes Heap memory used',
            '# TYPE panindigan_memory_heap_used_bytes gauge',
            `panindigan_memory_heap_used_bytes ${Math.round(m.heapUsedMB * 1024 * 1024)} ${ts}`,
            '',
            '# HELP panindigan_memory_heap_total_bytes Heap memory total',
            '# TYPE panindigan_memory_heap_total_bytes gauge',
            `panindigan_memory_heap_total_bytes ${Math.round(m.heapTotalMB * 1024 * 1024)} ${ts}`,
            '',
            '# HELP panindigan_memory_rss_bytes Resident set size',
            '# TYPE panindigan_memory_rss_bytes gauge',
            `panindigan_memory_rss_bytes ${Math.round(m.memoryRssMB * 1024 * 1024)} ${ts}`,
            '',
            '# HELP panindigan_event_loop_delay_ms Event loop delay in milliseconds',
            '# TYPE panindigan_event_loop_delay_ms gauge',
            `panindigan_event_loop_delay_ms ${m.eventLoopDelayMs} ${ts}`,
            '',
            '# HELP panindigan_uptime_seconds Process uptime in seconds',
            '# TYPE panindigan_uptime_seconds counter',
            `panindigan_uptime_seconds ${m.uptimeSeconds} ${ts}`,
            '',
            '# HELP panindigan_guilds Discord guild count',
            '# TYPE panindigan_guilds gauge',
            `panindigan_guilds ${m.guildCount} ${ts}`,
            '',
            '# HELP panindigan_members Discord member count',
            '# TYPE panindigan_members gauge',
            `panindigan_members ${m.memberCount} ${ts}`,
            '',
            '# HELP panindigan_gateway_latency_ms Discord gateway latency',
            '# TYPE panindigan_gateway_latency_ms gauge',
            `panindigan_gateway_latency_ms ${m.gatewayLatencyMs} ${ts}`,
            '',
            '# HELP panindigan_commands_executed_total Total commands executed',
            '# TYPE panindigan_commands_executed_total counter',
            `panindigan_commands_executed_total ${m.commandsExecuted} ${ts}`,
            '',
            '# HELP panindigan_commands_errors_total Total command errors',
            '# TYPE panindigan_commands_errors_total counter',
            `panindigan_commands_errors_total ${m.commandErrors} ${ts}`,
            '',
            '# HELP panindigan_interactions_total Total interactions handled',
            '# TYPE panindigan_interactions_total counter',
            `panindigan_interactions_total ${m.interactionsTotal} ${ts}`,
            '',
            '# HELP panindigan_voice_connections Active voice connections',
            '# TYPE panindigan_voice_connections gauge',
            `panindigan_voice_connections ${m.voiceConnections} ${ts}`,
            '',
            '# HELP panindigan_music_players Active music players',
            '# TYPE panindigan_music_players gauge',
            `panindigan_music_players ${m.activeMusicPlayers} ${ts}`,
            '',
            '# HELP panindigan_cache_hits_total Cache hits',
            '# TYPE panindigan_cache_hits_total counter',
            `panindigan_cache_hits_total ${m.cacheHits} ${ts}`,
            '',
            '# HELP panindigan_cache_misses_total Cache misses',
            '# TYPE panindigan_cache_misses_total counter',
            `panindigan_cache_misses_total ${m.cacheMisses} ${ts}`,
            '',
            '# HELP panindigan_db_queries_total Database queries',
            '# TYPE panindigan_db_queries_total counter',
            `panindigan_db_queries_total ${m.dbQueries} ${ts}`,
            '',
            '# HELP panindigan_redis_ops_total Redis operations',
            '# TYPE panindigan_redis_ops_total counter',
            `panindigan_redis_ops_total ${m.redisOps} ${ts}`,
            '',
            '# HELP panindigan_guild_joins_total Total guild joins',
            '# TYPE panindigan_guild_joins_total counter',
            `panindigan_guild_joins_total ${m.guildJoins} ${ts}`,
            '',
            '# HELP panindigan_guild_leaves_total Total guild leaves',
            '# TYPE panindigan_guild_leaves_total counter',
            `panindigan_guild_leaves_total ${m.guildLeaves} ${ts}`,
            '',
            '# HELP panindigan_http_requests_total HTTP requests to health server',
            '# TYPE panindigan_http_requests_total counter',
            `panindigan_http_requests_total ${m.httpRequests} ${ts}`,
        ];
        return lines.join('\n') + '\n';
    }
    destroy() {
        if (this.loopDelayTimer)
            clearInterval(this.loopDelayTimer);
    }
}
export const metrics = new MetricsCollector();
export default metrics;
//# sourceMappingURL=MetricsCollector.js.map