// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';

export class MemoryCommand extends BaseCommand {
  constructor() {
    super({ name: 'memory', description: 'Show Node.js process memory usage', category: 'owner', premiumTier: 'free', cooldown: 0, guildOnly: false, ownerOnly: true, slashCommand: true, prefixCommand: true, aliases: ['mem', 'meminfo'], examples: ['p!memory'] } as CommandOptions);
  }
  private async run(i: ChatInputCommandInteraction | null, m: Message | null): Promise<void> {
    const send = async (e: EmbedBuilder) => { if (i) await i.reply({ embeds: [e], flags: 64 }); else await m!.reply({ embeds: [e] }); };
    const mem = process.memoryUsage();
    const toMB = (b: number) => (b / 1024 / 1024).toFixed(2);
    const embed = new EmbedBuilder().setColor(COLORS.default).setTitle('💾 Node.js Memory Usage')
      .addFields(
        { name: '🔵 Heap Used', value: `${toMB(mem.heapUsed)} MB`, inline: true },
        { name: '🟣 Heap Total', value: `${toMB(mem.heapTotal)} MB`, inline: true },
        { name: '🔴 RSS', value: `${toMB(mem.rss)} MB`, inline: true },
        { name: '🟡 External', value: `${toMB(mem.external)} MB`, inline: true },
        { name: '📊 Array Buffers', value: `${toMB(mem.arrayBuffers)} MB`, inline: true },
        { name: '📈 Heap Usage', value: `${((mem.heapUsed / mem.heapTotal) * 100).toFixed(1)}%`, inline: true },
      );
    await send(embed);
  }
  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> { await this.run(i, null); }
  public async executePrefix(m: Message): Promise<void> { await this.run(null, m); }
}
export default MemoryCommand;
