// @ts-nocheck
/**
 * ══════════════════════════════════════════════════════════════
 *  Panindigan Enterprise Logger  v2
 *  Asia/Manila timezone · Colored console · JSON prod
 *  Module icons · Structured events · Auto-redaction
 *  Per-module child loggers · Webhook batching
 * ══════════════════════════════════════════════════════════════
 */

import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import chalk from 'chalk';
import config from '../../config.json' with { type: 'json' };

// ─── Directories ──────────────────────────────────────────────────────────────

const LOGS_DIR = join(process.cwd(), 'logs');
const SHARDS_DIR = join(LOGS_DIR, 'shards');

for (const dir of [LOGS_DIR, SHARDS_DIR]) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

// ─── Timezone helper (Asia/Manila = UTC+8) ────────────────────────────────────

function manilaTimestamp(): string {
  return new Date().toLocaleString('en-PH', {
    timeZone: 'Asia/Manila',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).replace(/(\d+)\/(\d+)\/(\d+),/, '$3-$1-$2');
}

function manilaTimestampShort(): string {
  return new Date().toLocaleString('en-PH', {
    timeZone: 'Asia/Manila',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    fractionalSecondDigits: 3,
    hour12: false,
  });
}

export function manilaTimestampFull(): string {
  return new Date().toLocaleString('en-PH', {
    timeZone: 'Asia/Manila',
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
}

// ─── Sensitive-field redaction ─────────────────────────────────────────────────

const SENSITIVE_KEYS = new Set([
  'token', 'password', 'passwd', 'secret', 'secrets',
  'apiKey', 'api_key', 'apikey', 'accessToken', 'access_token',
  'refreshToken', 'refresh_token', 'authorization', 'auth',
  'credential', 'credentials', 'cookie', 'cookies', 'session',
  'privateKey', 'private_key', 'clientSecret', 'client_secret',
  'DISCORD_TOKEN', 'OPENAI_API_KEY', 'ANTHROPIC_API_KEY',
  'GEMINI_API_KEY', 'GROQ_API_KEY', 'POSTGRES_URL', 'DATABASE_URL',
  'MONGODB_URI', 'REDIS_URL', 'SESSION_SECRET', 'SPOTIFY_CLIENT_SECRET',
  'TOPGG_TOKEN', 'SENTRY_DSN', 'LOG_WEBHOOK_URL',
]);

const SENSITIVE_PATTERNS = [
  /\b(token|password|secret|key)\s*[=:]\s*\S+/gi,
  /(?:https?:\/\/)[^:]+:[^@]+@/g,
  /\b[A-Za-z0-9-_]{20,}\.[A-Za-z0-9-_]{20,}\.[A-Za-z0-9-_]{20,}\b/g, // JWT
  /sk-[A-Za-z0-9]{32,}/g,    // OpenAI / Anthropic
  /gsk_[A-Za-z0-9]{20,}/g,   // Groq
  /AIza[A-Za-z0-9_-]{35}/g,  // Google API key
];

function redact(obj: unknown, depth = 0): unknown {
  if (depth > 6 || obj === null || typeof obj !== 'object') {
    if (typeof obj === 'string') {
      return SENSITIVE_PATTERNS.reduce((s, r) => s.replace(r, '[REDACTED]'), obj);
    }
    return obj;
  }
  if (Array.isArray(obj)) return obj.map((v) => redact(v, depth + 1));
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    out[k] = SENSITIVE_KEYS.has(k) ? '[REDACTED]' : redact(v, depth + 1);
  }
  return out;
}

function sanitize(value: unknown): unknown {
  if (typeof value === 'string') {
    return value.replace(/[\r\n\t\x00-\x1F\x7F]/g, ' ').trim();
  }
  if (Array.isArray(value)) return value.map(sanitize);
  if (value !== null && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = sanitize(v);
    }
    return out;
  }
  return value;
}

// ─── Level icons & styling ─────────────────────────────────────────────────────
//  Spec: 🟢 INFO  🟡 WARNING  🔴 ERROR  ⚡ PERF  ⚫ DEBUG  🟣 VERBOSE

const LEVEL_CONFIG: Record<string, { icon: string; badge: (s: string) => string }> = {
  error: {
    icon: '🔴',
    badge: (s) => chalk.bgRed.white.bold(` ${s.toUpperCase().padEnd(7)} `),
  },
  warn: {
    icon: '🟡',
    badge: (s) => chalk.bgYellow.black.bold(` ${s.toUpperCase().padEnd(7)} `),
  },
  info: {
    icon: '🟢',
    badge: (s) => chalk.bgBlue.white.bold(` ${s.toUpperCase().padEnd(7)} `),
  },
  debug: {
    icon: '⚫',
    badge: (s) => chalk.bgGray.white.bold(` ${s.toUpperCase().padEnd(7)} `),
  },
  verbose: {
    icon: '🟣',
    badge: (s) => chalk.bgMagenta.white.bold(` ${s.toUpperCase().padEnd(7)} `),
  },
};

// ─── Module colors ─────────────────────────────────────────────────────────────

const MODULE_COLORS: Record<string, (s: string) => string> = {
  bot:          chalk.cyan,
  shard:        chalk.magenta,
  commands:     chalk.yellow,
  events:       chalk.green,
  music:        chalk.hex('#EB459E'),
  lyrics:       chalk.hex('#FF79C6'),
  database:     chalk.blue,
  redis:        chalk.red,
  mongodb:      chalk.hex('#47A248'),
  postgresql:   chalk.hex('#4169E1'),
  economy:      chalk.hex('#F1C40F'),
  moderation:   chalk.hex('#E74C3C'),
  ai:           chalk.hex('#00ADB5'),
  leveling:     chalk.hex('#3498DB'),
  starboard:    chalk.hex('#FFD700'),
  premium:      chalk.hex('#FF9900'),
  giveaways:    chalk.hex('#FF6B6B'),
  health:       chalk.hex('#2ECC71'),
  uptime:       chalk.hex('#1ABC9C'),
  monitoring:   chalk.hex('#9B59B6'),
  security:     chalk.hex('#E67E22'),
  cache:        chalk.hex('#16A085'),
  scheduler:    chalk.hex('#8E44AD'),
  telemetry:    chalk.hex('#2980B9'),
  loader:       chalk.hex('#27AE60'),
  api:          chalk.hex('#0099FF'),
  network:      chalk.hex('#00BFFF'),
  voice:        chalk.hex('#9B59B6'),
  interactions: chalk.hex('#F39C12'),
  performance:  chalk.hex('#E91E63'),
  tickets:      chalk.hex('#1E90FF'),
  automod:      chalk.hex('#FF4500'),
  antinuke:     chalk.hex('#8B0000'),
};

// ─── Module icons (spec: 🎵 🔵 🟣 🟡 🔴 ⚡ 💾 🌐 🎤 📦 🛡) ──────────────────

const MODULE_ICONS: Record<string, string> = {
  bot:          '🤖',
  shard:        '🔀',
  commands:     '⚡',
  events:       '📡',
  loader:       '📦',
  music:        '🎵',
  lyrics:       '🎤',
  database:     '💾',
  mongodb:      '💾',
  postgresql:   '💾',
  redis:        '📦',
  economy:      '💰',
  moderation:   '🛡',
  tickets:      '🎫',
  giveaways:    '🎉',
  ai:           '🟣',
  leveling:     '⬆',
  starboard:    '⭐',
  premium:      '💎',
  automod:      '🛡',
  antinuke:     '🔒',
  health:       '❤',
  uptime:       '⏱',
  monitoring:   '📊',
  security:     '🛡',
  cache:        '📦',
  scheduler:    '⏰',
  telemetry:    '📈',
  api:          '🔵',
  network:      '🌐',
  voice:        '🎤',
  interactions: '💬',
  performance:  '⚡',
};

function styleLevel(level: string): string {
  const raw = level.replace(/\x1B\[[0-9;]*m/g, '');
  const cfg = LEVEL_CONFIG[raw];
  if (!cfg) return chalk.gray(` ${raw.toUpperCase().padEnd(7)} `);
  return cfg.badge(raw);
}

function styleModule(mod?: string): string {
  if (!mod) return chalk.gray('  ' + '─'.padEnd(20));
  const base = mod.split('.')[0];
  const color = MODULE_COLORS[base] ?? chalk.white;
  const icon = MODULE_ICONS[base] ?? '·';
  // Keep module name padded so columns stay aligned
  const padded = mod.padEnd(20);
  return `${icon} ${color(padded)}`;
}

function levelIcon(level: string): string {
  const raw = level.replace(/\x1B\[[0-9;]*m/g, '');
  return LEVEL_CONFIG[raw]?.icon ?? '·';
}

// ─── Formats ──────────────────────────────────────────────────────────────────

const jsonFormat = winston.format.combine(
  winston.format.timestamp({ format: () => manilaTimestamp() }),
  winston.format.errors({ stack: true }),
  winston.format((info) => {
    const { message, ...meta } = info;
    const cleaned = redact(sanitize(meta)) as Record<string, unknown>;
    info.message = sanitize(message) as string;
    Object.assign(info, cleaned);
    return info;
  })(),
  winston.format.json(),
);

const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: () => manilaTimestampShort() }),
  winston.format.printf(({
    timestamp, level, message, module: mod,
    shardId, durationMs, correlationId, requestId,
    guild, user, channel, command,
    ...meta
  }) => {
    const sep    = chalk.gray('│');
    const icon   = levelIcon(level);
    const lvl    = styleLevel(level);
    const modStr = styleModule(mod as string | undefined);
    const ts     = chalk.dim(String(timestamp));

    // Context fields
    const shard  = shardId !== undefined   ? chalk.magenta(`  [S${shardId}]`) : '';
    const dur    = durationMs !== undefined ? chalk.dim(` +${durationMs}ms`)  : '';
    const req    = requestId   ? chalk.gray(`  ·${requestId}`)    : '';
    const corr   = correlationId ? chalk.gray(`  ~${correlationId}`) : '';

    // Compact guild/user/channel/command context
    const ctx: string[] = [];
    if (guild)   ctx.push(chalk.cyan(`guild:${guild}`));
    if (user)    ctx.push(chalk.green(`user:${user}`));
    if (channel) ctx.push(chalk.yellow(`ch:${channel}`));
    if (command) ctx.push(chalk.magenta(`cmd:${command}`));
    const ctxStr = ctx.length ? chalk.gray('  ') + ctx.join(chalk.gray(' · ')) : '';

    // Remaining meta (exclude known fields)
    const skip = new Set([
      'splat', 'correlationId', 'requestId', 'durationMs', 'shardId',
      'guild', 'user', 'channel', 'command',
    ]);
    const remaining = Object.keys(meta).filter(k => !skip.has(k) && meta[k] !== undefined);
    const metaStr = remaining.length
      ? chalk.gray('  ' + JSON.stringify(
          redact(sanitize(Object.fromEntries(remaining.map(k => [k, meta[k]])))),
        ))
      : '';

    return `${ts} ${sep} ${icon} ${lvl} ${sep} ${modStr} ${sep} ${chalk.white(String(message))}${shard}${dur}${req}${corr}${ctxStr}${metaStr}`;
  }),
);

