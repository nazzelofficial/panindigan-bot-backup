import { ShardingManager } from 'discord.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import config from '../../config.json';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const manager = new ShardingManager(join(__dirname, 'index.js'), {
  token: process.env.DISCORD_TOKEN,
  totalShards: config.sharding.shardCount === 'auto' ? 'auto' : config.sharding.shardCount as number,
  respawn: config.sharding.respawn,
  shardArgs: process.argv.slice(2),
});

manager.on('shardCreate', (shard) => {
  console.log(`🔷 Launched shard #${shard.id}`);
  
  shard.on('ready', () => {
    console.log(`✅ Shard #${shard.id} connected`);
  });

  shard.on('error', (error) => {
    console.error(`❌ Shard #${shard.id} error:`, error);
  });

  shard.on('death', () => {
    console.log(`💀 Shard #${shard.id} died`);
  });

  shard.on('reconnecting', () => {
    console.log(`🔄 Shard #${shard.id} reconnecting`);
  });
});

manager.spawn()
  .then(() => {
    console.log(`🚀 All shards spawned successfully`);
  })
  .catch((error) => {
    console.error('❌ Failed to spawn shards:', error);
    process.exit(1);
  });
