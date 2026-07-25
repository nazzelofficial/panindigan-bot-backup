import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants';
import getMongoClient from '../../database/mongodb/client';

export class OwnersCommand extends BaseCommand {
  constructor() {
    super({ name: 'owners', description: 'List all bot owners and co-owners', category: 'owner', premiumTier: 'free', cooldown: 0, guildOnly: false, ownerOnly: true, slashCommand: true, prefixCommand: true, aliases: ['coowners'], examples: ['p!owners'] } as CommandOptions);
  }
  private async run(i: ChatInputCommandInteraction | null, m: Message | null): Promise<void> {
    const client = i?.client ?? m!.client;
    const send = async (e: EmbedBuilder) => { if (i) await i.reply({ embeds: [e], flags: 64 }); else await m!.reply({ embeds: [e] }); };
    const mainOwners = (process.env.OWNER_IDS ?? '').split(',').map(s => s.trim()).filter(Boolean);
    const db = await getMongoClient();
    const coOwners = await db.collection('bot_owners').find({}).toArray();
    const fetchTag = async (id: string) => { try { const u = await client.users.fetch(id); return u.tag; } catch { return id; } };
    const mainTags = await Promise.all(mainOwners.map(fetchTag));
    const coTags = await Promise.all(coOwners.map(co => fetchTag(co.userId)));
    const embed = new EmbedBuilder().setColor(COLORS.default).setTitle('👑 Bot Owners')
      .addFields(
        { name: '⭐ Main Owners', value: mainTags.map(t => `• ${t}`).join('\n') || 'None configured', inline: false },
        { name: '🌟 Co-Owners', value: coTags.map(t => `• ${t}`).join('\n') || 'None', inline: false },
      );
    await send(embed);
  }
  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> { await this.run(i, null); }
  public async executePrefix(m: Message): Promise<void> { await this.run(null, m); }
}
export default OwnersCommand;