// ─── LOG_LEVEL env override ───────────────────────────────────────────────────

const LOG_LEVEL = process.env.LOG_LEVEL ?? (config.logging as any).level ?? 'info';
const JSON_LOGS = process.env.LOG_FORMAT === 'json' || process.env.NODE_ENV === 'production';

// ─── Transports ──────────────────────────────────────────────────────────────

const baseTransports: winston.transport[] = [
  new winston.transports.Console({
    format: JSON_LOGS ? jsonFormat : consoleFormat,
  }),
];

const rotationOpts = (config.logging as any).rotation;
if (rotationOpts?.enabled) {
  const shared = {
    datePattern: 'YYYY-MM-DD',
    maxSize: rotationOpts.maxSize ?? '20m',
    maxFiles: rotationOpts.maxFiles ?? '14d',
    format: jsonFormat,
  };

  baseTransports.push(
    new DailyRotateFile({ ...shared, filename: join(LOGS_DIR, 'combined-%DATE%.log') }),
    new DailyRotateFile({ ...shared, filename: join(LOGS_DIR, 'error-%DATE%.log'), level: 'error' }),
    new DailyRotateFile({ ...shared, filename: join(LOGS_DIR, 'info-%DATE%.log'), level: 'info' }),
  );
}

// ─── Discord Webhook Transport ────────────────────────────────────────────────

