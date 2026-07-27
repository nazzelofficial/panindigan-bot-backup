// @ts-nocheck
import Anthropic from '@anthropic-ai/sdk';
export class AnthropicService {
    client = null;
    constructor() {
        if (process.env.ANTHROPIC_API_KEY) {
            this.client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
        }
    }
    isAvailable() { return this.client !== null; }
    async chat(userMessage, systemPrompt, model = 'claude-sonnet-4-5', maxTokens = 2048) {
        if (!this.client)
            throw new Error('Anthropic not configured.');
        const res = await this.client.messages.create({
            model,
            max_tokens: maxTokens,
            system: systemPrompt,
            messages: [{ role: 'user', content: userMessage }],
        });
        return {
            content: res.content[0]?.type === 'text' ? res.content[0].text : '',
            model,
            inputTokens: res.usage.input_tokens,
            outputTokens: res.usage.output_tokens,
        };
    }
    async chatWithHistory(messages, systemPrompt, model = 'claude-sonnet-4-5', maxTokens = 4096) {
        if (!this.client)
            throw new Error('Anthropic not configured.');
        const res = await this.client.messages.create({ model, max_tokens: maxTokens, system: systemPrompt, messages });
        return {
            content: res.content[0]?.type === 'text' ? res.content[0].text : '',
            model,
            tokens: res.usage.input_tokens + res.usage.output_tokens,
        };
    }
    getAvailableModels() {
        return ['claude-opus-4-5', 'claude-sonnet-4-5', 'claude-haiku-3-5'];
    }
}
export const anthropicService = new AnthropicService();
