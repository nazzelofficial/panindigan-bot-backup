import { OpenAI } from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';
import { getCollection } from '../database/mongodb/client';

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIResponse {
  content: string;
  provider: string;
  model: string;
  tokens?: number;
  imageUrl?: string;
}

export interface AIImageOptions {
  size?: '256x256' | '512x512' | '1024x1024' | '1792x1024' | '1024x1792';
  quality?: 'standard' | 'hd';
  style?: 'vivid' | 'natural';
}

export interface AIChatOptions {
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

const MEMORY_COLLECTION = 'ai_conversations';

export class AIEngine {
  private openai: OpenAI | null = null;
  private anthropic: Anthropic | null = null;
  private gemini: GoogleGenerativeAI | null = null;
  private groq: Groq | null = null;
  private deepseek: OpenAI | null = null;
  private grok: OpenAI | null = null;
  private mistral: OpenAI | null = null;

  private static instance: AIEngine;

  public static getInstance(): AIEngine {
    if (!AIEngine.instance) {
      AIEngine.instance = new AIEngine();
      AIEngine.instance.initializeProviders();
    }
    return AIEngine.instance;
  }

  public initializeProviders(): void {
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
    if (process.env.ANTHROPIC_API_KEY) {
      this.anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    }
    if (process.env.GEMINI_API_KEY) {
      this.gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    }
    if (process.env.GROQ_API_KEY) {
      this.groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    }
    if (process.env.DEEPSEEK_API_KEY) {
      this.deepseek = new OpenAI({ apiKey: process.env.DEEPSEEK_API_KEY, baseURL: 'https://api.deepseek.com' });
    }
    if (process.env.XAI_API_KEY) {
      this.grok = new OpenAI({ apiKey: process.env.XAI_API_KEY, baseURL: 'https://api.x.ai/v1' });
    }
    if (process.env.MISTRAL_API_KEY) {
      this.mistral = new OpenAI({ apiKey: process.env.MISTRAL_API_KEY, baseURL: 'https://api.mistral.ai/v1' });
    }
  }

  public getAvailableProviders(): string[] {
    const providers: string[] = [];
    if (this.openai) providers.push('openai');
    if (this.anthropic) providers.push('anthropic');
    if (this.gemini) providers.push('gemini');
    if (this.groq) providers.push('groq');
    if (this.deepseek) providers.push('deepseek');
    if (this.grok) providers.push('grok');
    if (this.mistral) providers.push('mistral');
    return providers;
  }

  public async chat(
    provider: string,
    model: string,
    messages: AIMessage[],
    options: AIChatOptions = {}
  ): Promise<AIResponse> {
    const { systemPrompt, temperature = 0.8, maxTokens = 2048 } = options;

    const systemMessage: AIMessage[] = systemPrompt
      ? [{ role: 'system', content: systemPrompt }]
      : [];
    const fullMessages = [...systemMessage, ...messages];

    try {
      switch (provider.toLowerCase()) {
        case 'openai':
          return await this.chatOpenAI(model, fullMessages, temperature, maxTokens);
        case 'anthropic':
          return await this.chatAnthropic(model, messages, systemPrompt, temperature, maxTokens);
        case 'gemini':
          return await this.chatGemini(model, fullMessages, temperature, maxTokens);
        case 'groq':
          return await this.chatGroq(model, fullMessages, temperature, maxTokens);
        case 'deepseek':
          return await this.chatOpenAICompat(this.deepseek!, model, fullMessages, temperature, maxTokens, 'deepseek');
        case 'grok':
          return await this.chatOpenAICompat(this.grok!, model, fullMessages, temperature, maxTokens, 'grok');
        case 'mistral':
          return await this.chatOpenAICompat(this.mistral!, model, fullMessages, temperature, maxTokens, 'mistral');
        default:
          throw new Error(`Unknown provider: ${provider}`);
      }
    } catch (error) {
      // Failover chain
      return await this.failover(messages, options, [provider]);
    }
  }

  private async chatOpenAI(model: string, messages: AIMessage[], temperature: number, maxTokens: number): Promise<AIResponse> {
    if (!this.openai) throw new Error('OpenAI not initialized');
    const response = await this.openai.chat.completions.create({
      model,
      messages: messages as any,
      temperature,
      max_tokens: maxTokens,
    });
    return {
      content: response.choices[0]?.message?.content || '',
      provider: 'openai',
      model,
      tokens: response.usage?.total_tokens,
    };
  }

  private async chatAnthropic(model: string, messages: AIMessage[], systemPrompt: string | undefined, temperature: number, maxTokens: number): Promise<AIResponse> {
    if (!this.anthropic) throw new Error('Anthropic not initialized');
    const response = await this.anthropic.messages.create({
      model,
      max_tokens: maxTokens,
      temperature,
      system: systemPrompt,
      messages: messages.filter(m => m.role !== 'system').map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    });
    const content = response.content[0]?.type === 'text' ? response.content[0].text : '';
    return {
      content,
      provider: 'anthropic',
      model,
      tokens: response.usage?.input_tokens + response.usage?.output_tokens,
    };
  }

