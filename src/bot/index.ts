import 'dotenv/config';
import { PanindiganClient } from '../structures/PanindiganClient';
import { loadCommands } from '../handlers/CommandHandler';
import { loadEvents } from '../handlers/EventHandler';
import { loggers, registerGlobalErrorHandlers, startHealthCheckLogger } from '../utils/Logger';
import config from '../../config.json';

// Register global unhandledRejection / uncaughtException handlers before anything else
registerGlobalErrorHandlers();

async function main(): Promise<void> {
  loggers.bot.info('Initializing Panindigan Bot…', {
    version: (config as any).configVersion ?? '0.1.1',
    nodeVersion: process.version,
    env: process.env.NODE_ENV ?? 'development',
  });

  const client = new PanindiganClient(0, 1);

  // Graceful shutdown
  const shutdown = async (signal: string): Promise<void> => {
    loggers.bot.info(`${signal} received — shutting down gracefully`);
    try {
      await client.destroy();
      loggers.bot.info('Discord client destroyed');
    } catch (err) {
      loggers.bot.error('Error during shutdown', { error: String(err) });
    }
    process.exit(0);
  };

  process.once('SIGTERM', () => shutdown('SIGTERM'));
  process.once('SIGINT',  () => shutdown('SIGINT'));

  try {
    loggers.bot.info('Connecting to databases…');
    await client.initializeDatabases();

    loggers.bot.info('Initializing music system…');
    await client.initializeMusic();

    loggers.bot.info('Loading commands…');
    await loadCommands(client);

    loggers.bot.info('Loading events…');
    await loadEvents(client);

    const token = process.env.DISCORD_TOKEN;
    if (!token) {
      throw new Error('DISCORD_TOKEN environment variable is not set');
    }

    loggers.bot.info('Logging in to Discord…');
    await client.login(token);

    // Periodic health-check (every 5 minutes)
    startHealthCheckLogger(() => ({
      guilds: client.guilds.cache.size,
      users: client.guilds.cache.reduce((acc, g) => acc + g.memberCount, 0),
      shardId: client.shardId,
      commands: client.commands.size,
    }));

    loggers.bot.info('Panindigan Bot started successfully');
  } catch (error) {
    loggers.bot.error('Failed to start Panindigan Bot', {
      errorMessage: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    process.exit(1);
  }
}

main();
