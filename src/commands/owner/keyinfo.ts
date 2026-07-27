// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import getMongoClient from '../../database/mongodb/client.js';

export class KeyinfoCommand extends BaseCommand {
  constructor() {
    super({ name: 'keyinfo', description: 'Show info about a specific premium key', category: 'owner', premiumTier: 'free', cooldown: 0, guildOnly: false, ownerOnly: true, slashCommand: true, prefixCommand: true, aliases: ['kinfo'], examples: ['p!keyinfo XXXX-XXXX-XXXX-XXXX'] } as CommandOptions);
  }
  private async run(i: ChatInputCommandInteraction | null, m: Message | null, key: string): Promise<void> {
    const send = async (e: EmbedBuilder) => { if (i) await i.reply({ embeds: [e], flags: 64 }); else await m!.reply({ embeds: [e] }); };
    if (!key) return send(new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Provide a key.'));
    const db = await getMongoClient();
    const doc = await db.collection('premium_keys').findOne({ key });
    if (!doc) return send(new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Key not found.'));
    const embed = new EmbedBuilder().setColor(COLORS.default).setTitle(`🔑 Key Info`)
      .addFields(
        { name: 'Key', value: `\`${doc.key}\``, inline: false },
        { name: 'Tier', value: doc.tier ?? 'unknown', inline: true },
        { name: 'Status', value: doc.activated ? '✅ Activated' : '⭕ Available', inline: true },
        { name: 'Activated By', value: doc.activatedBy ?? 'N/A', inline: true },
        { name: 'Activation Date', value: doc.activatedAt ? new Date(doc.activatedAt).toDateString() : 'N/A', inline: true },
        { name: 'Created At', value: doc.createdAt ? new Date(doc.createdAt).toDateString() : 'N/A', inline: true },
      );
    await send(embed);
  }
  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> { await this.run(i, null, i.options.getString('key', true)); }
  public async executePrefix(m: Message, _args: string[]): Promise<void> { await this.run(null, m, args[0]); }
}
export default KeyinfoCommand;
