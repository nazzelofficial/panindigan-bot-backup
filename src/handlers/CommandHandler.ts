import { readdirSync } from 'fs';
import { join } from 'path';
import { REST, Routes } from 'discord.js';
import { PanindiganClient } from '../structures/PanindiganClient';
import { BaseCommand } from '../structures/BaseCommand';
import config from '../../config.json';

const COMMANDS_PATH = join(__dirname, '..', 'commands');

export async function loadCommands(client: PanindiganClient): Promise<void> {
  const commandFolders = readdirSync(COMMANDS_PATH);

  for (const folder of commandFolders) {
    const commandsPath = join(COMMANDS_PATH, folder);
    const commandFiles = readdirSync(commandsPath).filter(
      (file) => file.endsWith('.ts') || file.endsWith('.js')
    );

    for (const file of commandFiles) {
      const filePath = join(commandsPath, file);
      const commandModule = await import(filePath);
      const command: BaseCommand = commandModule.default || commandModule[Object.keys(commandModule)[0]];

      if (!command || !(command instanceof BaseCommand)) {
        console.warn(`⚠️  Command at ${filePath} is not a valid BaseCommand`);
        continue;
      }

      if (config.loader.rejectDuplicateNames && client.commands.has(command.name)) {
        console.warn(`⚠️  Duplicate command name: ${command.name}`);
        continue;
      }

      client.commands.set(command.name, command);
      
      for (const alias of command.aliases) {
        client.commands.set(alias, command);
      }

      console.log(`✅ Loaded command: ${command.name} (${command.category})`);
    }
  }

  console.log(`📊 Total commands loaded: ${client.commands.size}`);

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
    console.log('🔄 Started refreshing application (/) commands.');

    const clientId = process.env.DISCORD_CLIENT_ID;
    if (!clientId) {
      throw new Error('DISCORD_CLIENT_ID environment variable is not set');
    }

    const data: any = await rest.put(
      Routes.applicationCommands(clientId),
      { body: commands }
    );

    console.log(`✅ Successfully reloaded ${data.length} application (/) commands.`);
  } catch (error) {
    console.error('❌ Failed to reload application (/) commands:', error);
    throw error;
  }
}
