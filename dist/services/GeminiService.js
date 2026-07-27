// @ts-nocheck
import { GoogleGenerativeAI } from '@google/generative-ai';
export class GeminiService {
    client = null;
    constructor() {
        if (process.env.GEMINI_API_KEY) {
            this.client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        }
    }
    isAvailable() { return this.client !== null; }
    async chat(prompt, model = 'gemini-2.5-flash', temperature = 0.8) {
        if (!this.client)
            throw new Error('Gemini not configured.');
        const genModel = this.client.getGenerativeModel({ model, generationConfig: { temperature } });
        const result = await genModel.generateContent(prompt);
        return { content: result.response.text(), model };
    }
    async chatWithHistory(history, userMessage, model = 'gemini-2.5-flash') {
        if (!this.client)
            throw new Error('Gemini not configured.');
        const genModel = this.client.getGenerativeModel({ model });
        const chat = genModel.startChat({ history });
        const result = await chat.sendMessage(userMessage);
        return { content: result.response.text(), model };
    }
    async analyzeImage(imageUrl, prompt, model = 'gemini-2.5-flash') {
        if (!this.client)
            throw new Error('Gemini not configured.');
        const res = await fetch(imageUrl);
        const buffer = Buffer.from(await res.arrayBuffer());
        const base64 = buffer.toString('base64');
        const contentType = res.headers.get('content-type') || 'image/jpeg';
        const genModel = this.client.getGenerativeModel({ model });
        const result = await genModel.generateContent([
            prompt,
            { inlineData: { mimeType: contentType, data: base64 } },
        ]);
        return { content: result.response.text(), model };
    }
    getAvailableModels() {
        return ['gemini-2.5-pro', 'gemini-2.5-flash'];
    }
}
export const geminiService = new GeminiService();
