// @ts-nocheck
import { readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { REST, Routes, ContextMenuCommandBuilder, ApplicationCommandType, APIApplicationCommand } from 'discord.js';
import { PanindiganClient } from '../structures/PanindiganClient.js';
import { BaseCommand } from '../structures/BaseCommand.js';
import { loggers } from '../utils/Logger.js';
import config from '../../config.json' with { type: 'json' };

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const COMMANDS_PATH = join(__dirname, '..', 'commands');

export async function loadCommands(client: PanindiganClient): Promise<void> {
  const commandFolders = readdirSync(COMMANDS_PATH);
  let loaded = 0;
  let skipped = 0;

  for (const folder of commandFolders) {
    const commandsPath = join(COMMANDS_PATH, folder);
    const commandFiles = readdirSync(commandsPath).filter(
      (file) => file.endsWith('.ts') || file.endsWith('.js'),
    );

    for (const file of commandFiles) {
      const filePath = join(commandsPath, file);
      try {
        const commandModule = await import(filePath);
        const raw = commandModule.default || commandModule[Object.keys(commandModule)[0]];

        // Commands may be exported as a class (constructor) or as an already-constructed instance.
        let command: BaseCommand;
        if (typeof raw === 'function') {
          try {
            command = new raw();
          } catch (err) {
            loggers.commands.warn('Skipped command file — constructor threw', { filePath, error: String(err) });
            skipped++;
            continue;
          }
        } else {
          command = raw;
        }

        if (!command || !(command instanceof BaseCommand)) {
          loggers.commands.warn('Skipped invalid command file', { filePath });
          skipped++;
          continue;
        }

        if (config.loader.rejectDuplicateNames && client.commands.has(command.name)) {
          loggers.commands.warn('Duplicate command name skipped', { name: command.name, filePath });
          skipped++;
          continue;
        }

        client.commands.set(command.name, command);
        for (const alias of command.aliases) {
          client.commands.set(alias, command);
        }

        loaded++;
        loggers.commands.debug('Loaded command', { name: command.name, category: command.category });
      } catch (err) {
        loggers.commands.error('Failed to load command file', {
          filePath,
          errorMessage: err instanceof Error ? err.message : String(err),
          stack: err instanceof Error ? err.stack : undefined,
        });
        skipped++;
      }
    }
  }

  loggers.commands.info('Commands loaded', { loaded, skipped, total: client.commands.size });

  if (config.loader.enableSlashCommands) {
    // Register slash commands in the background — don't block startup
    setImmediate(() => {
      registerSlashCommands(client).catch((err) => {
        loggers.commands.warn('Slash command registration failed — bot will continue without registered slash commands', {
          errorMessage: err instanceof Error ? err.message : String(err),
        });
      });
    });
  }
}

const DISCORD_GLOBAL_COMMAND_LIMIT = 100;

async function registerSlashCommands(client: PanindiganClient): Promise<void> {
  const commands = [];
  let skippedOwner = 0;
  let skippedLimit = 0;

  // Register slash commands
  for (const [name, command] of client.commands) {
    if (!command.slashCommand || name !== command.name) continue;
    // Skip owner-only commands — they don't need global slash commands
    if (command.ownerOnly) { skippedOwner++; continue; }
    // Respect Discord's 100 global command limit
    if (commands.length >= DISCORD_GLOBAL_COMMAND_LIMIT) { skippedLimit++; continue; }
    try {
      commands.push(command.buildSlashCommand().toJSON());
    } catch (err) {
      loggers.commands.error('Failed to build slash command — skipping', {
        name: command.name,
        errorMessage: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
      });
    }
  }

  // Register context menu commands
  for (const [name, command] of client.commands) {
    if (!command.contextMenuCommand || name !== command.name) continue;
    if (commands.length >= DISCORD_GLOBAL_COMMAND_LIMIT) { skippedLimit++; continue; }
    try {
      const builder = new ContextMenuCommandBuilder()
        .setName(command.name)
        .setType(command.contextMenuType ?? ApplicationCommandType.Message);
      commands.push(builder.toJSON());
      loggers.commands.debug('Queued context menu command', { name: command.name, type: command.contextMenuType });
    } catch (err) {
      loggers.commands.error('Failed to build context menu command — skipping', {
        name: command.name,
        errorMessage: err instanceof Error ? err.message : String(err),
      });
    }
  }

  if (skippedOwner > 0) loggers.commands.debug('Owner-only commands excluded from slash registration', { skippedOwner });
  if (skippedLimit > 0) loggers.commands.warn('Some commands not registered (Discord 100-command limit reached)', { skippedLimit });

  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN!);

  try {
    loggers.commands.info('Refreshing application (/) commands…', { count: commands.length });

    const clientId = process.env.DISCORD_CLIENT_ID;
    if (!clientId) {
      throw new Error('DISCORD_CLIENT_ID environment variable is not set');
    }

    const data: any = await rest.put(Routes.applicationCommands(clientId), { body: commands });

    loggers.commands.info('Slash commands registered successfully', { registered: data.length });

    // Clear stale guild-specific commands so old flat commands no longer appear in Discord
    const guildIds = Array.from(client.guilds.cache.keys());
    if (guildIds.length > 0) {
      await Promise.all(
        guildIds.map((guildId) =>
          rest
            .put(Routes.applicationGuildCommands(clientId, guildId), { body: [] })
            .then(() => loggers.commands.debug('Guild commands cleared', { guildId }))
            .catch((e) => loggers.commands.debug('Could not clear guild commands (non-critical)', { guildId, error: String(e) })),
        ),
      );
      loggers.commands.info('Stale guild-specific commands cleared', { guilds: guildIds.length });
    }
  } catch (error) {
    loggers.commands.error('Failed to register slash commands', {
      errorMessage: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? (error as Error).stack : undefined,
    });
    throw error;
  }
}