  private async chatGemini(model: string, messages: AIMessage[], temperature: number, maxTokens: number): Promise<AIResponse> {
    if (!this.gemini) throw new Error('Gemini not initialized');
    const genModel = this.gemini.getGenerativeModel({ model, generationConfig: { temperature, maxOutputTokens: maxTokens } });
    const history = messages.slice(0, -1).filter(m => m.role !== 'system').map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));
    const chat = genModel.startChat({ history });
    const lastMessage = messages[messages.length - 1];
    const result = await chat.sendMessage(lastMessage?.content || '');
    return {
      content: result.response.text(),
      provider: 'gemini',
      model,
    };
  }

  private async chatGroq(model: string, messages: AIMessage[], temperature: number, maxTokens: number): Promise<AIResponse> {
    if (!this.groq) throw new Error('Groq not initialized');
    const response = await this.groq.chat.completions.create({
      model,
      messages: messages as any,
      temperature,
      max_tokens: maxTokens,
    });
    return {
      content: response.choices[0]?.message?.content || '',
      provider: 'groq',
      model,
      tokens: response.usage?.total_tokens,
    };
  }

  private async chatOpenAICompat(client: OpenAI, model: string, messages: AIMessage[], temperature: number, maxTokens: number, provider: string): Promise<AIResponse> {
    if (!client) throw new Error(`${provider} not initialized`);
    const response = await client.chat.completions.create({
      model,
      messages: messages as any,
      temperature,
      max_tokens: maxTokens,
    });
    return {
      content: response.choices[0]?.message?.content || '',
      provider,
      model,
      tokens: (response.usage as any)?.total_tokens,
    };
  }

  private async failover(messages: AIMessage[], options: AIChatOptions, tried: string[]): Promise<AIResponse> {
    const fallbackChain = ['groq', 'openai', 'gemini', 'anthropic', 'deepseek', 'mistral'];
    const defaultModels: Record<string, string> = {
      groq: 'llama-3.3-70b-versatile',
      openai: 'gpt-4o-mini',
      gemini: 'gemini-2.5-flash',
      anthropic: 'claude-haiku-3-5',
      deepseek: 'deepseek-chat',
      mistral: 'mistral-small-latest',
    };

    for (const provider of fallbackChain) {
      if (tried.includes(provider)) continue;
      if (!this.getAvailableProviders().includes(provider)) continue;
      tried.push(provider);
      try {
        return await this.chat(provider, defaultModels[provider], messages, options);
      } catch { continue; }
    }
    throw new Error('All AI providers failed. Please configure at least one AI API key.');
  }

  public async generateImage(prompt: string, options: AIImageOptions = {}): Promise<AIResponse> {
    if (!this.openai) throw new Error('OpenAI not initialized — OPENAI_API_KEY required for image generation');
    const { size = '1024x1024', quality = 'standard', style = 'vivid' } = options;
    const response = await this.openai.images.generate({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size,
      quality,
      style,
    });
    return {
      content: response.data[0]?.revised_prompt || prompt,
      provider: 'openai',
      model: 'dall-e-3',
      imageUrl: response.data[0]?.url,
    };
  }

  public async getConversationHistory(userId: string, guildId: string, limit: number = 20): Promise<AIMessage[]> {
    try {
      const collection = getCollection(MEMORY_COLLECTION);
      const doc = await collection.findOne({ userId, guildId });
      if (!doc?.messages) return [];
      return (doc.messages as AIMessage[]).slice(-limit);
    } catch {
      return [];
    }
  }

  public async saveMessage(userId: string, guildId: string, role: 'user' | 'assistant', content: string): Promise<void> {
    try {
      const collection = getCollection(MEMORY_COLLECTION);
      await collection.updateOne(
        { userId, guildId },
        {
          $push: { messages: { $each: [{ role, content, timestamp: new Date() }], $slice: -100 } as any },
          $setOnInsert: { userId, guildId, createdAt: new Date() },
          $set: { updatedAt: new Date() },
        },
        { upsert: true }
      );
    } catch (err) {
      console.error('Failed to save AI message:', err);
    }
  }

  public async clearHistory(userId: string, guildId: string): Promise<void> {
    try {
      const collection = getCollection(MEMORY_COLLECTION);
      await collection.updateOne(
        { userId, guildId },
        { $set: { messages: [], updatedAt: new Date() } },
        { upsert: true }
      );
    } catch (err) {
      console.error('Failed to clear AI history:', err);
    }
  }

  public async getUsageStats(guildId: string): Promise<{ totalRequests: number; byProvider: Record<string, number> }> {
    try {
      const collection = getCollection('ai_requests');
      const docs = await collection.find({ guildId }).toArray();
      const byProvider: Record<string, number> = {};
      for (const doc of docs) {
        const p = doc.provider as string;
        byProvider[p] = (byProvider[p] || 0) + 1;
      }
      return { totalRequests: docs.length, byProvider };
    } catch {
      return { totalRequests: 0, byProvider: {} };
    }
  }

  public async logRequest(userId: string, guildId: string, provider: string, model: string, tokens?: number): Promise<void> {
    try {
      const collection = getCollection('ai_requests');
      await collection.insertOne({ userId, guildId, provider, model, tokens: tokens || 0, timestamp: new Date() });
    } catch { /* non-critical */ }
  }
}

export const aiEngine = AIEngine.getInstance();
