export interface AIResponse {
    content: string;
    provider: string;
    model: string;
    tokens?: number;
}
export declare class AIHandler {
    private openai;
    private anthropic;
    private gemini;
    private groq;
    constructor();
    private initializeProviders;
    private getConversationMemory;
    private saveConversationMemory;
    private generateWithOpenAI;
    private generateWithAnthropic;
    private generateWithGemini;
    private generateWithGroq;
    generateResponse(userId: string, guildId: string, userMessage: string, premiumTier?: string): Promise<AIResponse>;
    generateImage(prompt: string, premiumTier?: string): Promise<string>;
    clearConversationMemory(userId: string, guildId: string): Promise<void>;
    /**
     * Generate a one-shot task response with a custom system prompt (no memory saved).
     */
    generateTaskResponse(userMessage: string, taskSystemPrompt: string, providerOverride?: 'openai' | 'anthropic' | 'gemini' | 'groq'): Promise<AIResponse>;
    /**
     * Generate a response using a specific provider (for provider-specific commands).
     */
    generateWithProvider(userId: string, guildId: string, userMessage: string, provider: 'openai' | 'anthropic' | 'gemini' | 'groq', premiumTier?: string): Promise<AIResponse>;
}
//# sourceMappingURL=AIHandler.d.ts.map