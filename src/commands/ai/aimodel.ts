import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';
import { getRedisClient } from '../../database/redis/client';

const AVAILABLE_MODELS: Record<string, string[]> = {
  openai: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'],
  anthropic: ['claude-3-5-sonnet-20241022', 'claude-3-haiku-20240307', 'claude-3-opus-20240229'],
  google: ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-pro'],
  groq: ['llama-3.1-70b-versatile', 'mixtral-8x7b-32768', 'llama3-8b-8192'],
};

export class AiModelCommand extends BaseCommand {
  constructor() {
    super({
      name: 'aimodel',
      description: 'Switch the AI model for your current session (Gold+)',
      category: 'ai',
      premiumTier: 'gold',
      cooldown: 5,
      ownerOnly: false,
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['setmodel', 'model'],
      examples: ['/aimodel gpt-4o', 'p!aimodel claude-3-5-sonnet-20241022'],
    } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addStringOption(o =>
        o.setName('model').setDescription('Model name to switch to (leave empty to see list)').setRequired(false)
      )
      .setDMPermission(true) as SlashCommandBuilder;
  }

  private buildListEmbed(): EmbedBuilder {
    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.ai} Available AI Models`)
      .setColor(COLORS.gold)
      .setDescription('Use `/aimodel <model_name>` to switch models.');
    for (const [provider, models] of Object.entries(AVAILABLE_MODELS)) {
      embed.addFields({ name: `🔷 ${provider.charAt(0).toUpperCase() + provider.slice(1)}`, value: models.map(m => `\`${m}\``).join('\n'), inline: true });
    }
    return embed;
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    const modelName = i.options.getString('model');
    if (!modelName) {
      await i.reply({ embeds: [this.buildListEmbed()], ephemeral: true });
      return;
    }

    const allModels = Object.values(AVAILABLE_MODELS).flat();
    if (!allModels.includes(modelName)) {
      await i.reply({ content: `${EMOJIS.error} Unknown model \`${modelName}\`. Use \`/aimodel\` to see available models.`, ephemeral: true });
      return;
    }

    try {
      const redis = getRedisClient();
      if (redis) {
        await redis.set(`panindigan:aimodel:user:${i.user.id}`, modelName, 'EX', 86400);
      }

      const provider = Object.entries(AVAILABLE_MODELS).find(([, models]) => models.includes(modelName))?.[0] || 'unknown';
      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.ai} AI Model Switched`)
        .setColor(COLORS.gold)
        .addFields(
          { name: '🤖 Model', value: `\`${modelName}\``, inline: true },
          { name: '🔷 Provider', value: provider.charAt(0).toUpperCase() + provider.slice(1), inline: true },
          { name: '⏱️ Duration', value: 'Active for 24 hours', inline: true },
        )
        .setFooter({ text: 'Your AI session will use this model for the next 24 hours.' })
        .setTimestamp();

      await i.reply({ embeds: [embed], ephemeral: true });
    } catch (err: any) {
      await i.reply({ content: `${EMOJIS.error} Error: ${err.message || 'Could not switch model.'}`, ephemeral: true });
    }
  }

  public async executePrefix(m: Message, args: string[]): Promise<void> {
    const modelName = args[0];
    if (!modelName) {
      await m.reply({ embeds: [this.buildListEmbed()] });
      return;
    }

    const allModels = Object.values(AVAILABLE_MODELS).flat();
    if (!allModels.includes(modelName)) {
      return void m.reply(`${EMOJIS.error} Unknown model \`${modelName}\`. Use \`p!aimodel\` to see available models.`);
    }

    try {
      const redis = getRedisClient();
      if (redis) {
        await redis.set(`panindigan:aimodel:user:${m.author.id}`, modelName, 'EX', 86400);
      }
      const provider = Object.entries(AVAILABLE_MODELS).find(([, models]) => models.includes(modelName))?.[0] || 'unknown';
      await m.reply(`${EMOJIS.success} Switched AI model to \`${modelName}\` (${provider}). Active for 24 hours.`);
    } catch (err: any) {
      await m.reply(`${EMOJIS.error} Error: ${err.message || 'Could not switch model.'}`);
    }
  }
}

export default AiModelCommand;