const WEBHOOK_URL  = process.env.LOG_WEBHOOK_URL;
const WEBHOOK_BATCH_MS = parseInt(process.env.LOG_WEBHOOK_BATCH_MS ?? '5000', 10);
let webhookQueue: Array<{ level: string; module?: string; message: string }> = [];
let webhookTimer: NodeJS.Timeout | null = null;

async function flushWebhookQueue(): Promise<void> {
  if (!WEBHOOK_URL || webhookQueue.length === 0) return;
  const batch = webhookQueue.splice(0, 20);

  const lines = batch.map(({ level, module: mod, message }) => {
    const cfg = LEVEL_CONFIG[level];
    const emoji = cfg?.icon ?? '🔵';
    const modIcon = mod ? (MODULE_ICONS[mod.split('.')[0]] ?? '') : '';
    const modLabel = mod ? `\`[${modIcon} ${mod}]\` ` : '';
    return `${emoji} **${level.toUpperCase()}** ${modLabel}${message}`;
  });

  const content = lines.join('\n').slice(0, 2000);
  try {
    await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, username: 'Panindigan Logs', avatar_url: 'https://i.imgur.com/AfFp7pu.png' }),
    });
  } catch {
    // Never crash on webhook failures
  }
}

class DiscordWebhookTransport extends winston.Transport {
  constructor() {
    super({ level: process.env.LOG_WEBHOOK_LEVEL ?? 'error' });
  }

