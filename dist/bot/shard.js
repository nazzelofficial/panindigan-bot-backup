// @ts-nocheck
import 'dotenv/config';
import { ShardingManager } from 'discord.js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { loggers, registerGlobalErrorHandlers } from '../utils/Logger.js';
import config from '../../config.json' with { type: 'json' };
registerGlobalErrorHandlers();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const manager = new ShardingManager(join(__dirname, 'index.js'), {
    token: process.env.DISCORD_TOKEN,
    totalShards: config.sharding.shardCount === "auto" ? "auto" : config.sharding.shardCount,
    respawn: config.sharding.respawn,
    shardArgs: process.argv.slice(2),
});
manager.on('shardCreate', (shard) => {
    loggers.shard.info('Shard launched', { shardId: shard.id });
    shard.on('ready', () => {
        loggers.shard.info('Shard connected', { shardId: shard.id });
    });
    shard.on('error', (error) => {
        loggers.shard.error('Shard error', {
            shardId: shard.id,
            errorMessage: error.message,
            stack: error.stack,
        });
    });
    shard.on('death', () => {
        loggers.shard.warn('Shard died', { shardId: shard.id });
    });
    shard.on('reconnecting', () => {
        loggers.shard.info('Shard reconnecting', { shardId: shard.id });
    });
});
manager
    .spawn()
    .then(() => {
    loggers.shard.info('All shards spawned successfully', {
        totalShards: manager.totalShards,
    });
})
    .catch((error) => {
    loggers.shard.error('Failed to spawn shards', {
        errorMessage: error.message,
        stack: error.stack,
    });
    process.exit(1);
});
