import { aiEngine, AIMessage, AIResponse, AIChatOptions, AIImageOptions } from '../structures/AIEngine';

export class AIService {
  public async ask(
    prompt: string,
    userId: string,
    guildId: string,
    provider = 'openai',
    model = 'gpt-4o-mini',
    options: AIChatOptions = {}
  ): Promise<AIResponse> {
    const history = await aiEngine.getConversationHistory(userId, guildId, 5);
    const messages: AIMessage[] = [
      ...history,
      { role: 'user', content: prompt },
    ];

    const response = await aiEngine.chat(provider, model, messages, {
      systemPrompt: options.systemPrompt || 'Ikaw si Panindigan, isang matulungin at masayang Discord bot na nagsasalita ng Filipino at English.',
      ...options,
    });

    await aiEngine.logRequest(userId, guildId, response.provider, response.model, response.tokens);
    return response;
  }

  public async chat(
    message: string,
    userId: string,
    guildId: string,
    provider = 'openai',
    model = 'gpt-4o-mini',
    systemPrompt?: string
  ): Promise<AIResponse> {
    const history = await aiEngine.getConversationHistory(userId, guildId, 20);
    const messages: AIMessage[] = [
      ...history,
      { role: 'user', content: message },
    ];

    const response = await aiEngine.chat(provider, model, messages, {
      systemPrompt: systemPrompt || 'Ikaw si Panindigan, isang matulungin at masayang Discord bot na nagsasalita ng Filipino at English. Mag-usap ng natural at friendly.',
    });

    // Save to memory
    await aiEngine.saveMessage(userId, guildId, 'user', message);
    await aiEngine.saveMessage(userId, guildId, 'assistant', response.content);
    await aiEngine.logRequest(userId, guildId, response.provider, response.model, response.tokens);

    return response;
  }

  public async generateImage(prompt: string, userId: string, guildId: string, options: AIImageOptions = {}): Promise<AIResponse> {
    const response = await aiEngine.generateImage(prompt, options);
    await aiEngine.logRequest(userId, guildId, 'openai', 'dall-e-3');
    return response;
  }

  public async clearMemory(userId: string, guildId: string): Promise<void> {
    await aiEngine.clearHistory(userId, guildId);
  }

  public getAvailableProviders(): string[] {
    return aiEngine.getAvailableProviders();
  }

  public async translate(text: string, targetLang: string, provider = 'openai', model = 'gpt-4o-mini'): Promise<AIResponse> {
    return await aiEngine.chat(provider, model, [
      { role: 'user', content: `Translate the following text to ${targetLang}. Only return the translation, no explanations:\n\n${text}` },
    ], { temperature: 0.3 });
  }

  public async summarize(text: string, provider = 'openai', model = 'gpt-4o-mini'): Promise<AIResponse> {
    return await aiEngine.chat(provider, model, [
      { role: 'user', content: `Please provide a concise, well-structured summary of the following text:\n\n${text}` },
    ], { temperature: 0.5 });
  }

  public async generateCode(language: string, task: string, provider = 'openai', model = 'gpt-4o'): Promise<AIResponse> {
    return await aiEngine.chat(provider, model, [
      { role: 'user', content: `Write ${language} code for the following task. Include comments and explanation:\n\n${task}` },
    ], { temperature: 0.2, maxTokens: 4096 });
  }

  public async debugCode(code: string, error: string, provider = 'openai', model = 'gpt-4o'): Promise<AIResponse> {
    return await aiEngine.chat(provider, model, [
      { role: 'user', content: `Debug this code and fix the error:\n\nCode:\n\`\`\`\n${code}\n\`\`\`\n\nError: ${error}` },
    ], { temperature: 0.2, maxTokens: 4096 });
  }

  public async analyzeCode(code: string, provider = 'openai', model = 'gpt-4o'): Promise<AIResponse> {
    return await aiEngine.chat(provider, model, [
      { role: 'user', content: `Analyze this code for bugs, security issues, and improvements:\n\n\`\`\`\n${code}\n\`\`\`` },
    ], { temperature: 0.3, maxTokens: 4096 });
  }

  public async writeContent(type: string, topic: string, details?: string, provider = 'openai', model = 'gpt-4o-mini'): Promise<AIResponse> {
    return await aiEngine.chat(provider, model, [
      { role: 'user', content: `Write a ${type} about: ${topic}${details ? `\n\nAdditional details: ${details}` : ''}` },
    ], { temperature: 0.8, maxTokens: 2048 });
  }
}

export const aiService = new AIService();
