// @ts-nocheck
import Groq from 'groq-sdk';
export class GroqService {
    client = null;
    constructor() {
        if (process.env.GROQ_API_KEY) {
            this.client = new Groq({ apiKey: process.env.GROQ_API_KEY });
        }
    }
    isAvailable() { return this.client !== null; }
    async chat(messages, model = 'llama-3.3-70b-versatile', temperature = 0.8, maxTokens = 2048) {
        if (!this.client)
            throw new Error('Groq not configured.');
        const res = await this.client.chat.completions.create({ model, messages, temperature, max_tokens: maxTokens });
        return {
            content: res.choices[0]?.message?.content || '',
            model,
            tokens: res.usage?.total_tokens,
            completionTime: res.usage?.completion_time,
        };
    }
    async fastChat(prompt, model = 'llama-3.3-70b-versatile') {
        return this.chat([{ role: 'user', content: prompt }], model, 0.7, 1024);
    }
    getAvailableModels() {
        return ['llama-3.3-70b-versatile', 'mixtral-8x7b-32768', 'gemma2-9b-it'];
    }
}
export const groqService = new GroqService();
//# sourceMappingURL=GroqService.js.map