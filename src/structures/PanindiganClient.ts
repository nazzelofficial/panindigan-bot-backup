import { Client, GatewayIntentBits, Collection, Partials } from 'discord.js';
import { Kazagumo } from 'kazagumo';
import { Shoukaku } from 'shoukaku';
import { connectMongoDB, getMongoDb } from '../database/mongodb/client';
import { getPrismaClient } from '../database/postgresql/client';
import { connectRedis, getRedisClient } from '../database/redis/client';
import { BaseCommand } from './BaseCommand';
import config from '../../config.json';

export class PanindiganClient extends Client {
  public commands: Collection<string, BaseCommand>;
  public cooldowns: Collection<string, Collection<string, number>>;
  public kazagumo: Kazagumo | null;
  public config = config;
  public shardId: number;
  public totalShards: number;

  constructor(shardId: number = 0, totalShards: number = 1) {
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildEmojisAndStickers,
        GatewayIntentBits.GuildBans,
        GatewayIntentBits.GuildIntegrations,
        GatewayIntentBits.GuildWebhooks,
        GatewayIntentBits.GuildMessageTyping,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.DirectMessageReactions,
        GatewayIntentBits.DirectMessageTyping,
      ],
      partials: [
        Partials.Channel,
        Partials.GuildMember,
        Partials.Message,
        Partials.Reaction,
        Partials.User,
        Partials.GuildScheduledEvent,
        Partials.ThreadMember,
      ],
      presence: {
        status: config.presence.status as any,
      },
    });

    this.commands = new Collection();
    this.cooldowns = new Collection();
    this.kazagumo = null;
    this.shardId = shardId;
    this.totalShards = totalShards;
  }

  public async initializeDatabases(): Promise<void> {
    try {
      await connectMongoDB();
      getPrismaClient();
      await connectRedis();
    } catch (error) {
      console.error('Failed to initialize databases:', error);
      throw error;
    }
  }

  public async initializeMusic(): Promise<void> {
    if (!this.config.features.music) return;

    const nodes = [
      {
        name: 'default',
        url: `http://${process.env.LAVALINK_HOST || 'localhost'}:${process.env.LAVALINK_PORT || 2333}`,
        auth: process.env.LAVALINK_PASSWORD || 'youshallnotpass',
        secure: process.env.LAVALINK_SECURE === 'true',
      },
    ];

    this.kazagumo = new Kazagumo(
      {
        defaultPlatform: 'ytmusic',
        send: (guildId, packet) => {
          const guild = this.guilds.cache.get(guildId);
          if (guild) guild.shard.send(packet);
        },
      },
      new Shoukaku({
        nodes,
      }),
      this
    );

    this.kazagumo.on('playerStart', (player, track) => {
      const channel = this.channels.cache.get(player.textId);
      if (channel && channel.isTextBased()) {
        channel.send(`🎵 Now playing: ${track.title}`);
      }
    });

    this.kazagumo.on('playerEnd', (player) => {
      if (!player.queue.current && player.queue.size === 0) {
        setTimeout(() => {
          if (!player.queue.current && player.queue.size === 0) {
            player.destroy();
          }
        }, this.config.music.inactivityTimeoutMs);
      }
    });

    this.kazagumo.on('playerDestroy', (player) => {
      const channel = this.channels.cache.get(player.textId);
      if (channel && channel.isTextBased()) {
        channel.send('🔊 Music queue ended and player destroyed.');
      }
    });

    console.log('✅ Music system initialized');
  }

  public getOwnerIds(): string[] {
    const ownerIds = process.env.OWNER_IDS;
    return ownerIds ? ownerIds.split(',').map(id => id.trim()) : [];
  }

  public isOwner(userId: string): boolean {
    return this.getOwnerIds().includes(userId);
  }

  public async updatePresence(): Promise<void> {
    if (!this.config.presence.enabled) return;

    const activities = this.config.presence.activities;
    const activity = activities[this.shardId % activities.length];

    const text = activity.text
      .replace('{shardId}', this.shardId.toString())
      .replace('{guildCount}', this.guilds.cache.size.toString())
      .replace('{memberCount}', this.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0).toString());

    this.user.setActivity(text, { type: activity.type as any });
  }
}
