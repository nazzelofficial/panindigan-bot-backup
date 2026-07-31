// @ts-nocheck
import { aiEngine } from '../structures/AIEngine.js';
export class AIService {
    async ask(prompt, userId, guildId, provider = 'openai', model = 'gpt-4o-mini', options = {}) {
        const history = await aiEngine.getConversationHistory(userId, guildId, 5);
        const messages = [
            ...history,
            { role: 'user', content: prompt },
        ];
        const response = await aiEngine.chat(provider, model, messages, {
            systemPrompt: options.systemPrompt || 'Ikaw si Panindigan, isang matulungin at masayang Discord bot na nagsasalita ng Filipino at English.',
            ...options,
        });
        await aiEngine.logRequest(userId, guildId, response.provider, response.model, response.tokens);
        return response;
    }
    async chat(message, userId, guildId, provider = 'openai', model = 'gpt-4o-mini', systemPrompt) {
        const history = await aiEngine.getConversationHistory(userId, guildId, 20);
        const messages = [
            ...history,
            { role: 'user', content: message },
        ];
        const response = await aiEngine.chat(provider, model, messages, {
            systemPrompt: systemPrompt || 'Ikaw si Panindigan, isang matulungin at masayang Discord bot na nagsasalita ng Filipino at English. Mag-usap ng natural at friendly.',
        });
        // Save to memory
        await aiEngine.saveMessage(userId, guildId, 'user', message);
        await aiEngine.saveMessage(userId, guildId, 'assistant', response.content);
        await aiEngine.logRequest(userId, guildId, response.provider, response.model, response.tokens);
        return response;
    }
    async generateImage(prompt, userId, guildId, options = {}) {
        const response = await aiEngine.generateImage(prompt, options);
        await aiEngine.logRequest(userId, guildId, 'openai', 'dall-e-3');
        return response;
    }
    async clearMemory(userId, guildId) {
        await aiEngine.clearHistory(userId, guildId);
    }
    getAvailableProviders() {
        return aiEngine.getAvailableProviders();
    }
    async translate(text, targetLang, provider = 'openai', model = 'gpt-4o-mini') {
        return await aiEngine.chat(provider, model, [
            { role: 'user', content: `Translate the following text to ${targetLang}. Only return the translation, no explanations:\n\n${text}` },
        ], { temperature: 0.3 });
    }
    async summarize(text, provider = 'openai', model = 'gpt-4o-mini') {
        return await aiEngine.chat(provider, model, [
            { role: 'user', content: `Please provide a concise, well-structured summary of the following text:\n\n${text}` },
        ], { temperature: 0.5 });
    }
    async generateCode(language, task, provider = 'openai', model = 'gpt-4o') {
        return await aiEngine.chat(provider, model, [
            { role: 'user', content: `Write ${language} code for the following task. Include comments and explanation:\n\n${task}` },
        ], { temperature: 0.2, maxTokens: 4096 });
    }
    async debugCode(code, error, provider = 'openai', model = 'gpt-4o') {
        return await aiEngine.chat(provider, model, [
            { role: 'user', content: `Debug this code and fix the error:\n\nCode:\n\`\`\`\n${code}\n\`\`\`\n\nError: ${error}` },
        ], { temperature: 0.2, maxTokens: 4096 });
    }
    async analyzeCode(code, provider = 'openai', model = 'gpt-4o') {
        return await aiEngine.chat(provider, model, [
            { role: 'user', content: `Analyze this code for bugs, security issues, and improvements:\n\n\`\`\`\n${code}\n\`\`\`` },
        ], { temperature: 0.3, maxTokens: 4096 });
    }
    async writeContent(type, topic, details, provider = 'openai', model = 'gpt-4o-mini') {
        return await aiEngine.chat(provider, model, [
            { role: 'user', content: `Write a ${type} about: ${topic}${details ? `\n\nAdditional details: ${details}` : ''}` },
        ], { temperature: 0.8, maxTokens: 2048 });
    }
}
export const aiService = new AIService();
//# sourceMappingURL=AIService.js.map