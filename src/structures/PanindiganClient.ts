// @ts-nocheck
/**
 * ══════════════════════════════════════════════════
 *  Panindigan Client
 *  Discord.js client + Kazagumo + DB init
 *  Metrics integration + auto-recovery music events
 * ══════════════════════════════════════════════════
 */

import { Client, GatewayIntentBits, Collection, Partials, ActivityType } from 'discord.js';
import { Kazagumo } from 'kazagumo';
import { Connectors } from 'shoukaku';
import { connectMongoDB } from '../database/mongodb/client.js';
import { initializePrisma } from '../database/postgresql/client.js';
import { connectRedis } from '../database/redis/client.js';
import { BaseCommand } from './BaseCommand.js';
import { AIHandler } from '../handlers/AIHandler.js';
import { loggers } from '../utils/Logger.js';
import { metrics } from '../health/MetricsCollector.js';
import config from '../../config.json' with { type: 'json' };

// ─── Lavalink node builder ─────────────────────────────────────────────────────

interface LavalinkNodeOption {
  name: string;
  url: string;
  auth: string;
  secure: boolean;
}

function buildLavalinkNodes(): LavalinkNodeOption[] | null {
  if (process.env.LAVALINK_NODES) {
    try {
      const parsed = JSON.parse(process.env.LAVALINK_NODES);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((n: any, i: number) => ({
          name: n.name || `Node${i + 1}`,
          url: `${n.host}:${n.port ?? 2333}`,
          auth: n.auth ?? n.password ?? '',
          secure: Boolean(n.secure),
        }));
      }
    } catch (err) {
      loggers.music.warn('LAVALINK_NODES is not valid JSON — falling back to single-node vars', {
        error: String(err),
      });
    }
  }

  const host = process.env.LAVALINK_HOST;
  if (!host) return null;

  return [
    {
      name: 'default',
      url: `${host}:${process.env.LAVALINK_PORT ?? 2333}`,
      auth: process.env.LAVALINK_PASSWORD ?? '',
      secure: process.env.LAVALINK_SECURE === 'true',
    },
  ];
}

// ─── Client ───────────────────────────────────────────────────────────────────

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

    const nodes = buildLavalinkNodes();

    if (!nodes) {
      loggers.music.warn(
        'No Lavalink nodes configured — music commands will be unavailable. ' +
        'Set LAVALINK_HOST (and optionally LAVALINK_PORT, LAVALINK_PASSWORD, LAVALINK_SECURE) ' +
        'or LAVALINK_NODES to enable music.',
      );
      return;
    }

    loggers.music.info('Initializing Kazagumo / Shoukaku', {
      nodes: nodes.map((n) => n.name),
    });

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
      {
        reconnectTries: parseInt(process.env.LAVALINK_RECONNECT_TRIES ?? '5', 10),
        reconnectInterval: parseInt(process.env.LAVALINK_RECONNECT_INTERVAL_MS ?? '5000', 10),
        restTimeout: parseInt(process.env.LAVALINK_REST_TIMEOUT_MS ?? '60000', 10),
        moveOnDisconnect: false,
      },
    );

    // ── Player event hooks ─────────────────────────────────────────────────

    this.kazagumo.on('playerStart', (player, track) => {
      metrics.increment('music.sessions');
      metrics.setGauge('music.active_players', this.kazagumo!.players.size);

      loggers.music.info('Track started', {
        guildId: player.guildId,
        track: track.title,
        author: track.author,
        source: (track as any).sourceName,
      });

      const channel = this.channels.cache.get(player.textId);
      if (channel?.isTextBased()) {
        const { MusicPlayer } = require('./MusicPlayer.js');
        try {
          const embed = MusicPlayer.getNowPlayingEmbed(player);
          const controls = MusicPlayer.buildControlButtons(player);
          const secondary = MusicPlayer.buildVolumeButtons(player);
          channel.send({ embeds: [embed], components: [controls, secondary] }).catch(() => {});
        } catch {
          channel.send(`🎵 Now playing: **${track.title}** — *${track.author ?? 'Unknown'}*`).catch(() => {});
        }
      }
    });

    this.kazagumo.on('playerEnd', (player) => {
      metrics.setGauge('music.active_players', this.kazagumo!.players.size);

      if (!player.queue.current && player.queue.size === 0) {
        const timeout = parseInt(
          process.env.MUSIC_INACTIVITY_TIMEOUT_MS ?? String(this.config.music.inactivityTimeoutMs ?? 300_000),
          10,
        );
        setTimeout(() => {
          if (!player.queue.current && player.queue.size === 0) {
            player.destroy();
            loggers.music.debug('Player destroyed due to inactivity', { guildId: player.guildId });
          }
        }, timeout);
      }
    });

    this.kazagumo.on('playerDestroy', (player) => {
      metrics.setGauge('music.active_players', Math.max(0, (this.kazagumo?.players.size ?? 1) - 1));
      loggers.music.info('Music player destroyed', { guildId: player.guildId });

      const channel = this.channels.cache.get(player.textId);
      if (channel?.isTextBased()) {
        channel.send('🔊 Queue ended — player stopped.').catch(() => {});
      }
    });

    this.kazagumo.on('playerEmpty', (player) => {
      loggers.music.debug('Queue empty', { guildId: player.guildId });
    });

    this.kazagumo.on('playerError', (player, track, payload) => {
      metrics.increment('commands.errors');
      loggers.music.error('Player error', {
        guildId: player.guildId,
        track: track?.title,
        error: payload?.exception?.message ?? String(payload),
      });
    });

    // ── Shoukaku / node event hooks ────────────────────────────────────────

    this.kazagumo.shoukaku.on('error', (name, error) => {
      loggers.music.error('Lavalink node error', {
        node: name,
        errorMessage: error.message,
      });
    });

    this.kazagumo.shoukaku.on('disconnect', (name, players, moved) => {
      loggers.music.warn('Lavalink node disconnected — Shoukaku will attempt reconnect', {
        node: name,
        activePlayers: typeof players === 'number' ? players : (players?.length ?? 0),
        moved,
      });
    });

    this.kazagumo.shoukaku.on('reconnecting', (name) => {
      loggers.music.info('Lavalink node reconnecting…', { node: name });
    });

    this.kazagumo.shoukaku.on('ready', (name) => {
      loggers.music.info('Lavalink node ready', { node: name });
    });

    loggers.music.info('Music system initialized', {
      nodes: nodes.map((n) => `${n.name} (${n.url})`),
    });
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
      playing:   ActivityType.Playing,
      streaming: ActivityType.Streaming,
      listening: ActivityType.Listening,
      watching:  ActivityType.Watching,
      competing: ActivityType.Competing,
    };

    const activities  = this.config.presence.activities;
    const activity    = activities[this._presenceIndex % activities.length];
    this._presenceIndex++;

    const currentShardId = this.shard?.ids[0] ?? this.shardId;

    const text = activity.text
      .replace('{shardId}',    currentShardId.toString())
      .replace('{guildCount}', this.guilds.cache.size.toString())
      .replace(
        '{memberCount}',
        this.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0).toString(),
      );

    const activityType = ACTIVITY_TYPE_MAP[activity.type.toLowerCase()] ?? ActivityType.Playing;
    this.user?.setPresence({
      activities: [{ name: text, type: activityType }],
      status: this.config.presence.status as any,
    });
  }
}
