import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants';
import { promises as dns } from 'dns';

export class DnsCommand extends BaseCommand {
  constructor() {
    super({ name: 'dns', description: 'Perform a DNS lookup for a domain', category: 'utility', premiumTier: 'free', cooldown: 5, guildOnly: false, ownerOnly: false, slashCommand: true, prefixCommand: true, aliases: ['nslookup', 'lookup'], examples: ['/dns google.com A', 'p!dns cloudflare.com MX'] } as CommandOptions);
  }
  private async run(i: ChatInputCommandInteraction | null, m: Message | null, domain: string, type: string): Promise<void> {
    const send = async (e: EmbedBuilder) => { if (i) await i.reply({ embeds: [e] }); else await m!.reply({ embeds: [e] }); };
    if (!domain) return send(new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Provide a domain name.'));
    const recordType = (type ?? 'A').toUpperCase();
    const validTypes = ['A', 'AAAA', 'MX', 'TXT', 'NS', 'CNAME', 'SOA', 'SRV', 'PTR'];
    if (!validTypes.includes(recordType)) return send(new EmbedBuilder().setColor(COLORS.error).setDescription(`❌ Invalid type. Valid: ${validTypes.join(', ')}`));
    try {
      let records: any;
      if (recordType === 'A') records = await dns.resolve4(domain);
      else if (recordType === 'AAAA') records = await dns.resolve6(domain);
      else if (recordType === 'MX') records = (await dns.resolveMx(domain)).map(r => `Priority ${r.priority}: ${r.exchange}`);
      else if (recordType === 'TXT') records = (await dns.resolveTxt(domain)).map(r => r.join(''));
      else if (recordType === 'NS') records = await dns.resolveNs(domain);
      else if (recordType === 'CNAME') records = await dns.resolveCname(domain);
      else records = await dns.resolve(domain, recordType as any);
      const embed = new EmbedBuilder().setColor(COLORS.success).setTitle(`🔍 DNS Lookup: ${domain} (${recordType})`)
        .setDescription(Array.isArray(records) ? records.slice(0, 15).map(r => `\`${JSON.stringify(r)}\``).join('\n') : `\`${JSON.stringify(records)}\``);
      await send(embed);
    } catch (err: any) {
      await send(new EmbedBuilder().setColor(COLORS.error).setDescription(`❌ DNS lookup failed: ${err.message}`));
    }
  }
  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> { await this.run(i, null, i.options.getString('domain', true), i.options.getString('type') ?? 'A'); }
  public async executePrefix(m: Message, args: string[]): Promise<void> { await this.run(null, m, args[0], args[1] ?? 'A'); }
}
export default DnsCommand;
