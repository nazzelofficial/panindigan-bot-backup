export declare class GeminiService {
    private client;
    constructor();
    isAvailable(): boolean;
    chat(prompt: string, model?: string, temperature?: number): Promise<{
        content: string;
        model: string;
    }>;
    chatWithHistory(history: {
        role: 'user' | 'model';
        parts: {
            text: string;
        }[];
    }[], userMessage: string, model?: string): Promise<{
        content: string;
        model: string;
    }>;
    analyzeImage(imageUrl: string, prompt: string, model?: string): Promise<{
        content: string;
        model: string;
    }>;
    getAvailableModels(): string[];
}
export declare const geminiService: GeminiService;
//# sourceMappingURL=GeminiService.d.ts.map