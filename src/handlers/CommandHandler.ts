import { readdirSync } from 'fs';
import { join } from 'path';
import { REST, Routes } from 'discord.js';
import { PanindiganClient } from '../structures/PanindiganClient';
import { BaseCommand } from '../structures/BaseCommand';
import { loggers } from '../utils/Logger';
import config from '../../config.json';

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
        const command: BaseCommand =
          commandModule.default || commandModule[Object.keys(commandModule)[0]];

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
    await registerSlashCommands(client);
  }
}

async function registerSlashCommands(client: PanindiganClient): Promise<void> {
  const commands = [];

  for (const [name, command] of client.commands) {
    if (command.slashCommand && name === command.name) {
      commands.push(command.buildSlashCommand().toJSON());
    }
  }

  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN!);

  try {
    loggers.commands.info('Refreshing application (/) commands…', { count: commands.length });

    const clientId = process.env.DISCORD_CLIENT_ID;
    if (!clientId) {
      throw new Error('DISCORD_CLIENT_ID environment variable is not set');
    }

    const data: any = await rest.put(Routes.applicationCommands(clientId), { body: commands });

    loggers.commands.info('Slash commands registered successfully', { registered: data.length });
  } catch (error) {
    loggers.commands.error('Failed to register slash commands', {
      errorMessage: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? (error as Error).stack : undefined,
    });
    throw error;
  }
}
