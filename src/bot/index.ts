import { PanindiganClient } from '../structures/PanindiganClient';
import { loadCommands } from '../handlers/CommandHandler';
import { loadEvents } from '../handlers/EventHandler';
import config from '../../config.json';

async function main(): Promise<void> {
  const client = new PanindiganClient(0, 1);

  try {
    console.log('🚀 Initializing Panindigan Bot...');
    
    await client.initializeDatabases();
    await client.initializeMusic();
    
    await loadCommands(client);
    await loadEvents(client);
    
    const token = process.env.DISCORD_TOKEN;
    if (!token) {
      throw new Error('DISCORD_TOKEN environment variable is not set');
    }

    await client.login(token);
    
    console.log('✅ Panindigan Bot started successfully');
  } catch (error) {
    console.error('❌ Failed to start Panindigan Bot:', error);
    process.exit(1);
  }
}

main();
