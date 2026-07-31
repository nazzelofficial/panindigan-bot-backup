// @ts-nocheck
import { OpenAI } from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';
import { getCollection } from '../database/mongodb/client.js';
import { loggers } from '../utils/Logger.js';
const MEMORY_COLLECTION = 'ai_conversations';
export class AIEngine {
    openai = null;
    anthropic = null;
    gemini = null;
    groq = null;
    deepseek = null;
    grok = null;
    mistral = null;
    static instance;
    static getInstance() {
        if (!AIEngine.instance) {
            AIEngine.instance = new AIEngine();
            AIEngine.instance.initializeProviders();
        }
        return AIEngine.instance;
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
    getAvailableProviders() {
        const providers = [];
        if (this.openai)
            providers.push('openai');
        if (this.anthropic)
            providers.push('anthropic');
        if (this.gemini)
            providers.push('gemini');
        if (this.groq)
            providers.push('groq');
        if (this.deepseek)
            providers.push('deepseek');
        if (this.grok)
            providers.push('grok');
        if (this.mistral)
            providers.push('mistral');
        return providers;
    }
    async chat(provider, model, messages, options = {}) {
        const { systemPrompt, temperature = 0.8, maxTokens = 2048 } = options;
        const systemMessage = systemPrompt
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
                    return await this.chatOpenAICompat(this.deepseek, model, fullMessages, temperature, maxTokens, 'deepseek');
                case 'grok':
                    return await this.chatOpenAICompat(this.grok, model, fullMessages, temperature, maxTokens, 'grok');
                case 'mistral':
                    return await this.chatOpenAICompat(this.mistral, model, fullMessages, temperature, maxTokens, 'mistral');
                default:
                    throw new Error(`Unknown provider: ${provider}`);
            }
        }
        catch (error) {
            // Failover chain
            return await this.failover(messages, options, [provider]);
        }
    }
    async chatOpenAI(model, messages, temperature, maxTokens) {
        if (!this.openai)
            throw new Error('OpenAI not initialized');
        const response = await this.openai.chat.completions.create({
            model,
            messages: messages,
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
    async chatAnthropic(model, messages, systemPrompt, temperature, maxTokens) {
        if (!this.anthropic)
            throw new Error('Anthropic not initialized');
        const response = await this.anthropic.messages.create({
            model,
            max_tokens: maxTokens,
            temperature,
            system: systemPrompt,
            messages: messages.filter(m => m.role !== 'system').map(m => ({
                role: m.role,
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
    async chatGemini(model, messages, temperature, maxTokens) {
        if (!this.gemini)
            throw new Error('Gemini not initialized');
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
    async chatGroq(model, messages, temperature, maxTokens) {
        if (!this.groq)
            throw new Error('Groq not initialized');
        const response = await this.groq.chat.completions.create({
            model,
            messages: messages,
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
    async chatOpenAICompat(client, model, messages, temperature, maxTokens, provider) {
        if (!client)
            throw new Error(`${provider} not initialized`);
        const response = await client.chat.completions.create({
            model,
            messages: messages,
            temperature,
            max_tokens: maxTokens,
        });
        return {
            content: response.choices[0]?.message?.content || '',
            provider,
            model,
            tokens: response.usage?.total_tokens,
        };
    }
    async failover(messages, options, tried) {
        const fallbackChain = ['groq', 'openai', 'gemini', 'anthropic', 'deepseek', 'mistral'];
        const defaultModels = {
            groq: 'llama-3.3-70b-versatile',
            openai: 'gpt-4o-mini',
            gemini: 'gemini-2.5-flash',
            anthropic: 'claude-haiku-3-5',
            deepseek: 'deepseek-chat',
            mistral: 'mistral-small-latest',
        };
        for (const provider of fallbackChain) {
            if (tried.includes(provider))
                continue;
            if (!this.getAvailableProviders().includes(provider))
                continue;
            tried.push(provider);
            try {
                return await this.chat(provider, defaultModels[provider], messages, options);
            }
            catch {
                continue;
            }
        }
        throw new Error('All AI providers failed. Please configure at least one AI API key.');
    }
    async generateImage(prompt, options = {}) {
        if (!this.openai)
            throw new Error('OpenAI not initialized — OPENAI_API_KEY required for image generation');
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
    async getConversationHistory(userId, guildId, limit = 20) {
        try {
            const collection = getCollection(MEMORY_COLLECTION);
            const doc = await collection.findOne({ userId, guildId });
            if (!doc?.messages)
                return [];
            return doc.messages.slice(-limit);
        }
        catch {
            return [];
        }
    }
    async saveMessage(userId, guildId, role, content) {
        try {
            const collection = getCollection(MEMORY_COLLECTION);
            await collection.updateOne({ userId, guildId }, {
                $push: { messages: { $each: [{ role, content, timestamp: new Date() }], $slice: -100 } },
                $setOnInsert: { userId, guildId, createdAt: new Date() },
                $set: { updatedAt: new Date() },
            }, { upsert: true });
        }
        catch (err) {
            loggers.ai.error('Failed to save AI message', { userId, guildId, errorMessage: String(err) });
        }
    }
    async clearHistory(userId, guildId) {
        try {
            const collection = getCollection(MEMORY_COLLECTION);
            await collection.updateOne({ userId, guildId }, { $set: { messages: [], updatedAt: new Date() } }, { upsert: true });
        }
        catch (err) {
            loggers.ai.error('Failed to clear AI history', { userId, guildId, errorMessage: String(err) });
        }
    }
    async getUsageStats(guildId) {
        try {
            const collection = getCollection('ai_requests');
            const docs = await collection.find({ guildId }).toArray();
            const byProvider = {};
            for (const doc of docs) {
                const p = doc.provider;
                byProvider[p] = (byProvider[p] || 0) + 1;
            }
            return { totalRequests: docs.length, byProvider };
        }
        catch {
            return { totalRequests: 0, byProvider: {} };
        }
    }
    async logRequest(userId, guildId, provider, model, tokens) {
        try {
            const collection = getCollection('ai_requests');
            await collection.insertOne({ userId, guildId, provider, model, tokens: tokens || 0, timestamp: new Date() });
        }
        catch { /* non-critical */ }
    }
}
export const aiEngine = AIEngine.getInstance();
//# sourceMappingURL=AIEngine.js.map