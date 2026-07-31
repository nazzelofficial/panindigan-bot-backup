// @ts-nocheck
import { OpenAI } from 'openai';
export class OpenAIService {
    client = null;
    constructor() {
        if (process.env.OPENAI_API_KEY) {
            this.client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        }
    }
    isAvailable() { return this.client !== null; }
    async chat(messages, model = 'gpt-4o-mini', temperature = 0.8, maxTokens = 2048) {
        if (!this.client)
            throw new Error('OpenAI not configured.');
        const res = await this.client.chat.completions.create({ model, messages, temperature, max_tokens: maxTokens });
        return { content: res.choices[0]?.message?.content || '', model, tokens: res.usage?.total_tokens };
    }
    async generateImage(prompt, size = '1024x1024', quality = 'standard') {
        if (!this.client)
            throw new Error('OpenAI not configured.');
        const res = await this.client.images.generate({ model: 'dall-e-3', prompt, n: 1, size, quality, style: 'vivid' });
        return { url: res.data[0]?.url || '', revisedPrompt: res.data[0]?.revised_prompt || prompt };
    }
    async moderate(input) {
        if (!this.client)
            throw new Error('OpenAI not configured.');
        const res = await this.client.moderations.create({ input });
        return res.results[0];
    }
    async transcribe(audioBuffer, filename) {
        if (!this.client)
            throw new Error('OpenAI not configured.');
        const { Readable } = await import('stream');
        const stream = Readable.from(audioBuffer);
        stream.name = filename;
        const res = await this.client.audio.transcriptions.create({ file: stream, model: 'whisper-1' });
        return res.text;
    }
    getAvailableModels() {
        return ['gpt-4o', 'gpt-4o-mini', 'gpt-4.1', 'o3', 'o4-mini', 'dall-e-3'];
    }
}
export const openAIService = new OpenAIService();
//# sourceMappingURL=OpenAIService.js.map