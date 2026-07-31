import { AIResponse, AIChatOptions, AIImageOptions } from '../structures/AIEngine.js';
export declare class AIService {
    ask(prompt: string, userId: string, guildId: string, provider?: string, model?: string, options?: AIChatOptions): Promise<AIResponse>;
    chat(message: string, userId: string, guildId: string, provider?: string, model?: string, systemPrompt?: string): Promise<AIResponse>;
    generateImage(prompt: string, userId: string, guildId: string, options?: AIImageOptions): Promise<AIResponse>;
    clearMemory(userId: string, guildId: string): Promise<void>;
    getAvailableProviders(): string[];
    translate(text: string, targetLang: string, provider?: string, model?: string): Promise<AIResponse>;
    summarize(text: string, provider?: string, model?: string): Promise<AIResponse>;
    generateCode(language: string, task: string, provider?: string, model?: string): Promise<AIResponse>;
    debugCode(code: string, error: string, provider?: string, model?: string): Promise<AIResponse>;
    analyzeCode(code: string, provider?: string, model?: string): Promise<AIResponse>;
    writeContent(type: string, topic: string, details?: string, provider?: string, model?: string): Promise<AIResponse>;
}
export declare const aiService: AIService;
//# sourceMappingURL=AIService.d.ts.map