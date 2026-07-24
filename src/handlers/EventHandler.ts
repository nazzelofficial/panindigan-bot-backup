import { readdirSync } from 'fs';
import { join } from 'path';
import { PanindiganClient } from '../structures/PanindiganClient';

const EVENTS_PATH = join(__dirname, '..', 'events');

export async function loadEvents(client: PanindiganClient): Promise<void> {
  const eventFiles = readdirSync(EVENTS_PATH).filter(
    (file) => file.endsWith('.ts') || file.endsWith('.js')
  );

  for (const file of eventFiles) {
    const filePath = join(EVENTS_PATH, file);
    const eventModule = await import(filePath);
    const event = eventModule.default || eventModule[Object.keys(eventModule)[0]];

    if (!event || !event.name || !event.execute) {
      console.warn(`⚠️  Event at ${filePath} is not valid`);
      continue;
    }

    if (event.once) {
      client.once(event.name, (...args: any[]) => event.execute(...args));
    } else {
      client.on(event.name, (...args: any[]) => event.execute(...args));
    }

    console.log(`✅ Loaded event: ${event.name}`);
  }

  console.log(`📊 Total events loaded: ${eventFiles.length}`);
}
