// @ts-nocheck
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import config from '../../config.json' with { type: 'json' };

// ─── Directories ─────────────────────────────────────────────────────────────

const LOGS_DIR = join(process.cwd(), 'logs');
const SHARDS_DIR = join(LOGS_DIR, 'shards');

for (const dir of [LOGS_DIR, SHARDS_DIR]) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

// ─── Sensitive-field redaction ────────────────────────────────────────────────

const SENSITIVE_KEYS = new Set([
  'token', 'password', 'secret', 'apiKey', 'api_key',
  'authorization', 'auth', 'credential', 'credentials',
  'DISCORD_TOKEN', 'OPENAI_API_KEY', 'ANTHROPIC_API_KEY',
  'GEMINI_API_KEY', 'GROQ_API_KEY', 'POSTGRES_URL', 'MONGODB_URI',
  'REDIS_URL', 'SESSION_SECRET', 'SPOTIFY_CLIENT_SECRET',
]);

/** Recursively redact sensitive fields from a log metadata object. */
function redact(obj: unknown, depth = 0): unknown {
  if (depth > 6 || obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map((v) => redact(v, depth + 1));
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    out[k] = SENSITIVE_KEYS.has(k) ? '[REDACTED]' : redact(v, depth + 1);
  }
  return out;
}

/** Strip control characters / newlines from user-supplied strings to prevent log injection. */
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

// ─── Formats ─────────────────────────────────────────────────────────────────

const jsonFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DDTHH:mm:ss.SSSZ' }),
  winston.format.errors({ stack: true }),
  winston.format((info) => {
    // Redact + sanitize all metadata fields (everything except level/message/timestamp)
    const { level, message, timestamp, ...meta } = info;
    const cleaned = redact(sanitize(meta)) as Record<string, unknown>;
    return { level, message: sanitize(message) as string, timestamp, ...cleaned };
  })(),
  winston.format.json(),
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, module: mod, shardId, ...meta }) => {
    const parts: string[] = [`${timestamp} ${level}`];
    if (mod) parts.push(`[${mod}]`);
    if (shardId !== undefined) parts.push(`[Shard ${shardId}]`);
    parts.push(`: ${message}`);
    const remaining = Object.keys(meta).length
      ? ' ' + JSON.stringify(redact(sanitize(meta)))
      : '';
    return parts.join('') + remaining;
  }),
);

// ─── LOG_LEVEL env override ───────────────────────────────────────────────────

const LOG_LEVEL = process.env.LOG_LEVEL ?? (config.logging as any).level ?? 'info';

// ─── Transports ───────────────────────────────────────────────────────────────

const baseTransports: winston.transport[] = [
  new winston.transports.Console({ format: consoleFormat }),
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
// Forwards error / fatal messages to a staff Discord channel in real time.
// Rate-limited: at most one webhook call per WEBHOOK_BATCH_MS ms.

const WEBHOOK_URL = process.env.LOG_WEBHOOK_URL;
const WEBHOOK_BATCH_MS = 5000;
let webhookQueue: string[] = [];
let webhookTimer: NodeJS.Timeout | null = null;

async function flushWebhookQueue(): Promise<void> {
  if (!WEBHOOK_URL || webhookQueue.length === 0) return;
  const batch = webhookQueue.splice(0, webhookQueue.length);
  const content = batch.join('\n').slice(0, 2000); // Discord 2000-char limit
  try {
    await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, username: 'Panindigan Logs' }),
    });
  } catch {
    // Silently swallow — don't crash the bot if webhook is down
  }
}

class DiscordWebhookTransport extends winston.Transport {
  constructor() {
    super({ level: 'error' });
  }

  log(info: Record<string, unknown>, callback: () => void): void {
    setImmediate(() => this.emit('logged', info));
    const emoji = String(info.level).includes('error') ? '🔴' : '🟠';
    const module = info.module ? `[${info.module}] ` : '';
    const msg = `${emoji} **${String(info.level).toUpperCase()}** ${module}${String(info.message)}`;
    webhookQueue.push(msg);
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

// ─── Child loggers (per module/subsystem) ────────────────────────────────────

function child(module: string, extra?: Record<string, unknown>): winston.Logger {
  return logger.child({ module, ...extra });
}

export const loggers = {
  bot:        child('bot'),
  commands:   child('commands'),
  events:     child('events'),
  music:      child('music'),
  database:   child('database'),
  mongodb:    child('database.mongodb'),
  postgresql: child('database.postgresql'),
  redis:      child('database.redis'),
  economy:    child('economy'),
  moderation: child('moderation'),
  tickets:    child('tickets'),
  giveaways:  child('giveaways'),
  ai:         child('ai'),
  leveling:   child('leveling'),
  starboard:  child('starboard'),
  premium:    child('premium'),
  automod:    child('automod'),
  antinuke:   child('antinuke'),
  shard:      child('shard'),
} as const;

/** Create an ad-hoc child logger for any module name. */
export function createModuleLogger(module: string, extra?: Record<string, unknown>): winston.Logger {
  return child(module, extra);
}

// ─── Shard logger ────────────────────────────────────────────────────────────

export function createShardLogger(shardId: number): winston.Logger {
  const shardLogPath = join(SHARDS_DIR, `shard-${shardId}-%DATE%.log`);
  const shardTransports: winston.transport[] = [
    new winston.transports.Console({ format: consoleFormat }),
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

// ─── Command execution logger ─────────────────────────────────────────────────

export function logCommandExecution(
  shardId: number,
  guildId: string,
  userId: string,
  command: string,
  _args: string[],
  executionTime: number,
  success: boolean,
): void {
  loggers.commands.info('Command executed', {
    shardId,
    guildId,
    userId,
    command,
    _args: _args.map((a) => sanitize(a) as string),
    executionTimeMs: executionTime,
    success,
    environment: process.env.NODE_ENV ?? 'development',
    version: (config as any).configVersion ?? '0.1.1',
  });
}

// ─── Error logger ─────────────────────────────────────────────────────────────

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
  process.on('unhandledRejection', (reason, promise) => {
    loggers.bot.error('Unhandled promise rejection', {
      reason: reason instanceof Error ? reason.message : String(reason),
      stack: reason instanceof Error ? reason.stack : undefined,
    });
  });

  process.on('uncaughtException', (error) => {
    loggers.bot.error('Uncaught exception — shutting down', {
      errorMessage: error.message,
      stack: error.stack,
    });
    // Give the logger time to flush before exiting
    setTimeout(() => process.exit(1), 1000);
  });

  process.on('SIGTERM', () => {
    loggers.bot.info('SIGTERM received — graceful shutdown initiated');
  });

  process.on('SIGINT', () => {
    loggers.bot.info('SIGINT received — graceful shutdown initiated');
  });
}

// ─── Periodic health-check log ───────────────────────────────────────────────

/**
 * Start emitting a periodic health-check log entry.
 * @param intervalMs How often to log (default 5 minutes)
 */
export function startHealthCheckLogger(
  getStats: () => Record<string, unknown>,
  intervalMs = 300_000,
): NodeJS.Timeout {
  return setInterval(() => {
    const stats = getStats();
    loggers.bot.info('Health check', {
      memoryMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      uptimeSeconds: Math.floor(process.uptime()),
      ...stats,
    });
  }, intervalMs);
}
