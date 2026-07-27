// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import getMongoClient from '../../database/mongodb/client.js';

export class KeyexportCommand extends BaseCommand {
  constructor() {
    super({ name: 'keyexport', description: 'Export all premium keys as CSV', category: 'owner', premiumTier: 'free', cooldown: 0, guildOnly: false, ownerOnly: true, slashCommand: true, prefixCommand: true, aliases: ['kexp'], examples: ['p!keyexport'] } as CommandOptions);
  }
  private async run(i: ChatInputCommandInteraction | null, m: Message | null): Promise<void> {
    const send = async (e: EmbedBuilder) => { if (i) await i.reply({ embeds: [e], flags: 64 }); else await m!.reply({ embeds: [e] }); };
    const db = await getMongoClient();
    const keys = await db.collection('premium_keys').find({}).toArray();
    if (!keys.length) return send(new EmbedBuilder().setColor(COLORS.default).setDescription('No keys found.'));
    const csv = ['key,tier,activated,activatedBy,activatedAt,createdAt',
      ...keys.map(k => `${k.key},${k.tier},${k.activated ?? false},${k.activatedBy ?? ''},${k.activatedAt ?? ''},${k.createdAt ?? ''}`)
    ].join('\n');
    const embed = new EmbedBuilder().setColor(COLORS.default).setTitle('📋 Premium Keys Export')
      .setDescription(`\`\`\`csv\n${csv.slice(0, 1800)}\n\`\`\``)
      .setFooter({ text: `${keys.length} keys total` });
    await send(embed);
  }
  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> { await this.run(i, null); }
  public async executePrefix(m: Message): Promise<void> { await this.run(null, m); }
}
export default KeyexportCommand;
