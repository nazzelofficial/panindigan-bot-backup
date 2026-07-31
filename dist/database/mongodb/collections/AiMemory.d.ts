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
export declare const aiMemoryCollectionName = "ai_conversations";
//# sourceMappingURL=AiMemory.d.ts.map