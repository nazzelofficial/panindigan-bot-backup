// @ts-nocheck
import Groq from 'groq-sdk';

export class GroqService {
  private client: Groq | null = null;

  constructor() {
    if (process.env.GROQ_API_KEY) {
      this.client = new Groq({ apiKey: process.env.GROQ_API_KEY });
    }
  }

  public isAvailable(): boolean { return this.client !== null; }

  public async chat(messages: { role: 'user' | 'assistant' | 'system'; content: string }[], model = 'llama-3.3-70b-versatile', temperature = 0.8, maxTokens = 2048) {
    if (!this.client) throw new Error('Groq not configured.');
    const res = await this.client.chat.completions.create({ model, messages, temperature, max_tokens: maxTokens });
    return {
      content: res.choices[0]?.message?.content || '',
      model,
      tokens: res.usage?.total_tokens,
      completionTime: res.usage?.completion_time,
    };
  }

  public async fastChat(prompt: string, model = 'llama-3.3-70b-versatile') {
    return this.chat([{ role: 'user', content: prompt }], model, 0.7, 1024);
  }

  public getAvailableModels() {
    return ['llama-3.3-70b-versatile', 'mixtral-8x7b-32768', 'gemma2-9b-it'];
  }
}

export const groqService = new GroqService();
