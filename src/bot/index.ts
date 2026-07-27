// @ts-nocheck
import 'dotenv/config';
import { createServer } from 'http';
import { PanindiganClient } from '../structures/PanindiganClient.js';
import { loadCommands } from '../handlers/CommandHandler.js';
import { loadEvents } from '../handlers/EventHandler.js';
import { loggers, registerGlobalErrorHandlers, startHealthCheckLogger } from '../utils/Logger.js';
import { printBanner } from '../utils/Banner.js';
import config from '../../config.json' with { type: 'json' };

// ─── Startup state ────────────────────────────────────────────────────────────

interface StartupState {
  step: string;
  startTime: number;
  completedSteps: string[];
  errors: Array<{ step: string; error: string; timestamp: number }>;
}

const startupState: StartupState = {
  step: 'initialization',
  startTime: Date.now(),
  completedSteps: [],
  errors: [],
};

// ─── Print banner ─────────────────────────────────────────────────────────────

printBanner({
  version: (config as any).configVersion ?? '0.1.0',
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

let isBotReady = false;
const PORT = process.env.PORT || 3000;

const server = createServer((req, res) => {
  if (req.url === '/health') {
    const body = {
      status: isBotReady ? 'healthy' : 'starting',
      currentStep: startupState.step,
      completedSteps: startupState.completedSteps,
      uptime: Date.now() - startupState.startTime,
      errors: startupState.errors.length,
    };
    res.writeHead(isBotReady ? 200 : 503, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(body));
  } else if (req.url === '/startup') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(startupState));
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(PORT, () => {
  loggers.bot.info(`Health check server listening`, { port: PORT });
});

// ─── Environment validation ───────────────────────────────────────────────────

function validateEnvironment(): void {
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
let startupTimeout: NodeJS.Timeout | null = null;

async function runStep<T>(
  name: string,
  fn: () => Promise<T>,
  timeoutMs = 30_000,
): Promise<T> {
  startupState.step = name;
  loggers.bot.info(`Starting: ${name}`);
  const t0 = Date.now();

  return Promise.race([
    fn(),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Step '${name}' timed out after ${timeoutMs}ms`)), timeoutMs),
    ),
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

async function main(): Promise<void> {
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
      const enabled = Object.keys(config.features).filter((k) => (config.features as any)[k]);
      loggers.bot.info('Features loaded', { enabled });
    }, 5_000);

    const client = await runStep('client', async () => {
      const c = new PanindiganClient(0, 1);
      loggers.bot.info('Discord client initialized');
      return c;
    }, 10_000);

    await runStep('shutdown-handlers', () => {
      const shutdown = async (signal: string): Promise<void> => {
        loggers.bot.info(`${signal} received — shutting down gracefully`);
        if (startupTimeout) clearTimeout(startupTimeout);
        try {
          await client.destroy();
          loggers.bot.info('Client destroyed');
        } catch (err) {
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
    }, 30_000);

    await runStep('events', async () => {
      await loadEvents(client);
      loggers.bot.info('Events registered');
    }, 30_000);

    await runStep('login', async () => {
      const token = process.env.DISCORD_TOKEN;
      if (!token) throw new Error('DISCORD_TOKEN is not set');
      await client.login(token);
      loggers.bot.info('Login initiated');
    }, 30_000);

    await runStep('ready', async () => {
      return new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Ready event not received within 60s'));
        }, 60_000);

        client.once('clientReady', () => {
          clearTimeout(timeout);
          loggers.bot.info('Bot is ready', {
            tag: client.user?.tag,
            guilds: client.guilds.cache.size,
          });
          resolve();
        });

        client.on('error', (error) => {
          clearTimeout(timeout);
          reject(error);
        });
      });
    }, 65_000);

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

    const elapsed = Date.now() - startupState.startTime;
    loggers.bot.info('Startup complete', {
      ms: elapsed,
      steps: startupState.completedSteps.length,
      tag: client.user?.tag,
      guilds: client.guilds.cache.size,
    });

    isBotReady = true;
  } catch (error) {
    if (startupTimeout) clearTimeout(startupTimeout);

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
