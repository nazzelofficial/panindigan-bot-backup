// @ts-nocheck
import { readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { PanindiganClient } from '../structures/PanindiganClient.js';
import { loggers } from '../utils/Logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const EVENTS_PATH = join(__dirname, '..', 'events');

export async function loadEvents(client: PanindiganClient): Promise<void> {
  const eventFiles = readdirSync(EVENTS_PATH).filter(
    (file) => file.endsWith('.ts') || file.endsWith('.js'),
  );

  let loaded = 0;
  let skipped = 0;

  for (const file of eventFiles) {
    const filePath = join(EVENTS_PATH, file);
    try {
      const eventModule = await import(filePath);
      const event = eventModule.default || eventModule[Object.keys(eventModule)[0]];

      if (!event || !event.name || !event.execute) {
        loggers.events.warn('Skipped invalid event file', { filePath });
        skipped++;
        continue;
      }

      if (event.once) {
        client.once(event.name, (...args: any[]) => event.execute(...args));
      } else {
        client.on(event.name, (...args: any[]) => event.execute(...args));
      }

      loaded++;
      loggers.events.debug('Loaded event', { name: event.name, once: event.once ?? false });
    } catch (err) {
      loggers.events.error('Failed to load event file', {
        filePath,
        errorMessage: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
      });
      skipped++;
    }
  }

  loggers.events.info('Events loaded', { loaded, skipped, total: eventFiles.length });
}
