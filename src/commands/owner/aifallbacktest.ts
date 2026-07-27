// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import getRedisClient from '../../database/redis/client.js';

export class AifallbacktestCommand extends BaseCommand {
  constructor() {
    super({ name: 'aifallbacktest', description: 'Test AI provider failover chain', category: 'owner', premiumTier: 'free', cooldown: 0, guildOnly: false, ownerOnly: true, slashCommand: true, prefixCommand: true, aliases: ['aifallback'], examples: ['p!aifallbacktest'] } as CommandOptions);
  }
  private async run(i: ChatInputCommandInteraction | null, m: Message | null): Promise<void> {
    const send = async (e: EmbedBuilder) => { if (i) await i.reply({ embeds: [e], flags: 64 }); else await m!.reply({ embeds: [e] }); };
    const redis = getRedisClient();
    const priorityStr = await redis.get('ai:provider:priority');
    const providers = priorityStr ? priorityStr.split(',') : ['openai', 'anthropic', 'google'];
    const statuses = await Promise.all(providers.map(async p => {
      const enabled = await redis.get(`ai:provider:${p}:enabled`);
      return { name: p, enabled: enabled !== 'false' };
    }));
    const activeChain = statuses.filter(p => p.enabled);
    const embed = new EmbedBuilder().setColor(COLORS.default).setTitle('🔄 AI Failover Chain Test')
      .setDescription(
        `**Failover Order:**\n${statuses.map((p, i) => `${i + 1}. ${p.enabled ? '🟢' : '🔴'} **${p.name}** ${!p.enabled ? '(SKIPPED — disabled)' : ''}`).join('\n')}\n\n` +
        `**Active providers in chain:** ${activeChain.length}\n` +
        `**First available:** ${activeChain[0]?.name ?? '❌ None! All providers disabled!'}`
      );
    await send(embed);
  }
  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> { await this.run(i, null); }
  public async executePrefix(m: Message): Promise<void> { await this.run(null, m); }
}
export default AifallbacktestCommand;
