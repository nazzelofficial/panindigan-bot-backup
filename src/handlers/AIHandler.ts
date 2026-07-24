import { OpenAI } from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';
import { getCollection } from '../database/mongodb/client';
import { aiMemoryCollectionName } from '../database/mongodb/collections/AiMemory';
import config from '../../config.json';

export interface AIResponse {
  content: string;
  provider: string;
  model: string;
  tokens?: number;
}

export class AIHandler {
  private openai: OpenAI | null = null;
  private anthropic: Anthropic | null = null;
  private gemini: GoogleGenerativeAI | null = null;
  private groq: Groq | null = null;

  constructor() {
    this.initializeProviders();
  }

  private initializeProviders(): void {
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
  }

  private async getConversationMemory(userId: string, guildId: string): Promise<any[]> {
    try {
      const collection = getCollection(aiMemoryCollectionName);
      const doc = await collection.findOne({ userId, guildId });
      return doc?.messages || [];
    } catch (error) {
      console.error('Error fetching conversation memory:', error);
      return [];
    }
  }

  private async saveConversationMemory(
    userId: string,
    guildId: string,
    messages: any[],
    provider: string,
    model: string
  ): Promise<void> {
    try {
      const collection = getCollection(aiMemoryCollectionName);
      await collection.updateOne(
        { userId, guildId },
        {
          $set: {
            messages,
            provider,
            model,
            updatedAt: new Date(),
          },
          $setOnInsert: {
            userId,
            guildId,
            createdAt: new Date(),
          },
        },
        { upsert: true }
      );
    } catch (error) {
      console.error('Error saving conversation memory:', error);
    }
  }

  private async generateWithOpenAI(
    messages: any[],
    model: string = config.ai.defaultModel
  ): Promise<AIResponse> {
    if (!this.openai) {
      throw new Error('OpenAI provider not initialized');
    }

    const completion = await this.openai.chat.completions.create({
      model,
      messages,
      temperature: config.ai.temperature,
      max_tokens: config.ai.maxTokens.default,
    });

    return {
      content: completion.choices[0]?.message?.content || 'No response',
      provider: 'openai',
      model,
      tokens: completion.usage?.total_tokens,
    };
  }

  private async generateWithAnthropic(
    messages: any[],
    model: string = 'claude-3-5-sonnet-20241022'
  ): Promise<AIResponse> {
    if (!this.anthropic) {
      throw new Error('Anthropic provider not initialized');
    }

    const systemMessage = messages.find((m) => m.role === 'system');
    const userMessages = messages.filter((m) => m.role !== 'system');

    const message = await this.anthropic.messages.create({
      model,
      max_tokens: config.ai.maxTokens.default,
      system: systemMessage?.content,
      messages: userMessages.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    });

    return {
      content: message.content[0]?.type === 'text' ? message.content[0].text : 'No response',
      provider: 'anthropic',
      model,
      tokens: message.usage?.input_tokens + message.usage?.output_tokens,
    };
  }

  private async generateWithGemini(
    messages: any[],
    model: string = 'gemini-2.5-flash'
  ): Promise<AIResponse> {
    if (!this.gemini) {
      throw new Error('Gemini provider not initialized');
    }

    const modelInstance = this.gemini.getGenerativeModel({ model });
    const chatHistory = messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

    const result = await modelInstance.generateContent(chatHistory);
    const response = await result.response;
    const text = response.text();

    return {
      content: text,
      provider: 'gemini',
      model,
    };
  }

  private async generateWithGroq(
    messages: any[],
    model: string = 'llama-3.3-70b-versatile'
  ): Promise<AIResponse> {
    if (!this.groq) {
      throw new Error('Groq provider not initialized');
    }

    const completion = await this.groq.chat.completions.create({
      model,
      messages,
      temperature: config.ai.temperature,
      max_tokens: config.ai.maxTokens.default,
    });

    return {
      content: completion.choices[0]?.message?.content || 'No response',
      provider: 'groq',
      model,
      tokens: completion.usage?.total_tokens,
    };
  }

  public async generateResponse(
    userId: string,
    guildId: string,
    userMessage: string,
    premiumTier: string = 'free'
  ): Promise<AIResponse> {
    const memoryLimit = config.ai.conversationMemoryMessages[premiumTier as keyof typeof config.ai.conversationMemoryMessages] || config.ai.conversationMemoryMessages.free;
    
    let messages = await this.getConversationMemory(userId, guildId);
    
    const systemPrompt = config.ai.systemPrompt;
    const newMessage = { role: 'user' as const, content: userMessage, timestamp: new Date() };
    
    messages.push(newMessage);
    
    if (memoryLimit !== -1 && messages.length > memoryLimit) {
      messages = messages.slice(-memoryLimit);
    }

    const messagesForAI = [
      { role: 'system' as const, content: systemPrompt },
      ...messages.map((m) => ({ role: m.role, content: m.content })),
    ];

    const providers = config.ai.providers;
    let response: AIResponse;

    try {
      switch (providers.primary) {
        case 'openai':
          response = await this.generateWithOpenAI(messagesForAI);
          break;
        case 'anthropic':
          response = await this.generateWithAnthropic(messagesForAI);
          break;
        case 'gemini':
          response = await this.generateWithGemini(messagesForAI);
          break;
        case 'groq':
          response = await this.generateWithGroq(messagesForAI);
          break;
        default:
          response = await this.generateWithOpenAI(messagesForAI);
      }
    } catch (error) {
      console.error(`Primary provider ${providers.primary} failed, trying fallback:`, error);
      
      for (const fallbackProvider of providers.fallback) {
        try {
          switch (fallbackProvider) {
            case 'openai':
              response = await this.generateWithOpenAI(messagesForAI);
              break;
            case 'anthropic':
              response = await this.generateWithAnthropic(messagesForAI);
              break;
            case 'gemini':
              response = await this.generateWithGemini(messagesForAI);
              break;
            case 'groq':
              response = await this.generateWithGroq(messagesForAI);
              break;
          }
          break;
        } catch (fallbackError) {
          console.error(`Fallback provider ${fallbackProvider} also failed:`, fallbackError);
        }
      }

      if (!response) {
        throw new Error('All AI providers failed');
      }
    }

    messages.push({
      role: 'assistant',
      content: response.content,
      timestamp: new Date(),
    });

    await this.saveConversationMemory(userId, guildId, messages, response.provider, response.model);

    return response;
  }

  public async generateImage(prompt: string, premiumTier: string = 'free'): Promise<string> {
    if (!this.openai) {
      throw new Error('OpenAI provider not initialized for image generation');
    }

    const dailyLimit = config.ai.dailyImageLimit[premiumTier as keyof typeof config.ai.dailyImageLimit] || config.ai.dailyImageLimit.free;
    
    if (dailyLimit === 0) {
      throw new Error('Image generation not available for your tier');
    }

    const response = await this.openai.images.generate({
      model: config.ai.imageModel,
      prompt,
      size: config.ai.imageSize as any,
      n: 1,
    });

    return response.data[0]?.url || '';
  }

  public async clearConversationMemory(userId: string, guildId: string): Promise<void> {
    try {
      const collection = getCollection(aiMemoryCollectionName);
      await collection.deleteOne({ userId, guildId });
    } catch (error) {
      console.error('Error clearing conversation memory:', error);
    }
  }
}
