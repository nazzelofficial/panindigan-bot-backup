export interface EventLogDocument {
  _id: string;
  timestamp: Date;
  level: 'error' | 'warn' | 'info' | 'debug' | 'verbose';
  shardId: number;
  guildId?: string;
  userId?: string;
  eventType: string;
  data: Record<string, any>;
  environment: string;
  version: string;
}

export const eventLogsCollectionName = 'event_logs';
