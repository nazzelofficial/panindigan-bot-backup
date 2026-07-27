// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';

export class IpinfoCommand extends BaseCommand {
  constructor() {
    super({ name: 'ipinfo', description: 'Get information about an IP address', category: 'utility', premiumTier: 'free', cooldown: 5, guildOnly: false, ownerOnly: false, slashCommand: true, prefixCommand: true, aliases: ['ip', 'ipcheck'], examples: ['/ipinfo 1.1.1.1', 'p!ipinfo 8.8.8.8'] } as CommandOptions);
  }
  private async run(i: ChatInputCommandInteraction | null, m: Message | null, ip: string): Promise<void> {
    const send = async (e: EmbedBuilder) => { if (i) await i.reply({ embeds: [e] }); else await m!.reply({ embeds: [e] }); };
    if (!ip) return send(new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Provide an IP address.'));
    try {
      const resp = await fetch(`https://ipinfo.io/${ip}/json`, { signal: AbortSignal.timeout(8000) });
      const data = await resp.json() as any;
      if (data.error) return send(new EmbedBuilder().setColor(COLORS.error).setDescription(`❌ ${data.error.message ?? 'Invalid IP'}`));
      const embed = new EmbedBuilder().setColor(COLORS.default).setTitle(`🌐 IP Info: ${ip}`)
        .addFields(
          { name: '🏙️ City', value: data.city ?? 'N/A', inline: true },
          { name: '🌍 Country', value: data.country ?? 'N/A', inline: true },
          { name: '📍 Region', value: data.region ?? 'N/A', inline: true },
          { name: '🏢 Organization', value: data.org ?? 'N/A', inline: true },
          { name: '⏰ Timezone', value: data.timezone ?? 'N/A', inline: true },
          { name: '📮 Postal', value: data.postal ?? 'N/A', inline: true },
        );
      await send(embed);
    } catch (err: any) {
      await send(new EmbedBuilder().setColor(COLORS.error).setDescription(`❌ Failed: ${err.message}`));
    }
  }
  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> { await this.run(i, null, i.options.getString('ip', true)); }
  public async executePrefix(m: Message, _args: string[]): Promise<void> { await this.run(null, m, args[0]); }
}
export default IpinfoCommand;
