import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';
import { getRedisClient } from '../../database/redis/client';

const PROVIDERS = ['openai', 'anthropic', 'google', 'groq', 'auto'] as const;

export class AiProviderCommand extends BaseCommand {
  constructor() {
    super({
      name: 'aiprovider',
      description: 'Switch AI provider for your session (Gold+)',
      category: 'ai',
      premiumTier: 'gold',
      cooldown: 5,
      ownerOnly: false,
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['setprovider', 'provider'],
      examples: ['/aiprovider openai', 'p!aiprovider anthropic'],
    } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addStringOption(o =>
        o.setName('provider')
          .setDescription('AI provider to use')
          .setRequired(true)
          .addChoices(
            { name: '🤖 OpenAI (GPT)', value: 'openai' },
            { name: '🧠 Anthropic (Claude)', value: 'anthropic' },
            { name: '✨ Google (Gemini)', value: 'google' },
            { name: '⚡ Groq (Fast)', value: 'groq' },
            { name: '🔄 Auto (Best Available)', value: 'auto' },
          )
      )
      .setDMPermission(true) as SlashCommandBuilder;
  }

  private getProviderInfo(provider: string): { emoji: string; description: string; models: string } {
    const info: Record<string, { emoji: string; description: string; models: string }> = {
      openai: { emoji: '🤖', description: 'OpenAI GPT models — industry standard', models: 'GPT-4o, GPT-4o-mini, GPT-3.5-turbo' },
      anthropic: { emoji: '🧠', description: 'Anthropic Claude — great for long context & safety', models: 'Claude 3.5 Sonnet, Haiku, Opus' },
      google: { emoji: '✨', description: 'Google Gemini — multimodal & powerful', models: 'Gemini 1.5 Pro, Gemini Flash' },
      groq: { emoji: '⚡', description: 'Groq — ultra-fast inference', models: 'Llama 3.1 70B, Mixtral 8x7B' },
      auto: { emoji: '🔄', description: 'Automatically selects the best available provider', models: 'All providers (auto-selected)' },
    };
    return info[provider] || { emoji: '❓', description: 'Unknown', models: 'Unknown' };
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    const provider = i.options.getString('provider', true);
    try {
      const redis = getRedisClient();
      if (redis) {
        await redis.set(`panindigan:aiprovider:user:${i.user.id}`, provider, 'EX', 86400);
      }

      const info = this.getProviderInfo(provider);
      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.ai} AI Provider Switched`)
        .setColor(COLORS.gold)
        .addFields(
          { name: `${info.emoji} Provider`, value: provider.charAt(0).toUpperCase() + provider.slice(1), inline: true },
          { name: '📋 Description', value: info.description, inline: false },
          { name: '🤖 Available Models', value: info.models, inline: false },
          { name: '⏱️ Duration', value: 'Active for 24 hours', inline: true },
        )
        .setFooter({ text: 'Your AI commands will use this provider for the next 24 hours.' })
        .setTimestamp();

      await i.reply({ embeds: [embed], ephemeral: true });
    } catch (err: any) {
      await i.reply({ content: `${EMOJIS.error} Error: ${err.message || 'Could not switch provider.'}`, ephemeral: true });
    }
  }

  public async executePrefix(m: Message, args: string[]): Promise<void> {
    const provider = args[0]?.toLowerCase();
    if (!provider || !PROVIDERS.includes(provider as any)) {
      return void m.reply(
        `${EMOJIS.error} Please specify a valid provider.\nAvailable: ${PROVIDERS.map(p => `\`${p}\``).join(', ')}`
      );
    }

    try {
      const redis = getRedisClient();
      if (redis) {
        await redis.set(`panindigan:aiprovider:user:${m.author.id}`, provider, 'EX', 86400);
      }
      const info = this.getProviderInfo(provider);
      await m.reply(`${info.emoji} Switched AI provider to **${provider}** — ${info.description}. Active for 24 hours.`);
    } catch (err: any) {
      await m.reply(`${EMOJIS.error} Error: ${err.message || 'Could not switch provider.'}`);
    }
  }
}

export default AiProviderCommand;
