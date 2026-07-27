// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import { getMongoDb as getMongoClient } from '../../database/mongodb/client.js';

export class KeysalesCommand extends BaseCommand {
  constructor() {
    super({ name: 'keysales', description: 'Show sales report of activated premium keys per tier', category: 'owner', premiumTier: 'free', cooldown: 0, guildOnly: false, ownerOnly: true, slashCommand: true, prefixCommand: true, aliases: ['ksales'], examples: ['p!keysales'] } as CommandOptions);
  }
  private async run(i: ChatInputCommandInteraction | null, m: Message | null): Promise<void> {
    const send = async (e: EmbedBuilder) => { if (i) await i.reply({ embeds: [e], flags: 64 }); else await m!.reply({ embeds: [e] }); };
    const db = await getMongoClient();
    const pipeline = [{ $group: { _id: '$tier', total: { $sum: 1 }, activated: { $sum: { $cond: ['$activated', 1, 0] } } } }];
    const stats = await db.collection('premium_keys').aggregate(pipeline).toArray();
    const tiers = ['bronze', 'silver', 'gold', 'diamond'];
    const embed = new EmbedBuilder().setColor(COLORS.default).setTitle('📊 Premium Key Sales Report')
      .addFields(tiers.map(t => {
        const s = stats.find(x => x._id === t);
        return { name: `💎 ${t.charAt(0).toUpperCase() + t.slice(1)}`, value: s ? `${s.activated}/${s.total} activated` : '0/0', inline: true };
      }));
    await send(embed);
  }
  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> { await this.run(i, null); }
  public async executePrefix(m: Message): Promise<void> { await this.run(null, m); }
}
export default KeysalesCommand;
