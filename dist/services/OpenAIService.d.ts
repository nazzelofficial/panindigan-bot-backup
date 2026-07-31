import { OpenAI } from 'openai';
export declare class OpenAIService {
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
    }>;
    generateImage(prompt: string, size?: '256x256' | '512x512' | '1024x1024' | '1792x1024' | '1024x1792', quality?: 'standard' | 'hd'): Promise<{
        url: string;
        revisedPrompt: string;
    }>;
    moderate(input: string): Promise<OpenAI.Moderations.Moderation>;
    transcribe(audioBuffer: Buffer, filename: string): Promise<string>;
    getAvailableModels(): string[];
}
export declare const openAIService: OpenAIService;
//# sourceMappingURL=OpenAIService.d.ts.map