// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import getRedisClient from '../../database/redis/client.js';

export class AiproviderprioritytCommand extends BaseCommand {
  constructor() {
    super({ name: 'aiproviderpriority', description: 'Set AI provider priority order', category: 'owner', premiumTier: 'free', cooldown: 0, guildOnly: false, ownerOnly: true, slashCommand: true, prefixCommand: true, aliases: ['aipriority'], examples: ['p!aiproviderpriority openai anthropic google'] } as CommandOptions);
  }
  private async run(i: ChatInputCommandInteraction | null, m: Message | null, providers: string[]): Promise<void> {
    const send = async (e: EmbedBuilder) => { if (i) await i.reply({ embeds: [e], flags: 64 }); else await m!.reply({ embeds: [e] }); };
    if (!providers.length) return send(new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Provide at least one provider.'));
    const redis = getRedisClient();
    await redis.set('ai:provider:priority', providers.join(','));
    await send(new EmbedBuilder().setColor(COLORS.success).setTitle('🤖 AI Provider Priority Set')
      .setDescription(providers.map((p, i) => `**${i + 1}.** ${p}`).join('\n')));
  }
  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> { await this.run(i, null, (i.options.getString('providers', true)).split(' ')); }
  public async executePrefix(m: Message, _args: string[]): Promise<void> { await this.run(null, m, args); }
}
export default AiproviderprioritytCommand;
