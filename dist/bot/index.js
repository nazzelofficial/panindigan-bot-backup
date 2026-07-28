// @ts-nocheck
import 'dotenv/config';
import { createServer } from 'http';
import { PanindiganClient } from '../structures/PanindiganClient.js';
import { loadCommands } from '../handlers/CommandHandler.js';
import { loadEvents } from '../handlers/EventHandler.js';
import { loggers, registerGlobalErrorHandlers, startHealthCheckLogger } from '../utils/Logger.js';
import { printBanner } from '../utils/Banner.js';
import config from '../../config.json' with { type: 'json' };
const startupState = {
    step: 'initialization',
    startTime: Date.now(),
    completedSteps: [],
    errors: [],
};
// ─── Print banner ─────────────────────────────────────────────────────────────
printBanner({
    version: config.configVersion ?? '0.1.0',
    environment: process.env.NODE_ENV ?? 'development',
    nodeVersion: process.version,
    mode: 'bot',
});
// ─── Error handlers ───────────────────────────────────────────────────────────
registerGlobalErrorHandlers();
process.on('uncaughtExceptionMonitor', (error) => {
    loggers.bot.error('Uncaught exception monitor', { error: error.message });
    startupState.errors.push({ step: startupState.step, error: error.message, timestamp: Date.now() });
});
process.on('warning', (warning) => {
    loggers.bot.warn('Process warning', { name: warning.name, message: warning.message });
});
// ─── Health check server ──────────────────────────────────────────────────────
let isBotReady = false; // true only after clientReady fires
let isStartupComplete = false; // true after all startup steps finish (even if Discord delayed)
const PORT = process.env.PORT || 3000;
const server = createServer((req, res) => {
    if (req.url === '/health') {
        const status = isBotReady ? 'healthy' : isStartupComplete ? 'degraded' : 'starting';
        const body = {
            status,
            currentStep: startupState.step,
            completedSteps: startupState.completedSteps,
            uptime: Date.now() - startupState.startTime,
            errors: startupState.errors.length,
        };
        // 200 only when fully connected; 503 for starting/degraded
        res.writeHead(isBotReady ? 200 : 503, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(body));
    }
    else if (req.url === '/startup') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(startupState));
    }
    else {
        res.writeHead(404);
        res.end('Not found');
    }
});
server.listen(PORT, () => {
    loggers.bot.info(`Health check server listening`, { port: PORT });
});
// ─── Environment validation ───────────────────────────────────────────────────
function validateEnvironment() {
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
// ─── Startup step runner ──────────────────────────────────────────────────────
const STARTUP_TIMEOUT_MS = 5 * 60 * 1000;
let startupTimeout = null;
async function runStep(name, fn, timeoutMs = 30_000) {
    startupState.step = name;
    loggers.bot.info(`Starting: ${name}`);
    const t0 = Date.now();
    return Promise.race([
        fn(),
        new Promise((_, reject) => setTimeout(() => reject(new Error(`Step '${name}' timed out after ${timeoutMs}ms`)), timeoutMs)),
    ]).then((result) => {
        loggers.bot.info(`Done: ${name}`, { ms: Date.now() - t0 });
        startupState.completedSteps.push(name);
        return result;
    }).catch((err) => {
        const msg = err instanceof Error ? err.message : String(err);
        loggers.bot.error(`Failed: ${name}`, { ms: Date.now() - t0, error: msg });
        startupState.errors.push({ step: name, error: msg, timestamp: Date.now() });
        throw err;
    });
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
            const c = new PanindiganClient(0, 1);
            loggers.bot.info('Discord client initialized');
            return c;
        }, 10_000);
        await runStep('shutdown-handlers', () => {
            const shutdown = async (signal) => {
                loggers.bot.info(`${signal} received — shutting down gracefully`);
                if (startupTimeout)
                    clearTimeout(startupTimeout);
                try {
                    await client.destroy();
                    loggers.bot.info('Client destroyed');
                }
                catch (err) {
                    loggers.bot.error('Error during client destroy', { error: String(err) });
                }
                process.exit(0);
            };
            process.once('SIGTERM', () => shutdown('SIGTERM'));
            process.once('SIGINT', () => shutdown('SIGINT'));
            return Promise.resolve();
        }, 5_000);
        await runStep('databases', async () => {
            await client.initializeDatabases();
            loggers.bot.info('All databases connected');
        }, 60_000);
        await runStep('music', async () => {
            await client.initializeMusic();
            loggers.bot.info('Music system ready');
        }, 30_000);
        await runStep('commands', async () => {
            await loadCommands(client);
            loggers.bot.info('Commands loaded', { count: client.commands.size });
        }, 120_000);
        await runStep('events', async () => {
            await loadEvents(client);
            loggers.bot.info('Events registered');
        }, 30_000);
        await runStep('login', async () => {
            const token = process.env.DISCORD_TOKEN;
            if (!token)
                throw new Error('DISCORD_TOKEN is not set');
            // Persist a clientReady listener so isBotReady is set on first connect
            // AND on any subsequent reconnect (e.g. after a gateway rate-limit delay).
            client.on('clientReady', () => {
                if (!isBotReady) {
                    loggers.bot.info('Bot is ready', {
                        tag: client.user?.tag,
                        guilds: client.guilds.cache.size,
                    });
                }
                else {
                    loggers.bot.info('Bot reconnected', {
                        tag: client.user?.tag,
                        guilds: client.guilds.cache.size,
                    });
                }
                isBotReady = true;
            });
            // Await login() directly — rejects fast on an invalid/revoked token (fatal).
            // A slow gateway that delays clientReady is handled by the non-fatal window below.
            loggers.bot.info('Login initiated — awaiting token validation…');
            await client.login(token);
            loggers.bot.info('Token accepted — awaiting clientReady…');
            // Non-fatal wait: if Discord's gateway is slow (e.g. IDENTIFY rate-limit after
            // rapid restarts), keep the process alive so Discord.js can reconnect on its own.
            if (!isBotReady) {
                await new Promise((resolve) => {
                    const READY_TIMEOUT_MS = 120_000;
                    const timeout = setTimeout(() => {
                        loggers.bot.warn('clientReady not received within window — running in degraded mode; Discord.js will reconnect automatically', { waitedMs: READY_TIMEOUT_MS });
                        resolve(); // non-fatal: process stays alive
                    }, READY_TIMEOUT_MS);
                    client.once('clientReady', () => {
                        clearTimeout(timeout);
                        resolve();
                    });
                });
            }
        }, 125_000);
        await runStep('health-logger', () => {
            startHealthCheckLogger(() => ({
                guilds: client.guilds.cache.size,
                users: client.guilds.cache.reduce((acc, g) => acc + g.memberCount, 0),
                shardId: client.shardId,
                commands: client.commands.size,
            }));
            return Promise.resolve();
        }, 5_000);
        if (startupTimeout) {
            clearTimeout(startupTimeout);
            startupTimeout = null;
        }
        isStartupComplete = true;
        const elapsed = Date.now() - startupState.startTime;
        loggers.bot.info('Startup complete', {
            ms: elapsed,
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
            ms: Date.now() - startupState.startTime,
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
        });
        process.exit(1);
    }
}
main();
