import { SlashCommandBuilder } from 'discord.js';

const files = [
  './src/commands/ai/ai.ts',
  './src/commands/economy/economy.ts',
  './src/commands/fun/fun.ts',
  './src/commands/games/games.ts',
  './src/commands/moderation/moderation.ts',
  './src/commands/music/music.ts',
  './src/commands/help/help.ts',
  './src/commands/info/info.ts',
  './src/commands/leveling/leveling.ts',
  './src/commands/social/social.ts',
  './src/commands/utility/utility.ts',
  './src/commands/giveaway/giveaway.ts',
  './src/commands/starboard/starboard.ts',
  './src/commands/applications/application.ts',
  './src/commands/image/image.ts',
  './src/commands/admin/bot.ts',
  './src/commands/admin/config.ts',
  './src/commands/premium/premium.ts',
];

// Suppress dotenv/database loading that would fail
process.env.DISCORD_TOKEN = process.env.DISCORD_TOKEN || 'dummy';
process.env.DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID || 'dummy';

for (const file of files) {
  try {
    const mod = await import(file);
    for (const [key, val] of Object.entries(mod)) {
      if (typeof val === 'function') {
        try {
          const inst = new (val as Function)();
          if (inst.buildSlashCommand) {
            const cmd = inst.buildSlashCommand();
            const json = cmd.toJSON();
            console.log('OK:', json.name, 'groups:', json.options?.length ?? 0);
          }
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          console.log('FAIL toJSON:', file, '-', msg);
        }
      }
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message.split('\n')[0] : String(e);
    // Only log non-import errors (import fails expected for DB-dependent commands)
    if (!msg.includes('Cannot find module') && !msg.includes('DATABASE') && !msg.includes('postgres') && !msg.includes('mongodb')) {
      console.log('IMPORT FAIL:', file, msg);
    }
  }
}
console.log('Done');
