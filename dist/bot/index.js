// @ts-nocheck
/**
 * ══════════════════════════════════════════════════
 *  Panindigan Bot Entry Point
 *  Enterprise health monitoring · Auto-recovery
 *  Graceful shutdown · Metrics · Full observability
 * ══════════════════════════════════════════════════
 */
import 'dotenv/config';
import { PanindiganClient } from '../structures/PanindiganClient.js';
import { loadCommands } from '../handlers/CommandHandler.js';
import { loadEvents } from '../handlers/EventHandler.js';
import { loggers, registerGlobalErrorHandlers, startHealthCheckLogger } from '../utils/Logger.js';
import { printBanner } from '../utils/Banner.js';
import { HealthServer } from '../health/HealthServer.js';
import { healthChecker } from '../health/HealthChecker.js';
import { gracefulShutdown } from '../health/GracefulShutdown.js';
import { metrics } from '../health/MetricsCollector.js';
import { isRedisConnected } from '../database/redis/client.js';
import { isMongoConnected } from '../database/mongodb/client.js';
import config from '../../config.json' with { type: 'json' };
// ─── Boot timestamp ────────────────────────────────────────────────────────────
const BOOT_TIMESTAMP = Date.now();
// ─── Print banner ──────────────────────────────────────────────────────────────
printBanner({
    version: config.configVersion ?? '0.1.0',
    environment: process.env.NODE_ENV ?? 'development',
    nodeVersion: process.version,
    mode: 'bot',
});
// ─── Register global handlers (keeps process alive through transient errors) ───
registerGlobalErrorHandlers();
const startupState = {
    step: 'initialization',
    startTime: BOOT_TIMESTAMP,
    completedSteps: [],
    errors: [],
};
let isBotReady = false;
let isStartupComplete = false;
// ─── Startup step runner ──────────────────────────────────────────────────────
const STARTUP_TIMEOUT_MS = 5 * 60 * 1000;
let startupTimeout = null;
async function runStep(name, fn, timeoutMs = 30_000) {
    startupState.step = name;
    loggers.bot.info(`Starting step: ${name}`);
    const t0 = Date.now();
    return Promise.race([
        fn(),
        new Promise((_, reject) => setTimeout(() => reject(new Error(`Step '${name}' timed out after ${timeoutMs}ms`)), timeoutMs)),
    ]).then((result) => {
        const ms = Date.now() - t0;
        loggers.bot.info(`Step complete: ${name}`, { durationMs: ms });
        startupState.completedSteps.push(name);
        return result;
    }).catch((err) => {
        const ms = Date.now() - t0;
        const msg = err instanceof Error ? err.message : String(err);
        loggers.bot.error(`Step failed: ${name}`, { durationMs: ms, error: msg });
        startupState.errors.push({ step: name, error: msg, timestamp: Date.now() });
        throw err;
    });
}
// ─── Environment validation ───────────────────────────────────────────────────
function validateEnvironment() {
    // Replit exposes PostgreSQL as DATABASE_URL (runtime-managed).
    // Accept either DATABASE_URL or POSTGRES_URL so the bot starts cleanly on Replit.
    if (!process.env.POSTGRES_URL && process.env.DATABASE_URL) {
        process.env.POSTGRES_URL = process.env.DATABASE_URL;
    }
    const required = [
        'DISCORD_TOKEN',
        'DISCORD_CLIENT_ID',
        'POSTGRES_URL',
        'MONGODB_URI',
        'REDIS_URL',
    ];
    const missing = required.filter((v) => !process.env[v]);
    if (missing.length > 0) {
        loggers.bot.error('Missing required environment variables', { missing });
        process.exit(1);
    }
}
// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
    startupTimeout = setTimeout(() => {
        loggers.bot.error('Startup timeout exceeded', {
            step: startupState.step,
            completed: startupState.completedSteps,
        });
        process.exit(1);
    }, STARTUP_TIMEOUT_MS);
    // ── Build & start health server first so monitoring services see /health immediately ──
    const healthServer = new HealthServer({ bootTimestamp: BOOT_TIMESTAMP });
    try {
        await runStep('environment', () => {
            validateEnvironment();
            return Promise.resolve();
        }, 5_000);
        await runStep('config', async () => {
            const enabled = Object.keys(config.features).filter((k) => config.features[k]);
            loggers.bot.info('Features loaded', { enabled });
        }, 5_000);
        const client = await runStep('client', async () => {
            const shards = process.env.SHARDS ? JSON.parse(process.env.SHARDS) : [0];
            const shardId = shards[0] ?? 0;
            const totalShards = parseInt(process.env.TOTAL_SHARDS ?? '1', 10);
            const c = new PanindiganClient(shardId, totalShards);
            loggers.bot.info('Discord client initialized', { shardId, totalShards });
            return c;
        }, 10_000);
        // ── Attach health server bot context ───────────────────────────────────────
        healthServer.setBotContext({
            getGuildCount: () => client.guilds.cache.size,
            getMemberCount: () => client.guilds.cache.reduce((a, g) => a + g.memberCount, 0),
            getShardCount: () => client.totalShards,
            getShardId: () => client.shardId,
            getGatewayLatency: () => client.ws.ping,
            getCommandCount: () => client.commands.size,
            getEventCount: () => client._eventsCount ?? 0,
            getVoiceConnections: () => client.kazagumo?.shoukaku?.players?.size ?? 0,
            getMusicPlayers: () => client.kazagumo?.players?.size ?? 0,
            isReady: () => isBotReady,
        });
        // ── Register dependency health checks ──────────────────────────────────────
        healthChecker.register('discord', async () => {
            const ping = client.ws.ping;
            if (!isBotReady)
                return { ok: false, message: 'Gateway not connected' };
            return {
                ok: ping >= 0 && ping < 2000,
                latencyMs: ping,
                message: ping >= 2000 ? 'High gateway latency' : undefined,
            };
        });
        healthChecker.register('database', async () => {
            try {
                const { getPrismaClient } = await import('../database/postgresql/client.js');
                const prisma = getPrismaClient();
                const t0 = Date.now();
                await prisma.$queryRaw `SELECT 1`;
                return { ok: true, latencyMs: Date.now() - t0 };
            }
            catch (err) {
                return { ok: false, message: err instanceof Error ? err.message : String(err) };
            }
        });
        healthChecker.register('redis', async () => {
            if (!isRedisConnected())
                return { ok: false, message: 'Not connected' };
            try {
                const { getRedisClient } = await import('../database/redis/client.js');
                const t0 = Date.now();
                await getRedisClient().ping();
                return { ok: true, latencyMs: Date.now() - t0 };
            }
            catch (err) {
                return { ok: false, message: err instanceof Error ? err.message : String(err) };
            }
        });
        healthChecker.register('mongodb', async () => {
            if (!isMongoConnected())
                return { ok: false, message: 'Not connected' };
            try {
                const { getMongoDb } = await import('../database/mongodb/client.js');
                const t0 = Date.now();
                await getMongoDb().command({ ping: 1 });
                return { ok: true, latencyMs: Date.now() - t0 };
            }
            catch (err) {
                return { ok: false, message: err instanceof Error ? err.message : String(err) };
            }
        });
        healthChecker.register('lavalink', async () => {
            if (!client.kazagumo)
                return { ok: true, message: 'Disabled' };
            const nodes = Array.from(client.kazagumo.shoukaku.nodes.values());
            if (nodes.length === 0)
                return { ok: false, message: 'No nodes configured' };
            const connected = nodes.filter((n) => n.state === 1 /* Connected */);
            return {
                ok: connected.length > 0,
                message: `${connected.length}/${nodes.length} nodes connected`,
            };
        });
        // ── Start health server ────────────────────────────────────────────────────
        await runStep('health-server', () => healthServer.start(), 10_000);
        // ── Start health checker ───────────────────────────────────────────────────
        healthChecker.start();
        // ── Register shutdown hooks (ordered by priority) ──────────────────────────
        await runStep('shutdown-handlers', () => {
            gracefulShutdown.register('health-checker', () => healthChecker.stop(), 10);
            gracefulShutdown.register('health-server', () => healthServer.stop(), 20);
            gracefulShutdown.register('metrics', () => metrics.destroy(), 25);
            gracefulShutdown.register('music', async () => {
                if (!client.kazagumo)
                    return;
                const players = Array.from(client.kazagumo.players.values());
                for (const player of players) {
                    try {
                        player.destroy();
                    }
                    catch { /* silent */ }
                }
                loggers.music.info('All music players destroyed');
            }, 30);
            gracefulShutdown.register('discord', async () => {
                await client.destroy();
                loggers.bot.info('Discord client destroyed');
            }, 40);
            gracefulShutdown.register('redis', async () => {
                const { disconnectRedis } = await import('../database/redis/client.js');
                await disconnectRedis();
            }, 50);
            gracefulShutdown.register('mongodb', async () => {
                const { disconnectMongoDB } = await import('../database/mongodb/client.js');
                await disconnectMongoDB();
            }, 60);
            gracefulShutdown.register('postgresql', async () => {
                const { disconnectPrisma } = await import('../database/postgresql/client.js');
                await disconnectPrisma();
            }, 70);
            gracefulShutdown.attach();
            return Promise.resolve();
        }, 5_000);
        // ── Connect databases ──────────────────────────────────────────────────────
        await runStep('databases', async () => {
            await client.initializeDatabases();
            loggers.database.info('All databases connected');
        }, 60_000);
        // ── Music system ────────────────────────────────────────────────────────────
        await runStep('music', async () => {
            await client.initializeMusic();
        }, 30_000);
        // ── Load commands & events ─────────────────────────────────────────────────
        await runStep('commands', async () => {
            await loadCommands(client);
            loggers.loader.info('Commands loaded', { count: client.commands.size });
        }, 120_000);
        await runStep('events', async () => {
            await loadEvents(client);
            loggers.loader.info('Events registered');
        }, 30_000);
        // ── Login ─────────────────────────────────────────────────────────────────
        await runStep('login', async () => {
            const token = process.env.DISCORD_TOKEN;
            if (!token)
                throw new Error('DISCORD_TOKEN is not set');
            client.on('clientReady', () => {
                if (!isBotReady) {
                    loggers.bot.info('Bot is ready', {
                        tag: client.user?.tag,
                        guilds: client.guilds.cache.size,
                        shardId: client.shardId,
                    });
                }
                else {
                    loggers.bot.info('Bot reconnected', {
                        tag: client.user?.tag,
                        guilds: client.guilds.cache.size,
                    });
                }
                isBotReady = true;
                // Update metrics gauges on (re)connect
                metrics.setGauge('discord.guilds', client.guilds.cache.size);
                metrics.setGauge('discord.shards', client.totalShards);
                metrics.setGauge('discord.gateway_latency', client.ws.ping);
            });
            loggers.bot.info('Login initiated — awaiting token validation…');
            await client.login(token);
            loggers.bot.info('Token accepted — awaiting clientReady…');
            if (!isBotReady) {
                await new Promise((resolve) => {
                    const READY_TIMEOUT_MS = 120_000;
                    const timeout = setTimeout(() => {
                        loggers.bot.warn('clientReady not received within window — running in degraded mode; Discord.js will reconnect', { waitedMs: READY_TIMEOUT_MS });
                        resolve();
                    }, READY_TIMEOUT_MS);
                    client.once('clientReady', () => {
                        clearTimeout(timeout);
                        resolve();
                    });
                });
            }
        }, 125_000);
        // ── Periodic health log ────────────────────────────────────────────────────
        await runStep('health-logger', () => {
            startHealthCheckLogger(() => ({
                guilds: client.guilds.cache.size,
                users: client.guilds.cache.reduce((acc, g) => acc + g.memberCount, 0),
                shardId: client.shardId,
                commands: client.commands.size,
                wsLatency: client.ws.ping,
            }));
            return Promise.resolve();
        }, 5_000);
        // ── Done ──────────────────────────────────────────────────────────────────
        if (startupTimeout) {
            clearTimeout(startupTimeout);
            startupTimeout = null;
        }
        isStartupComplete = true;
        loggers.bot.info('🚀 Startup complete', {
            durationMs: Date.now() - BOOT_TIMESTAMP,
            steps: startupState.completedSteps.length,
            discordReady: isBotReady,
            tag: client.user?.tag ?? '(awaiting clientReady)',
            guilds: isBotReady ? client.guilds.cache.size : 0,
        });
    }
    catch (error) {
        if (startupTimeout)
            clearTimeout(startupTimeout);
        loggers.bot.error('Startup failed', {
            step: startupState.step,
            durationMs: Date.now() - BOOT_TIMESTAMP,
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
        });
        process.exit(1);
    }
}
main();
//# sourceMappingURL=index.js.map