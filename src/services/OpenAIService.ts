// @ts-nocheck
import { OpenAI } from 'openai';

export class OpenAIService {
  private client: OpenAI | null = null;

  constructor() {
    if (process.env.OPENAI_API_KEY) {
      this.client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
  }

  public isAvailable(): boolean { return this.client !== null; }

  public async chat(messages: { role: 'user' | 'assistant' | 'system'; content: string }[], model = 'gpt-4o-mini', temperature = 0.8, maxTokens = 2048) {
    if (!this.client) throw new Error('OpenAI not configured.');
    const res = await this.client.chat.completions.create({ model, messages, temperature, max_tokens: maxTokens });
    return { content: res.choices[0]?.message?.content || '', model, tokens: res.usage?.total_tokens };
  }

  public async generateImage(prompt: string, size: '256x256' | '512x512' | '1024x1024' | '1792x1024' | '1024x1792' = '1024x1024', quality: 'standard' | 'hd' = 'standard') {
    if (!this.client) throw new Error('OpenAI not configured.');
    const res = await this.client.images.generate({ model: 'dall-e-3', prompt, n: 1, size, quality, style: 'vivid' });
    return { url: res.data[0]?.url || '', revisedPrompt: res.data[0]?.revised_prompt || prompt };
  }

  public async moderate(input: string) {
    if (!this.client) throw new Error('OpenAI not configured.');
    const res = await this.client.moderations.create({ input });
    return res.results[0];
  }

  public async transcribe(audioBuffer: Buffer, filename: string) {
    if (!this.client) throw new Error('OpenAI not configured.');
    const { Readable } = await import('stream');
    const stream = Readable.from(audioBuffer) as any;
    stream.name = filename;
    const res = await this.client.audio.transcriptions.create({ file: stream, model: 'whisper-1' });
    return res.text;
  }

  public getAvailableModels() {
    return ['gpt-4o', 'gpt-4o-mini', 'gpt-4.1', 'o3', 'o4-mini', 'dall-e-3'];
  }
}

export const openAIService = new OpenAIService();
