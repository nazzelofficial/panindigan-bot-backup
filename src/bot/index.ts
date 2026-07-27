// @ts-nocheck
import 'dotenv/config';
import { createServer } from 'http';
import { PanindiganClient } from '../structures/PanindiganClient.js';
import { loadCommands } from '../handlers/CommandHandler.js';
import { loadEvents } from '../handlers/EventHandler.js';
import { loggers, registerGlobalErrorHandlers, startHealthCheckLogger } from '../utils/Logger.js';
import config from '../../config.json' with { type: 'json' };

// Startup state tracking
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

// Startup timeout detection (5 minutes max)
const STARTUP_TIMEOUT_MS = 5 * 60 * 1000;
let startupTimeout: NodeJS.Timeout | null = null;

// Register comprehensive error handlers
registerGlobalErrorHandlers();

process.on('uncaughtExceptionMonitor', (error) => {
  loggers.bot.error('[UNCAUGHT EXCEPTION MONITOR]', { error: error.message });
  startupState.errors.push({
    step: startupState.step,
    error: error.message,
    timestamp: Date.now(),
  });
});

process.on('warning', (warning) => {
  loggers.bot.warn('[PROCESS WARNING]', { warning });
});

process.on('multipleResolves', (type, promise, value) => {
  loggers.bot.warn('[MULTIPLE RESOLVES]', { type, value });
});

// Health check server
let isBotReady = false;
const PORT = process.env.PORT || 3000;

const server = createServer((req, res) => {
  if (req.url === '/health') {
    const healthData = {
      status: isBotReady ? 'healthy' : 'starting',
      currentStep: startupState.step,
      completedSteps: startupState.completedSteps,
      uptime: Date.now() - startupState.startTime,
      errors: startupState.errors.length,
    };
    res.writeHead(isBotReady ? 200 : 503, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(healthData));
  } else if (req.url === '/startup') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(startupState));
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(PORT, () => {
  loggers.bot.info(`Health check server listening on port ${PORT}`);
});

// Environment variable validation
function validateEnvironment(): void {
  loggers.bot.info('Validating environment variables...');
  const requiredVars = [
    'DISCORD_TOKEN',
    'DISCORD_CLIENT_ID',
    'POSTGRES_URL',
    'MONGODB_URI',
    'REDIS_URL',
  ];

  const missing: string[] = [];
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }

  if (missing.length > 0) {
    loggers.bot.error('CRITICAL: Missing required environment variables', { missing });
    loggers.bot.error('Please set these environment variables before starting the bot.');
    process.exit(1);
  }

  loggers.bot.info('All required environment variables are present.');
}

// Startup step wrapper with timeout and error handling
async function runStartupStep<T>(
  stepName: string,
  stepFn: () => Promise<T>,
  timeoutMs: number = 30000
): Promise<T> {
  startupState.step = stepName;
  loggers.bot.info(`Starting step: ${stepName}`);
  const stepStart = Date.now();

  return Promise.race([
    stepFn(),
    new Promise<never>((_, reject) =>
      setTimeout(() => {
        reject(new Error(`Step '${stepName}' timed out after ${timeoutMs}ms`));
      }, timeoutMs)
    ),
  ])
    .then((result) => {
      const duration = Date.now() - stepStart;
      loggers.bot.info(`Completed step: ${stepName}`, { duration });
      startupState.completedSteps.push(stepName);
      return result;
    })
    .catch((error) => {
      const duration = Date.now() - stepStart;
      loggers.bot.error(`Failed step: ${stepName}`, { duration, error: error instanceof Error ? error.message : String(error) });
      if (error instanceof Error && error.stack) {
        loggers.bot.error('Stack trace', { stack: error.stack });
      }
      startupState.errors.push({
        step: stepName,
        error: error instanceof Error ? error.message : String(error),
        timestamp: Date.now(),
      });
      throw error;
    });
}

