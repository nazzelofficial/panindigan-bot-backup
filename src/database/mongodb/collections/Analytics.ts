export interface AnalyticsDocument {
  _id: string;
  guildId: string;
  commandUsage: Record<string, number>;
  memberActivity: {
    userId: string;
    messageCount: number;
    voiceMinutes: number;
    lastActive: Date;
  }[];
  aiUsage: {
    provider: string;
    model: string;
    requestCount: number;
    tokenCount: number;
  }[];
  period: 'daily' | 'weekly' | 'monthly';
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export const analyticsCollectionName = 'bot_analytics';
