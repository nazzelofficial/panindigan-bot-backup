// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';

export class WhoisCommand extends BaseCommand {
  constructor() {
    super({ name: 'whois', description: 'WHOIS lookup for a domain using rdap.org', category: 'utility', premiumTier: 'free', cooldown: 5, guildOnly: false, ownerOnly: false, slashCommand: true, prefixCommand: true, aliases: ['domaininfo', 'domain'], examples: ['/whois google.com', 'p!whois discord.com'] } as CommandOptions);
  }
  private async run(i: ChatInputCommandInteraction | null, m: Message | null, domain: string): Promise<void> {
    const send = async (e: EmbedBuilder) => { if (i) await i.reply({ embeds: [e] }); else await m!.reply({ embeds: [e] }); };
    if (!domain) return send(new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Provide a domain name.'));
    try {
      const resp = await fetch(`https://rdap.org/domain/${encodeURIComponent(domain)}`, { signal: AbortSignal.timeout(8000) });
      if (!resp.ok) return send(new EmbedBuilder().setColor(COLORS.error).setDescription(`❌ WHOIS lookup failed for \`${domain}\`. Status: ${resp.status}`));
      const data = await resp.json() as any;
      const status = Array.isArray(data.status) ? data.status.join(', ') : (data.status ?? 'N/A');
      const registrar = data.entities?.find((e: any) => e.roles?.includes('registrar'));
      const registrant = data.entities?.find((e: any) => e.roles?.includes('registrant'));
      const events = data.events ?? [];
      const getEvent = (action: string) => events.find((e: any) => e.eventAction === action)?.eventDate?.slice(0, 10) ?? 'N/A';
      const embed = new EmbedBuilder().setColor(COLORS.default).setTitle(`🔍 WHOIS: ${domain}`)
        .addFields(
          { name: '📋 Status', value: status.slice(0, 200), inline: false },
          { name: '🏢 Registrar', value: registrar?.vcardArray?.[1]?.find((a: any) => a[0] === 'fn')?.[3] ?? registrar?.handle ?? 'N/A', inline: true },
          { name: '👤 Registrant', value: registrant?.vcardArray?.[1]?.find((a: any) => a[0] === 'fn')?.[3] ?? 'Redacted', inline: true },
          { name: '📅 Registered', value: getEvent('registration'), inline: true },
          { name: '🔄 Expires', value: getEvent('expiration'), inline: true },
          { name: '🕐 Updated', value: getEvent('last changed'), inline: true },
        );
      await send(embed);
    } catch (err: any) {
      await send(new EmbedBuilder().setColor(COLORS.error).setDescription(`❌ ${err.message}`));
    }
  }
  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> { await this.run(i, null, i.options.getString('domain', true)); }
  public async executePrefix(m: Message, args: string[]): Promise<void> { await this.run(null, m, args[0]); }
}
export default WhoisCommand;