async function main(): Promise<void> {
  loggers.bot.info('============================================');
  loggers.bot.info('Panindigan Bot Starting');
  loggers.bot.info('============================================');
  loggers.bot.info('Version', { version: (config as any).configVersion ?? '0.1.1' });
  loggers.bot.info('Node Version', { nodeVersion: process.version });
  loggers.bot.info('Environment', { env: process.env.NODE_ENV ?? 'development' });
  loggers.bot.info('Platform', { platform: process.platform, arch: process.arch });
  loggers.bot.info('============================================');

  // Set startup timeout
  startupTimeout = setTimeout(() => {
    loggers.bot.error('CRITICAL: Startup timeout exceeded!');
    loggers.bot.error('Current step', { step: startupState.step });
    loggers.bot.error('Completed steps', { steps: startupState.completedSteps.join(', ') });
    loggers.bot.error('Errors', { errors: startupState.errors });
    process.exit(1);
  }, STARTUP_TIMEOUT_MS);

  try {
    // Step 1: Validate environment
    await runStartupStep('environment_validation', () => {
      validateEnvironment();
      return Promise.resolve();
    }, 5000);

    // Step 2: Load config
    await runStartupStep('config_loading', async () => {
      loggers.bot.info('Config loaded successfully');
      loggers.bot.info('Features enabled', { features: Object.keys(config.features).filter(k => (config.features as any)[k]) });
    }, 5000);

    // Step 3: Initialize client
    const client = await runStartupStep('client_initialization', async () => {
      const c = new PanindiganClient(0, 1);
      loggers.bot.info('Discord client initialized');
      return c;
    }, 10000);

    // Step 4: Graceful shutdown handlers
    await runStartupStep('shutdown_handlers', () => {
      const shutdown = async (signal: string): Promise<void> => {
        loggers.bot.info(`${signal} received — shutting down gracefully`);
        if (startupTimeout) clearTimeout(startupTimeout);
        try {
          await client.destroy();
          loggers.bot.info('Discord client destroyed');
        } catch (err) {
          loggers.bot.error('Error during shutdown', { error: String(err) });
        }
        process.exit(0);
      };

      process.once('SIGTERM', () => shutdown('SIGTERM'));
      process.once('SIGINT', () => shutdown('SIGINT'));
      return Promise.resolve();
    }, 5000);

    // Step 5: Initialize databases
    await runStartupStep('database_initialization', async () => {
      loggers.bot.info('Connecting to databases...');
      await client.initializeDatabases();
      loggers.bot.info('Databases connected successfully');
    }, 60000);

    // Step 6: Initialize music system
    await runStartupStep('music_initialization', async () => {
      loggers.bot.info('Initializing music system...');
      await client.initializeMusic();
      loggers.bot.info('Music system initialized');
    }, 30000);

    // Step 7: Load commands
    await runStartupStep('command_loading', async () => {
      loggers.bot.info('Loading commands...');
      await loadCommands(client);
      loggers.bot.info('Commands loaded', { count: client.commands.size });
    }, 30000);

    // Step 8: Load events
    await runStartupStep('event_loading', async () => {
      loggers.bot.info('Loading events...');
      await loadEvents(client);
      loggers.bot.info('Events loaded');
    }, 30000);

    // Step 9: Login to Discord
    await runStartupStep('discord_login', async () => {
      const token = process.env.DISCORD_TOKEN;
      if (!token) {
        throw new Error('DISCORD_TOKEN environment variable is not set');
      }
      loggers.bot.info('Logging in to Discord...');
      await client.login(token);
      loggers.bot.info('Discord login initiated');
    }, 30000);

    // Step 10: Wait for ready event
    await runStartupStep('ready_event', async () => {
      return new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Ready event timeout - bot did not become ready within 60 seconds'));
        }, 60000);

        client.once('ready', () => {
          clearTimeout(timeout);
          loggers.bot.info('Discord bot is ready!');
          loggers.bot.info('Logged in', { tag: client.user?.tag });
          loggers.bot.info('Serving guilds', { count: client.guilds.cache.size });
          resolve();
        });

        client.on('error', (error) => {
          clearTimeout(timeout);
          reject(error);
        });
      });
    }, 65000);

    // Step 11: Start health check logger
    await runStartupStep('health_check_logger', () => {
      startHealthCheckLogger(() => ({
        guilds: client.guilds.cache.size,
        users: client.guilds.cache.reduce((acc, g) => acc + g.memberCount, 0),
        shardId: client.shardId,
        commands: client.commands.size,
      }));
      return Promise.resolve();
    }, 5000);

    // Clear startup timeout
    if (startupTimeout) {
      clearTimeout(startupTimeout);
      startupTimeout = null;
    }

    const totalDuration = Date.now() - startupState.startTime;
    loggers.bot.info('============================================');
    loggers.bot.info('Panindigan Bot Started Successfully!');
    loggers.bot.info('Total startup time', { duration: totalDuration });
    loggers.bot.info('Completed steps', { steps: startupState.completedSteps.join(', ') });
    loggers.bot.info('============================================');
    isBotReady = true;
  } catch (error) {
    if (startupTimeout) clearTimeout(startupTimeout);
    const totalDuration = Date.now() - startupState.startTime;
    loggers.bot.error('============================================');
    loggers.bot.error('CRITICAL: Bot startup failed!');
    loggers.bot.error('Total duration', { duration: totalDuration });
    loggers.bot.error('Failed at step', { step: startupState.step });
    loggers.bot.error('Completed steps', { steps: startupState.completedSteps.join(', ') });
    loggers.bot.error('Error', { error: error instanceof Error ? error.message : String(error) });
    if (error instanceof Error && error.stack) {
      loggers.bot.error('Stack trace', { stack: error.stack });
    }
    loggers.bot.error('All errors', { errors: startupState.errors });
    loggers.bot.error('============================================');
    process.exit(1);
  }
}

main();
