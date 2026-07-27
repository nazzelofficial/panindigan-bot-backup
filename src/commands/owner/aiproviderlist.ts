// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import { getRedisClient } from '../../database/redis/client.js';

const PROVIDERS = ['openai', 'anthropic', 'google', 'mistral', 'cohere', 'groq'];

export class AiproviderlistCommand extends BaseCommand {
  constructor() {
    super({ name: 'aiproviderlist', description: 'List all AI providers and their status', category: 'owner', premiumTier: 'free', cooldown: 0, guildOnly: false, ownerOnly: true, slashCommand: true, prefixCommand: true, aliases: ['ailist'], examples: ['p!aiproviderlist'] } as CommandOptions);
  }
  private async run(i: ChatInputCommandInteraction | null, m: Message | null): Promise<void> {
    const send = async (e: EmbedBuilder) => { if (i) await i.reply({ embeds: [e], flags: 64 }); else await m!.reply({ embeds: [e] }); };
    const redis = getRedisClient();
    const statuses = await Promise.all(PROVIDERS.map(async p => {
      const enabled = await redis.get(`ai:provider:${p}:enabled`);
      return { name: p, enabled: enabled !== 'false' };
    }));
    const embed = new EmbedBuilder().setColor(COLORS.default).setTitle('🤖 AI Providers')
      .setDescription(statuses.map(p => `${p.enabled ? '🟢' : '🔴'} **${p.name}** — ${p.enabled ? 'Enabled' : 'Disabled'}`).join('\n'));
    await send(embed);
  }
  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> { await this.run(i, null); }
  public async executePrefix(m: Message): Promise<void> { await this.run(null, m); }
}
export default AiproviderlistCommand;
