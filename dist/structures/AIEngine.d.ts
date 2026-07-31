export interface AIMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}
export interface AIResponse {
    content: string;
    provider: string;
    model: string;
    tokens?: number;
    imageUrl?: string;
}
export interface AIImageOptions {
    size?: '256x256' | '512x512' | '1024x1024' | '1792x1024' | '1024x1792';
    quality?: 'standard' | 'hd';
    style?: 'vivid' | 'natural';
}
export interface AIChatOptions {
    systemPrompt?: string;
    temperature?: number;
    maxTokens?: number;
    stream?: boolean;
}
export declare class AIEngine {
    private openai;
    private anthropic;
    private gemini;
    private groq;
    private deepseek;
    private grok;
    private mistral;
    private static instance;
    static getInstance(): AIEngine;
    initializeProviders(): void;
    getAvailableProviders(): string[];
    chat(provider: string, model: string, messages: AIMessage[], options?: AIChatOptions): Promise<AIResponse>;
    private chatOpenAI;
    private chatAnthropic;
    private chatGemini;
    private chatGroq;
    private chatOpenAICompat;
    private failover;
    generateImage(prompt: string, options?: AIImageOptions): Promise<AIResponse>;
    getConversationHistory(userId: string, guildId: string, limit?: number): Promise<AIMessage[]>;
    saveMessage(userId: string, guildId: string, role: 'user' | 'assistant', content: string): Promise<void>;
    clearHistory(userId: string, guildId: string): Promise<void>;
    getUsageStats(guildId: string): Promise<{
        totalRequests: number;
        byProvider: Record<string, number>;
    }>;
    logRequest(userId: string, guildId: string, provider: string, model: string, tokens?: number): Promise<void>;
}
export declare const aiEngine: AIEngine;
//# sourceMappingURL=AIEngine.d.ts.map