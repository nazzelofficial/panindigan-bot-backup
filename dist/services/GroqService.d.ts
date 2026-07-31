export declare class GroqService {
    private client;
    constructor();
    isAvailable(): boolean;
    chat(messages: {
        role: 'user' | 'assistant' | 'system';
        content: string;
    }[], model?: string, temperature?: number, maxTokens?: number): Promise<{
        content: string;
        model: string;
        tokens: number | undefined;
        completionTime: number | undefined;
    }>;
    fastChat(prompt: string, model?: string): Promise<{
        content: string;
        model: string;
        tokens: number | undefined;
        completionTime: number | undefined;
    }>;
    getAvailableModels(): string[];
}
export declare const groqService: GroqService;
//# sourceMappingURL=GroqService.d.ts.map