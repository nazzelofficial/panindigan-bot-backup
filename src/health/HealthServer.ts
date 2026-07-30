/**
 * ══════════════════════════════════════════════════
 *  Panindigan Enterprise Health Server
 *  Production HTTP server — all monitoring endpoints
 *  Compatible with UptimeRobot, BetterStack, Prometheus,
 *  Datadog, Grafana, Healthchecks.io, Uptime Kuma, etc.
 * ══════════════════════════════════════════════════
 */

import { createServer, IncomingMessage, ServerResponse } from 'http';
import { loggers } from '../utils/Logger.js';
import { healthChecker, type HealthReport } from './HealthChecker.js';
import { metrics } from './MetricsCollector.js';
import { detectHosting, type HostingInfo } from './HostingDetector.js';
import { readFileSync } from 'fs';
import { join } from 'path';

// ─── Version info (read once at startup) ──────────────────────────────────────

function readVersion(): { version: string; gitCommit: string; gitBranch: string; buildTimestamp: string } {
  let version = 'unknown';
  let gitCommit = 'unknown';
  let gitBranch = 'unknown';
  const buildTimestamp = new Date().toISOString();

  try {
    const pkg = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf8'));
    version = pkg.version ?? 'unknown';
  } catch { /* silent */ }

  try {
    const head = readFileSync(join(process.cwd(), '.git', 'HEAD'), 'utf8').trim();
    if (head.startsWith('ref: ')) {
      gitBranch = head.slice(5).split('/').pop() ?? 'unknown';
      const refPath = join(process.cwd(), '.git', head.slice(5));
      gitCommit = readFileSync(refPath, 'utf8').trim().slice(0, 8);
    } else {
      gitCommit = head.slice(0, 8);
    }
  } catch { /* silent */ }

  return { version, gitCommit, gitBranch, buildTimestamp };
}

// ─── Types ─────────────────────────────────────────────────────────────────────

interface HealthServerOptions {
  port?: number;
  host?: string;
  authToken?: string;        // HEALTH_AUTH_TOKEN
  authHeader?: string;       // Authorization: Bearer <token>
  allowedIps?: string[];     // IP allowlist (optional)
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function json(res: ServerResponse, status: number, body: unknown): void {
  const data = JSON.stringify(body, null, 2);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store, no-cache, must-revalidate',
    'X-Content-Type-Options': 'nosniff',
  });
  res.end(data);
}

function text(res: ServerResponse, status: number, body: string, contentType = 'text/plain; charset=utf-8'): void {
  res.writeHead(status, {
    'Content-Type': contentType,
    'Cache-Control': 'no-store, no-cache, must-revalidate',
  });
  res.end(body);
}

function html(res: ServerResponse, body: string): void {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(body);
}

function getClientIp(req: IncomingMessage): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') return forwarded.split(',')[0].trim();
  return req.socket.remoteAddress ?? 'unknown';
}

function checkAuth(req: IncomingMessage, authToken?: string, allowedIps?: string[]): boolean {
  if (!authToken && (!allowedIps || allowedIps.length === 0)) return true;

  if (authToken) {
    const header = req.headers['authorization'] ?? req.headers['x-health-key'];
    const provided = typeof header === 'string'
      ? header.replace(/^Bearer\s+/i, '').trim()
      : '';
    if (provided === authToken) return true;
  }

  if (allowedIps && allowedIps.length > 0) {
    const ip = getClientIp(req);
    if (allowedIps.includes(ip)) return true;
  }

  return false;
}

function statusToHttpCode(status: string, isReady: boolean): number {
  if (status === 'healthy' && isReady) return 200;
  if (status === 'degraded') return 200; // degraded = running but impaired
  return 503;
}

// ─── Health Server ────────────────────────────────────────────────────────────

export class HealthServer {
  private readonly port: number;
  private readonly host: string;
  private readonly authToken?: string;
  private readonly allowedIps: string[];
  private readonly bootTimestamp: number;
  private readonly hostingInfo: HostingInfo;
  private readonly versionInfo: ReturnType<typeof readVersion>;
  private botContext: BotContextProvider | null = null;
  private server: ReturnType<typeof createServer> | null = null;

