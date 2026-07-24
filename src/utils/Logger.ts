import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import config from '../../config.json';

const LOGS_DIR = join(process.cwd(), 'logs');

if (!existsSync(LOGS_DIR)) {
  mkdirSync(LOGS_DIR, { recursive: true });
}

const SHARDS_DIR = join(LOGS_DIR, 'shards');
if (!existsSync(SHARDS_DIR)) {
  mkdirSync(SHARDS_DIR, { recursive: true });
}

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, shardId, ...meta }) => {
    const shardInfo = shardId !== undefined ? `[Shard ${shardId}]` : '';
    return `${timestamp} ${level} ${shardInfo}: ${message} ${
      Object.keys(meta).length ? JSON.stringify(meta) : ''
    }`;
  })
);

const transports: winston.transport[] = [
  new winston.transports.Console({
    format: consoleFormat,
  }),
];

if (config.logging.rotation.enabled) {
  transports.push(
    new DailyRotateFile({
      filename: join(LOGS_DIR, 'combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: config.logging.rotation.maxSize,
      maxFiles: config.logging.rotation.maxFiles,
      format: logFormat,
    })
  );

  transports.push(
    new DailyRotateFile({
      filename: join(LOGS_DIR, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxSize: config.logging.rotation.maxSize,
      maxFiles: config.logging.rotation.maxFiles,
      format: logFormat,
    })
  );

  transports.push(
    new DailyRotateFile({
      filename: join(LOGS_DIR, 'info-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'info',
      maxSize: config.logging.rotation.maxSize,
      maxFiles: config.logging.rotation.maxFiles,
      format: logFormat,
    })
  );
}

export const logger = winston.createLogger({
  level: config.logging.level,
  format: logFormat,
  transports,
});

export function createShardLogger(shardId: number): winston.Logger {
  const shardLogPath = join(SHARDS_DIR, `shard-${shardId}-%DATE%.log`);
  
  return winston.createLogger({
    level: config.logging.level,
    format: logFormat,
    defaultMeta: { shardId },
    transports: [
      new winston.transports.Console({
        format: consoleFormat,
      }),
      new DailyRotateFile({
        filename: shardLogPath,
        datePattern: 'YYYY-MM-DD',
        maxSize: config.logging.rotation.maxSize,
        maxFiles: config.logging.rotation.maxFiles,
        format: logFormat,
      }),
    ],
  });
}

export function logCommandExecution(
  shardId: number,
  guildId: string,
  userId: string,
  command: string,
  args: string[],
  executionTime: number,
  success: boolean
): void {
  logger.info('Command executed', {
    shardId,
    guildId,
    userId,
    command,
    args,
    executionTime,
    success,
    environment: process.env.NODE_ENV || 'development',
    version: config.configVersion,
  });
}

export function logError(
  shardId: number,
  error: Error,
  context?: Record<string, any>
): void {
  logger.error('Error occurred', {
    shardId,
    error: error.message,
    stack: error.stack,
    ...context,
  });
}
