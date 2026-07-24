export interface AiMemoryDocument {
  _id: string;
  userId: string;
  guildId: string;
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
  }>;
  provider: string;
  model: string;
  createdAt: Date;
  updatedAt: Date;
}

export const aiMemoryCollectionName = 'ai_conversations';
