// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';

export class GrowthCommand extends BaseCommand {
  constructor() {
    super({ name: 'growth', description: 'Show bot growth — current guild count and stats', category: 'owner', premiumTier: 'free', cooldown: 0, guildOnly: false, ownerOnly: true, slashCommand: true, prefixCommand: true, aliases: ['botgrowth'], examples: ['p!growth'] } as CommandOptions);
  }
  private async run(i: ChatInputCommandInteraction | null, m: Message | null): Promise<void> {
    const client = i?.client ?? m!.client;
    const send = async (e: EmbedBuilder) => { if (i) await i.reply({ embeds: [e], flags: 64 }); else await m!.reply({ embeds: [e] }); };
    const guilds = [...client.guilds.cache.values()];
    const totalMembers = guilds.reduce((acc, g) => acc + (g.memberCount ?? 0), 0);
    const avgMembers = guilds.length ? Math.floor(totalMembers / guilds.length) : 0;
    const largest = guilds.sort((a, b) => (b.memberCount ?? 0) - (a.memberCount ?? 0)).slice(0, 3);
    const embed = new EmbedBuilder().setColor(COLORS.default).setTitle('📈 Bot Growth Statistics')
      .addFields(
        { name: '🏠 Total Servers', value: guilds.length.toLocaleString(), inline: true },
        { name: '👥 Total Members', value: totalMembers.toLocaleString(), inline: true },
        { name: '📊 Avg Members/Server', value: avgMembers.toLocaleString(), inline: true },
        { name: '🏆 Largest Servers', value: largest.map(g => `${g.name}: ${(g.memberCount ?? 0).toLocaleString()}`).join('\n') || 'N/A', inline: false },
      );
    await send(embed);
  }
  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> { await this.run(i, null); }
  public async executePrefix(m: Message): Promise<void> { await this.run(null, m); }
}
export default GrowthCommand;
