// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import getRedisClient from '../../database/redis/client.js';

export class AimodelglobalCommand extends BaseCommand {
  constructor() {
    super({ name: 'aimodelglobal', description: 'Set the global default AI model', category: 'owner', premiumTier: 'free', cooldown: 0, guildOnly: false, ownerOnly: true, slashCommand: true, prefixCommand: true, aliases: ['aimglobal'], examples: ['p!aimodelglobal gpt-4o-mini'] } as CommandOptions);
  }
  private async run(i: ChatInputCommandInteraction | null, m: Message | null, model: string): Promise<void> {
    const send = async (e: EmbedBuilder) => { if (i) await i.reply({ embeds: [e], flags: 64 }); else await m!.reply({ embeds: [e] }); };
    if (!model) return send(new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Provide a model name.'));
    const redis = getRedisClient();
    await redis.set('ai:model:global', model);
    await send(new EmbedBuilder().setColor(COLORS.success).setTitle('🤖 Global AI Model Updated')
      .setDescription(`Default model set to **\`${model}\`**.`));
  }
  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> { await this.run(i, null, i.options.getString('model', true)); }
  public async executePrefix(m: Message, _args: string[]): Promise<void> { await this.run(null, m, args[0]); }
}
export default AimodelglobalCommand;