  log(info: Record<string, unknown>, callback: () => void): void {
    setImmediate(() => this.emit('logged', info));
    webhookQueue.push({
      level: String(info.level).replace(/\x1B\[[0-9;]*m/g, ''),
      module: info.module as string | undefined,
      message: String(info.message),
    });
    if (!webhookTimer) {
      webhookTimer = setTimeout(() => {
        webhookTimer = null;
        flushWebhookQueue();
      }, WEBHOOK_BATCH_MS);
    }
    callback();
  }
}

if (WEBHOOK_URL) {
  baseTransports.push(new DiscordWebhookTransport());
}

// ─── Root logger ──────────────────────────────────────────────────────────────

export const logger = winston.createLogger({
  level: LOG_LEVEL,
  format: jsonFormat,
  transports: baseTransports,
});

// ─── Child logger factory ─────────────────────────────────────────────────────

function child(module: string, extra?: Record<string, unknown>): winston.Logger {
  return logger.child({ module, ...extra });
}

// ─── Module child loggers ─────────────────────────────────────────────────────

export const loggers = {
  // Core
  bot:          child('bot'),
  shard:        child('shard'),
  commands:     child('commands'),
  events:       child('events'),
  loader:       child('loader'),
  // Music
  music:        child('music'),
  lyrics:       child('lyrics'),
  voice:        child('voice'),
  // Databases
  database:     child('database'),
  mongodb:      child('database.mongodb'),
  postgresql:   child('database.postgresql'),
  redis:        child('database.redis'),
  // Features
  economy:      child('economy'),
  moderation:   child('moderation'),
  tickets:      child('tickets'),
  giveaways:    child('giveaways'),
  ai:           child('ai'),
  leveling:     child('leveling'),
  starboard:    child('starboard'),
  premium:      child('premium'),
  automod:      child('automod'),
  antinuke:     child('antinuke'),
  // Interactions
  interactions: child('interactions'),
  // Infra
  health:       child('health'),
  uptime:       child('uptime'),
  monitoring:   child('monitoring'),
  security:     child('security'),
  cache:        child('cache'),
  scheduler:    child('scheduler'),
  telemetry:    child('telemetry'),
  // Network / API
  api:          child('api'),
  network:      child('network'),
  // Performance
  performance:  child('performance'),
} as const;

/** Create an ad-hoc child logger for any module name. */
export function createModuleLogger(module: string, extra?: Record<string, unknown>): winston.Logger {
  return child(module, extra);
}

// ─── Shard logger ─────────────────────────────────────────────────────────────

export function createShardLogger(shardId: number): winston.Logger {
  const shardLogPath = join(SHARDS_DIR, `shard-${shardId}-%DATE%.log`);
  const shardTransports: winston.transport[] = [
    new winston.transports.Console({
      format: JSON_LOGS ? jsonFormat : consoleFormat,
    }),
  ];

  if (rotationOpts?.enabled) {
    shardTransports.push(
      new DailyRotateFile({
        filename: shardLogPath,
        datePattern: 'YYYY-MM-DD',
        maxSize: rotationOpts.maxSize ?? '20m',
        maxFiles: rotationOpts.maxFiles ?? '14d',
        format: jsonFormat,
      }),
    );
  }

  return winston.createLogger({
    level: LOG_LEVEL,
    format: jsonFormat,
    defaultMeta: { shardId, module: 'shard' },
    transports: shardTransports,
  });
}

// ─── ID generators ────────────────────────────────────────────────────────────

export function generateRequestId(): string {
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

export function generateCorrelationId(): string {
  return `corr_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

// ─── Structured log helpers ───────────────────────────────────────────────────

/** Log command execution (slash or prefix). */
export function logCommandExecution(
  shardId: number,
  guildId: string,
  userId: string,
  command: string,
  _args: string[],
  executionTime: number,
  success: boolean,
): void {
  loggers.commands.info(`Command: ${command}`, {
    shardId,
    guild: guildId,
    user: userId,
    command,
    args: _args.map((a) => sanitize(a) as string),
    durationMs: executionTime,
    success,
    environment: process.env.NODE_ENV ?? 'development',
    version: (config as any).configVersion ?? '0.1.1',
  });
}

/** Log a component / modal interaction. */
export function logInteraction(
  type: 'button' | 'selectMenu' | 'modal' | 'autocomplete' | 'contextMenu',
  opts: {
    customId?: string;
    command?: string;
    guildId?: string;
    userId?: string;
    channelId?: string;
    shardId?: number;
    durationMs?: number;
    success?: boolean;
    requestId?: string;
  },
): void {
  loggers.interactions.info(`${type}: ${opts.customId ?? opts.command ?? '?'}`, {
    type,
    guild:     opts.guildId,
    user:      opts.userId,
    channel:   opts.channelId,
    command:   opts.command,
    customId:  opts.customId,
    shardId:   opts.shardId,
    durationMs: opts.durationMs,
    success:   opts.success,
    requestId: opts.requestId,
  });
}

/** Log a voice channel state event. */
export function logVoiceEvent(
  event: 'join' | 'leave' | 'move' | 'mute' | 'deafen' | 'stream' | 'update',
  opts: {
    guildId: string;
    userId: string;
    channelId?: string;
    oldChannelId?: string;
    shardId?: number;
  },
): void {
  loggers.voice.info(`Voice ${event}`, {
    event,
    guild:      opts.guildId,
    user:       opts.userId,
    channel:    opts.channelId,
    oldChannel: opts.oldChannelId,
    shardId:    opts.shardId,
  });
}

/** Log a music playback event. */
export function logMusicEvent(
  event: 'trackStart' | 'trackEnd' | 'trackError' | 'queueEnd' | 'pause' | 'resume' | 'skip' | 'stop' | 'search' | 'add' | 'remove' | 'volume',
  opts: {
    guildId: string;
    userId?: string;
    track?: string;
    source?: string;
    durationMs?: number;
    queueSize?: number;
    shardId?: number;
  },
): void {
  loggers.music.info(`Music ${event}${opts.track ? `: "${opts.track}"` : ''}`, {
    event,
    guild:    opts.guildId,
    user:     opts.userId,
    track:    opts.track,
    source:   opts.source,
    queue:    opts.queueSize,
    shardId:  opts.shardId,
    durationMs: opts.durationMs,
  });
}

/** Log an AI provider request. */
export function logAIRequest(
  provider: 'openai' | 'anthropic' | 'gemini' | 'groq' | string,
  opts: {
    model?: string;
    guildId?: string;
    userId?: string;
    promptTokens?: number;
    completionTokens?: number;
    durationMs?: number;
    success: boolean;
    error?: string;
    requestId?: string;
  },
): void {
  if (opts.success) {
    loggers.ai.info(`AI response from ${provider}`, {
      provider,
      model:             opts.model,
      guild:             opts.guildId,
      user:              opts.userId,
      promptTokens:      opts.promptTokens,
      completionTokens:  opts.completionTokens,
      durationMs:        opts.durationMs,
      requestId:         opts.requestId,
    });
  } else {
    loggers.ai.warn(`AI request failed (${provider})`, {
      provider,
      model:     opts.model,
      guild:     opts.guildId,
      user:      opts.userId,
      durationMs: opts.durationMs,
      error:     opts.error,
      requestId: opts.requestId,
    });
  }
}

/** Log a cache lookup (hit or miss). */
export function logCacheEvent(
  type: 'hit' | 'miss' | 'set' | 'del' | 'expire',
  opts: {
    key: string;
    store?: 'redis' | 'memory' | string;
    ttl?: number;
    durationMs?: number;
  },
): void {
  loggers.cache.debug(`Cache ${type}: ${opts.key}`, {
    type,
    key:       opts.key,
    store:     opts.store ?? 'redis',
    ttl:       opts.ttl,
    durationMs: opts.durationMs,
  });
}

/** Log an outbound API request. */
export function logAPIRequest(
  method: string,
  url: string,
  opts: {
    statusCode?: number;
    durationMs?: number;
    success?: boolean;
    requestId?: string;
    error?: string;
  },
): void {
  const level = (opts.statusCode ?? 0) >= 500 ? 'error' : (opts.statusCode ?? 0) >= 400 ? 'warn' : 'info';
  loggers.api[level](`${method.toUpperCase()} ${url}`, {
    method,
    url,
    statusCode: opts.statusCode,
    durationMs: opts.durationMs,
    success:    opts.success,
    requestId:  opts.requestId,
    error:      opts.error,
  });
}

/** Log a security event (rate limit, permission denial, suspicious activity, etc.). */
export function logSecurityEvent(
  event: 'rateLimit' | 'permissionDenied' | 'suspiciousActivity' | 'spamDetected' | 'blacklisted' | 'antiNuke' | string,
  opts: {
    guildId?: string;
    userId?: string;
    channelId?: string;
    details?: string;
    severity?: 'low' | 'medium' | 'high' | 'critical';
    shardId?: number;
  },
): void {
  const level = opts.severity === 'critical' || opts.severity === 'high' ? 'warn' : 'info';
  loggers.security[level](`Security: ${event}`, {
    event,
    severity: opts.severity ?? 'medium',
    guild:    opts.guildId,
    user:     opts.userId,
    channel:  opts.channelId,
    details:  opts.details,
    shardId:  opts.shardId,
  });
}

/** Log a performance measurement. */
export function logPerformance(
  operation: string,
  durationMs: number,
  opts?: {
    threshold?: number;
    guildId?: string;
    userId?: string;
    meta?: Record<string, unknown>;
  },
): void {
  const threshold = opts?.threshold ?? 1000;
  const level = durationMs > threshold * 2 ? 'warn' : 'info';
  loggers.performance[level](`⚡ ${operation}`, {
    operation,
    durationMs,
    slow:    durationMs > threshold,
    guild:   opts?.guildId,
    user:    opts?.userId,
    ...opts?.meta,
  });
}

/** Log a generic error with full context. */
export function logError(
  shardId: number,
  error: Error,
  context?: Record<string, unknown>,
): void {
  loggers.bot.error('Error occurred', {
    shardId,
    errorMessage: error.message,
    stack: error.stack,
    ...context,
  });
}

// ─── Global process error handlers ───────────────────────────────────────────

export function registerGlobalErrorHandlers(): void {
  process.on('unhandledRejection', (reason) => {
    loggers.bot.error('Unhandled promise rejection', {
      reason: reason instanceof Error ? reason.message : String(reason),
      stack:  reason instanceof Error ? reason.stack   : undefined,
    });
  });

  process.on('uncaughtException', (error) => {
    loggers.bot.error('Uncaught exception — shutting down', {
      errorMessage: error.message,
      stack: error.stack,
    });
    setTimeout(() => process.exit(1), 1000);
  });

  process.on('SIGTERM', () => {
    loggers.bot.info('SIGTERM received — graceful shutdown initiated');
  });

  process.on('SIGINT', () => {
    loggers.bot.info('SIGINT received — graceful shutdown initiated');
  });

  process.on('SIGHUP', () => {
    loggers.bot.info('SIGHUP received — reloading');
  });
}

// ─── Periodic health-check log ────────────────────────────────────────────────

export function startHealthCheckLogger(
  getStats: () => Record<string, unknown>,
  intervalMs = 300_000,
): NodeJS.Timeout {
  return setInterval(() => {
    const mem = process.memoryUsage();
    const cpu = process.cpuUsage();
    const stats = getStats();
    loggers.health.info('Periodic health snapshot', {
      memoryMB:     Math.round(mem.heapUsed  / 1024 / 1024),
      heapTotalMB:  Math.round(mem.heapTotal / 1024 / 1024),
      rssMB:        Math.round(mem.rss       / 1024 / 1024),
      externalMB:   Math.round(mem.external  / 1024 / 1024),
      cpuUserMs:    Math.round(cpu.user   / 1000),
      cpuSystemMs:  Math.round(cpu.system / 1000),
      uptimeSeconds: Math.floor(process.uptime()),
      pid:           process.pid,
      nodeVersion:   process.version,
      environment:   process.env.NODE_ENV ?? 'development',
      ...stats,
    });
  }, intervalMs);
}
