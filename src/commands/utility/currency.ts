// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';

export class CurrencyCommand extends BaseCommand {
  constructor() {
    super({ name: 'currency', description: 'Convert between currencies', category: 'utility', premiumTier: 'free', cooldown: 5, guildOnly: false, ownerOnly: false, slashCommand: true, prefixCommand: true, aliases: ['convert', 'exchange'], examples: ['/currency 100 USD EUR', 'p!currency 50 PHP USD'] } as CommandOptions);
  }
  private async run(i: ChatInputCommandInteraction | null, m: Message | null, amount: number, from: string, to: string): Promise<void> {
    const send = async (e: EmbedBuilder) => { if (i) await i.reply({ embeds: [e] }); else await m!.reply({ embeds: [e] }); };
    if (!amount || !from || !to) return send(new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Usage: `currency <amount> <from> <to>`\nExample: `currency 100 USD EUR`'));
    try {
      const resp = await fetch(`https://api.exchangerate-api.com/v4/latest/${from.toUpperCase()}`, { signal: AbortSignal.timeout(8000) });
      const data = await resp.json() as any;
      if (data.error) return send(new EmbedBuilder().setColor(COLORS.error).setDescription(`❌ ${data.error}`));
      const rate = data.rates[to.toUpperCase()];
      if (!rate) return send(new EmbedBuilder().setColor(COLORS.error).setDescription(`❌ Currency code \`${to.toUpperCase()}\` not found.`));
      const result = (amount * rate).toFixed(2);
      const embed = new EmbedBuilder().setColor(COLORS.success).setTitle('💱 Currency Conversion')
        .addFields(
          { name: 'From', value: `${amount.toLocaleString()} **${from.toUpperCase()}**`, inline: true },
          { name: 'To', value: `${parseFloat(result).toLocaleString()} **${to.toUpperCase()}**`, inline: true },
          { name: 'Rate', value: `1 ${from.toUpperCase()} = ${rate.toFixed(4)} ${to.toUpperCase()}`, inline: false },
        ).setFooter({ text: `Rates from exchangerate-api.com` });
      await send(embed);
    } catch (err: any) {
      await send(new EmbedBuilder().setColor(COLORS.error).setDescription(`❌ ${err.message}`));
    }
  }
  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> { await this.run(i, null, i.options.getNumber('amount', true), i.options.getString('from', true), i.options.getString('to', true)); }
  public async executePrefix(m: Message, _args: string[]): Promise<void> { await this.run(null, m, parseFloat(args[0]), args[1], args[2]); }
}
export default CurrencyCommand;
