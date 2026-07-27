// @ts-nocheck
import { OpenAI } from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';
import { getCollection } from '../database/mongodb/client.js';
import { aiMemoryCollectionName } from '../database/mongodb/collections/AiMemory.js';
import { loggers } from '../utils/Logger.js';
import config from '../../config.json' with { type: 'json' };
export class AIHandler {
    openai = null;
    anthropic = null;
    gemini = null;
    groq = null;
    constructor() {
        this.initializeProviders();
    }
    initializeProviders() {
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
    async getConversationMemory(userId, guildId) {
        try {
            const collection = getCollection(aiMemoryCollectionName);
            const doc = await collection.findOne({ userId, guildId });
            return doc?.messages || [];
        }
        catch (error) {
            loggers.ai.error('Error fetching conversation memory', { errorMessage: String(error) });
            return [];
        }
    }
    async saveConversationMemory(userId, guildId, messages, provider, model) {
        try {
            const collection = getCollection(aiMemoryCollectionName);
            await collection.updateOne({ userId, guildId }, {
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
            }, { upsert: true });
        }
        catch (error) {
            loggers.ai.error('Error saving conversation memory', { errorMessage: String(error) });
        }
    }
    async generateWithOpenAI(messages, model = config.ai.defaultModel) {
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
    async generateWithAnthropic(messages, model = 'claude-3-5-sonnet-20241022') {
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
                role: m.role,
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
    async generateWithGemini(messages, model = 'gemini-2.5-flash') {
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
    async generateWithGroq(messages, model = 'llama-3.3-70b-versatile') {
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
    async generateResponse(userId, guildId, userMessage, premiumTier = 'free') {
        const memoryLimit = config.ai.conversationMemoryMessages[premiumTier] || config.ai.conversationMemoryMessages.free;
        let messages = await this.getConversationMemory(userId, guildId);
        const systemPrompt = config.ai.systemPrompt;
        const newMessage = { role: 'user', content: userMessage, timestamp: new Date() };
        messages.push(newMessage);
        if (memoryLimit !== -1 && messages.length > memoryLimit) {
            messages = messages.slice(-memoryLimit);
        }
        const messagesForAI = [
            { role: 'system', content: systemPrompt },
            ...messages.map((m) => ({ role: m.role, content: m.content })),
        ];
        const providers = config.ai.providers;
        let response;
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
        }
        catch (error) {
            loggers.ai.warn(`Primary AI provider ${providers.primary} failed — trying fallback`, { errorMessage: String(error) });
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
                }
                catch (fallbackError) {
                    loggers.ai.error(`Fallback AI provider ${fallbackProvider} failed`, { errorMessage: String(fallbackError) });
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
    async generateImage(prompt, premiumTier = 'free') {
        if (!this.openai) {
            throw new Error('OpenAI provider not initialized for image generation');
        }
        const dailyLimit = config.ai.dailyImageLimit[premiumTier] || config.ai.dailyImageLimit.free;
        if (dailyLimit === 0) {
            throw new Error('Image generation not available for your tier');
        }
        const response = await this.openai.images.generate({
            model: config.ai.imageModel,
            prompt,
            size: config.ai.imageSize,
            n: 1,
        });
        return response.data[0]?.url || '';
    }
    async clearConversationMemory(userId, guildId) {
        try {
            const collection = getCollection(aiMemoryCollectionName);
            await collection.deleteOne({ userId, guildId });
        }
        catch (error) {
            loggers.ai.error('Error clearing conversation memory', { errorMessage: String(error) });
        }
    }
    /**
     * Generate a one-shot task response with a custom system prompt (no memory saved).
     */
    async generateTaskResponse(userMessage, taskSystemPrompt, providerOverride) {
        const messagesForAI = [
            { role: 'system', content: taskSystemPrompt },
            { role: 'user', content: userMessage },
        ];
        const provider = providerOverride || config.ai.providers.primary;
        let response;
        const tryProviders = [provider, ...config.ai.providers.fallback.filter((p) => p !== provider)];
        for (const p of tryProviders) {
            try {
                switch (p) {
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
                if (response)
                    break;
            }
            catch (err) {
                loggers.ai.error(`AI provider ${p} failed for task request`, { errorMessage: String(err) });
            }
        }
        if (!response)
            throw new Error('All AI providers failed.');
        return response;
    }
    /**
     * Generate a response using a specific provider (for provider-specific commands).
     */
    async generateWithProvider(userId, guildId, userMessage, provider, premiumTier = 'free') {
        const memoryLimit = config.ai.conversationMemoryMessages[premiumTier] || config.ai.conversationMemoryMessages.free;
        let messages = await this.getConversationMemory(userId, guildId);
        messages.push({ role: 'user', content: userMessage, timestamp: new Date() });
        if (memoryLimit !== -1 && messages.length > memoryLimit) {
            messages = messages.slice(-memoryLimit);
        }
        const messagesForAI = [
            { role: 'system', content: config.ai.systemPrompt },
            ...messages.map((m) => ({ role: m.role, content: m.content })),
        ];
        let response;
        try {
            switch (provider) {
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
                default: response = await this.generateWithOpenAI(messagesForAI);
            }
        }
        catch (err) {
            // Fallback to primary
            response = await this.generateResponse(userId, guildId, userMessage, premiumTier);
            return response;
        }
        messages.push({ role: 'assistant', content: response.content, timestamp: new Date() });
        await this.saveConversationMemory(userId, guildId, messages, response.provider, response.model);
        return response;
    }
}
