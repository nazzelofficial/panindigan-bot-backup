export declare class AnthropicService {
    private client;
    constructor();
    isAvailable(): boolean;
    chat(userMessage: string, systemPrompt?: string, model?: string, maxTokens?: number): Promise<{
        content: string;
        model: string;
        inputTokens: number;
        outputTokens: number;
    }>;
    chatWithHistory(messages: {
        role: 'user' | 'assistant';
        content: string;
    }[], systemPrompt?: string, model?: string, maxTokens?: number): Promise<{
        content: string;
        model: string;
        tokens: number;
    }>;
    getAvailableModels(): string[];
}
export declare const anthropicService: AnthropicService;
//# sourceMappingURL=AnthropicService.d.ts.map