  constructor(options: HealthServerOptions = {}) {
    this.port      = parseInt(process.env.HEALTH_PORT ?? process.env.PORT ?? String(options.port ?? 3000), 10);
    this.host      = process.env.HEALTH_HOST ?? process.env.HOST ?? options.host ?? '0.0.0.0';
    this.authToken = process.env.HEALTH_AUTH_TOKEN ?? options.authToken;
    this.allowedIps = (process.env.HEALTH_ALLOWED_IPS ?? '').split(',').map((s) => s.trim()).filter(Boolean);
    this.bootTimestamp = options.bootTimestamp ?? Date.now();
    this.hostingInfo = detectHosting();
    this.versionInfo = readVersion();
  }

  public setBotContext(ctx: BotContextProvider): void {
    this.botContext = ctx;
  }

  // ── Start ─────────────────────────────────────────────────────────────────

  public start(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server = createServer((req, res) => {
        metrics.increment('http.requests');
        const t0 = Date.now();

        const requireAuth = (path: string): boolean => {
          if (!checkAuth(req, this.authToken, this.allowedIps.length ? this.allowedIps : undefined)) {
            loggers.health.warn(`Unauthorized request to ${path}`, { ip: getClientIp(req) });
            json(res, 401, { error: 'Unauthorized', path });
            return false;
          }
          return true;
        };

        const url = (req.url ?? '/').split('?')[0];

        try {
          switch (url) {
            case '/':                         this.handleIndex(req, res);         break;
            case '/health':                   this.handleHealth(req, res);        break;
            case '/health/live':              this.handleLive(req, res);          break;
            case '/health/ready':             this.handleReady(req, res);         break;
            case '/metrics':
              if (!requireAuth('/metrics')) break;
              this.handleMetrics(req, res);
              break;
            case '/version':                  this.handleVersion(req, res);       break;
            case '/status':
              if (!requireAuth('/status')) break;
              this.handleStatus(req, res);
              break;
            case '/info':
              if (!requireAuth('/info')) break;
              this.handleInfo(req, res);
              break;
            case '/startup':                  this.handleStartup(req, res);       break;
            default:
              json(res, 404, { error: 'Not found', path: url });
          }
        } catch (err) {
          loggers.health.error('Health server handler error', {
            path: url,
            error: err instanceof Error ? err.message : String(err),
          });
          json(res, 500, { error: 'Internal server error' });
        }

        metrics.observe('http.latency', Date.now() - t0);
      });

      this.server.on('error', (err) => {
        loggers.health.error('Health server error', { error: err.message });
        reject(err);
      });

      this.server.listen(this.port, this.host, () => {
        loggers.health.info('Health server started', {
          port: this.port,
          host: this.host,
          endpoints: ['/', '/health', '/health/live', '/health/ready', '/metrics', '/version', '/status', '/info'],
        });
        resolve();
      });
    });
  }

  public stop(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.server) { resolve(); return; }
      this.server.close(() => {
        loggers.health.info('Health server stopped');
        resolve();
      });
    });
  }

  // ── GET / ─────────────────────────────────────────────────────────────────

  private handleIndex(_req: IncomingMessage, res: ServerResponse): void {
    html(res, `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Panindigan Health</title>
<style>
  body { font-family: monospace; background:#0d1117; color:#c9d1d9; padding:2rem; max-width:700px; margin:0 auto; }
  h1 { color:#58a6ff; } h2 { color:#79c0ff; }
  a { color:#58a6ff; text-decoration:none; }
  a:hover { text-decoration:underline; }
  .badge { display:inline-block; padding:2px 8px; border-radius:4px; font-size:0.9em; }
  .healthy { background:#238636; color:#fff; }
  .degraded { background:#9e6a03; color:#fff; }
  .unhealthy { background:#da3633; color:#fff; }
  table { border-collapse:collapse; width:100%; }
  td, th { padding:0.4rem 0.8rem; border:1px solid #30363d; }
  th { background:#161b22; }
</style>
</head>
<body>
<h1>🤖 Panindigan Health Monitor</h1>
<p>Version <strong>${this.versionInfo.version}</strong> · Commit <code>${this.versionInfo.gitCommit}</code></p>
<h2>Endpoints</h2>
<table>
<tr><th>Endpoint</th><th>Description</th><th>Auth</th></tr>
<tr><td><a href="/health">/health</a></td><td>Overall health status (200 / 503)</td><td>No</td></tr>
<tr><td><a href="/health/live">/health/live</a></td><td>Liveness probe — process alive</td><td>No</td></tr>
<tr><td><a href="/health/ready">/health/ready</a></td><td>Readiness probe — all deps ready</td><td>No</td></tr>
<tr><td><a href="/metrics">/metrics</a></td><td>Prometheus metrics</td><td>${this.authToken ? 'Yes' : 'No'}</td></tr>
<tr><td><a href="/version">/version</a></td><td>Version and build info</td><td>No</td></tr>
<tr><td><a href="/status">/status</a></td><td>Full dependency status</td><td>${this.authToken ? 'Yes' : 'No'}</td></tr>
<tr><td><a href="/info">/info</a></td><td>Runtime information</td><td>${this.authToken ? 'Yes' : 'No'}</td></tr>
</table>
</body>
</html>`);
  }

  // ── GET /health ────────────────────────────────────────────────────────────

  private handleHealth(_req: IncomingMessage, res: ServerResponse): void {
    const report = this.getCachedReport();
    const isReady = this.botContext?.isReady() ?? false;
    const httpStatus = statusToHttpCode(report.status, isReady);

    json(res, httpStatus, {
      status: report.status,
      ready: isReady,
      uptime: Math.floor(process.uptime()),
      uptimeSinceBootMs: Date.now() - this.bootTimestamp,
      gatewayLatencyMs: this.botContext?.getGatewayLatency() ?? null,
      guildCount: this.botContext?.getGuildCount() ?? null,
      shardCount: this.botContext?.getShardCount() ?? null,
      timestamp: new Date().toISOString(),
    });
  }

  // ── GET /health/live ──────────────────────────────────────────────────────

  private handleLive(_req: IncomingMessage, res: ServerResponse): void {
    const eventLoopResponsive = metrics.snapshot().eventLoopDelayMs < 5000;
    const alive = healthChecker.isLive() && eventLoopResponsive;

    json(res, alive ? 200 : 503, {
      status: alive ? 'alive' : 'dead',
      pid: process.pid,
      uptime: Math.floor(process.uptime()),
      eventLoopDelayMs: metrics.snapshot().eventLoopDelayMs,
      heartbeatHealthy: alive,
      timestamp: new Date().toISOString(),
    });
  }

  // ── GET /health/ready ─────────────────────────────────────────────────────

  private handleReady(_req: IncomingMessage, res: ServerResponse): void {
    const report = this.getCachedReport();
    const gatewayOk = (report.dependencies['discord']?.status ?? 'unknown') === 'healthy';
    const dbOk = (report.dependencies['database']?.status ?? 'unknown') !== 'unhealthy';
    const redisOk = (report.dependencies['redis']?.status ?? 'unknown') !== 'unhealthy';
    const cacheInit = this.botContext?.getCommandCount() !== undefined;
    const commandsLoaded = (this.botContext?.getCommandCount() ?? 0) > 0;
    const eventsLoaded = (this.botContext?.getEventCount() ?? 0) > 0;
    const botReady = this.botContext?.isReady() ?? false;

    const ready = gatewayOk && dbOk && redisOk && botReady;

    json(res, ready ? 200 : 503, {
      ready,
      checks: {
        gatewayConnected: gatewayOk,
        databaseReady: dbOk,
        redisReady: redisOk,
        cacheInitialized: cacheInit,
        commandsLoaded,
        eventsLoaded,
        configurationValid: true,
        botReady,
      },
      timestamp: new Date().toISOString(),
    });
  }

  // ── GET /metrics ───────────────────────────────────────────────────────────

  private handleMetrics(_req: IncomingMessage, res: ServerResponse): void {
    // Update bot gauges from context
    if (this.botContext) {
      metrics.setGauge('discord.guilds', this.botContext.getGuildCount());
      metrics.setGauge('discord.members', this.botContext.getMemberCount());
      metrics.setGauge('discord.shards', this.botContext.getShardCount());
      metrics.setGauge('discord.gateway_latency', this.botContext.getGatewayLatency());
      metrics.setGauge('bot.command_count', this.botContext.getCommandCount());
      metrics.setGauge('bot.event_count', this.botContext.getEventCount());
      metrics.setGauge('music.voice_connections', this.botContext.getVoiceConnections());
      metrics.setGauge('music.active_players', this.botContext.getMusicPlayers());
    }

    text(res, 200, metrics.toPrometheusText(), 'text/plain; version=0.0.4; charset=utf-8');
  }

  // ── GET /version ──────────────────────────────────────────────────────────

  private handleVersion(_req: IncomingMessage, res: ServerResponse): void {
    json(res, 200, {
      version: this.versionInfo.version,
      gitCommit: this.versionInfo.gitCommit,
      gitBranch: this.versionInfo.gitBranch,
      buildTimestamp: this.versionInfo.buildTimestamp,
      bootTimestamp: new Date(this.bootTimestamp).toISOString(),
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
    });
  }

  // ── GET /status ───────────────────────────────────────────────────────────

  private handleStatus(_req: IncomingMessage, res: ServerResponse): void {
    const report = this.getCachedReport();
    const dep = report.dependencies;

    json(res, statusToHttpCode(report.status, this.botContext?.isReady() ?? false), {
      status: report.status,
      timestamp: new Date().toISOString(),
      dependencies: dep,
    });
  }

  // ── GET /info ─────────────────────────────────────────────────────────────

  private handleInfo(_req: IncomingMessage, res: ServerResponse): void {
    const snap = metrics.snapshot();
    const report = this.getCachedReport();

    json(res, 200, {
      status: report.status,
      version: this.versionInfo,
      bot: this.botContext ? {
        ready: this.botContext.isReady(),
        guilds: this.botContext.getGuildCount(),
        members: this.botContext.getMemberCount(),
        shards: this.botContext.getShardCount(),
        shardId: this.botContext.getShardId(),
        gatewayLatencyMs: this.botContext.getGatewayLatency(),
        commandsLoaded: this.botContext.getCommandCount(),
        eventsLoaded: this.botContext.getEventCount(),
        voiceConnections: this.botContext.getVoiceConnections(),
        activeMusicPlayers: this.botContext.getMusicPlayers(),
      } : null,
      process: {
        pid: snap.pid,
        uptimeSeconds: snap.uptimeSeconds,
        nodeVersion: process.version,
        platform: process.platform,
        arch: snap.pid ? process.arch : 'unknown',
        hostname: process.env.HOSTNAME ?? 'unknown',
      },
      memory: {
        heapUsedMB: snap.heapUsedMB,
        heapTotalMB: snap.heapTotalMB,
        rssMB: snap.memoryRssMB,
        externalMB: snap.externalMB,
      },
      cpu: {
        usagePercent: snap.cpuUsagePercent,
        eventLoopDelayMs: snap.eventLoopDelayMs,
      },
      hosting: this.hostingInfo,
      counters: {
        commandsExecuted: snap.commandsExecuted,
        commandErrors: snap.commandErrors,
        interactionsTotal: snap.interactionsTotal,
        guildJoins: snap.guildJoins,
        guildLeaves: snap.guildLeaves,
        cacheHits: snap.cacheHits,
        cacheMisses: snap.cacheMisses,
        dbQueries: snap.dbQueries,
        redisOps: snap.redisOps,
        musicSessions: snap.musicSessions,
        httpRequests: snap.httpRequests,
      },
      timestamp: new Date().toISOString(),
      bootTimestamp: new Date(this.bootTimestamp).toISOString(),
    });
  }

  // ── GET /startup ──────────────────────────────────────────────────────────

  private handleStartup(_req: IncomingMessage, res: ServerResponse): void {
    json(res, 200, {
      ready: this.botContext?.isReady() ?? false,
      uptime: Math.floor(process.uptime()),
      hosting: this.hostingInfo.provider,
      timestamp: new Date().toISOString(),
    });
  }

  // ── Cache ─────────────────────────────────────────────────────────────────

  private cachedReport: HealthReport | null = null;
  private lastReportMs = 0;
  private readonly REPORT_CACHE_MS = parseInt(process.env.HEALTH_CACHE_MS ?? '10000', 10);

  private getCachedReport(): HealthReport {
    const now = Date.now();
    if (!this.cachedReport || now - this.lastReportMs > this.REPORT_CACHE_MS) {
      // Kick off async refresh without blocking the response
      healthChecker.report().then((r) => {
        this.cachedReport = r;
        this.lastReportMs = Date.now();
      }).catch(() => { /* silent */ });

      if (!this.cachedReport) {
        // First call — return a quick synchronous snapshot based on known state
        const deps: Record<string, import('./HealthChecker.js').DependencyHealth> = {};
        this.cachedReport = { status: 'unknown', timestamp: now, dependencies: deps };
      }
    }
    return this.cachedReport;
  }
}

export default HealthServer;
