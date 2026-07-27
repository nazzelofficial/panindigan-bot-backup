// @ts-nocheck
import { Client, GatewayIntentBits, Collection, Partials, ActivityType } from 'discord.js';
import { Kazagumo } from 'kazagumo';
import { Connectors } from 'shoukaku';
import { connectMongoDB } from '../database/mongodb/client.js';
import { initializePrisma } from '../database/postgresql/client.js';
import { connectRedis } from '../database/redis/client.js';
import { BaseCommand } from './BaseCommand.js';
import { AIHandler } from '../handlers/AIHandler.js';
import { loggers } from '../utils/Logger.js';
import config from '../../config.json' with { type: 'json' };

export class PanindiganClient extends Client {
  public commands: Collection<string, BaseCommand>;
  public cooldowns: Collection<string, Collection<string, number>>;
  public kazagumo: Kazagumo | null;
  public aiHandler: AIHandler;
  public config = config;
  public shardId: number;
  public totalShards: number;
  private _presenceIndex: number = 0;

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
    this.aiHandler = new AIHandler();
    this.shardId = shardId;
    this.totalShards = totalShards;
  }

  public async initializeDatabases(): Promise<void> {
    try {
      await connectMongoDB();
      loggers.database.info('MongoDB initialized');

      await initializePrisma();
      loggers.database.info('PostgreSQL initialized');

      await connectRedis();
      loggers.database.info('Redis initialized');
    } catch (error) {
      loggers.database.error('Failed to initialize databases', {
        errorMessage: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  }

  public async initializeMusic(): Promise<void> {
    if (!this.config.features.music) {
      loggers.music.info('Music system disabled via config — skipping');
      return;
    }

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
      new Connectors.DiscordJS(this),
      nodes,
      {},
    );

    this.kazagumo.on('playerStart', (player, track) => {
      loggers.music.info('Track started', { guildId: player.guildId, track: track.title });
      const channel = this.channels.cache.get(player.textId);
      if (channel && channel.isTextBased()) {
        channel.send(`🎵 Now playing: **${track.title}**`);
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
      loggers.music.info('Music player destroyed', { guildId: player.guildId });
      const channel = this.channels.cache.get(player.textId);
      if (channel && channel.isTextBased()) {
        channel.send('🔊 Music queue ended and player destroyed.');
      }
    });

    this.kazagumo.shoukaku.on('error', (name, error) => {
      loggers.music.error('Lavalink node error', {
        node: name,
        errorMessage: error.message,
        stack: error.stack,
      });
    });

    this.kazagumo.shoukaku.on('disconnect', (name, players, moved) => {
      loggers.music.warn('Lavalink node disconnected', { node: name, players, moved });
    });

    this.kazagumo.shoukaku.on('ready', (name) => {
      loggers.music.info('Lavalink node ready', { node: name });
    });

    loggers.music.info('Music system initialized', { nodes: nodes.map((n) => n.name) });
  }

  public getOwnerIds(): string[] {
    const ownerIds = process.env.OWNER_IDS;
    return ownerIds ? ownerIds.split(',').map((id) => id.trim()) : [];
  }

  public isOwner(userId: string): boolean {
    return this.getOwnerIds().includes(userId);
  }

  public async updatePresence(): Promise<void> {
    if (!this.config.presence.enabled) return;

    const ACTIVITY_TYPE_MAP: Record<string, ActivityType> = {
      playing: ActivityType.Playing,
      streaming: ActivityType.Streaming,
      listening: ActivityType.Listening,
      watching: ActivityType.Watching,
      competing: ActivityType.Competing,
    };

    const activities = this.config.presence.activities;
    const activity = activities[this._presenceIndex % activities.length];
    this._presenceIndex++;

    const text = activity.text
      .replace('{shardId}', this.shardId.toString())
      .replace('{guildCount}', this.guilds.cache.size.toString())
      .replace(
        '{memberCount}',
        this.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0).toString(),
      );

    const activityType = ACTIVITY_TYPE_MAP[activity.type.toLowerCase()] ?? ActivityType.Playing;
    this.user?.setActivity(text, { type: activityType });
  }
}
