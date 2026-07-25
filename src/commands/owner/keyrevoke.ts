import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants';
import getMongoClient from '../../database/mongodb/client';

export class KeyrevokeCommand extends BaseCommand {
  constructor() {
    super({ name: 'keyrevoke', description: 'Revoke an activated premium key', category: 'owner', premiumTier: 'free', cooldown: 0, guildOnly: false, ownerOnly: true, slashCommand: true, prefixCommand: true, aliases: ['krevoke'], examples: ['p!keyrevoke XXXX-XXXX-XXXX-XXXX'] } as CommandOptions);
  }
  private async run(i: ChatInputCommandInteraction | null, m: Message | null, key: string): Promise<void> {
    const send = async (e: EmbedBuilder) => { if (i) await i.reply({ embeds: [e], flags: 64 }); else await m!.reply({ embeds: [e] }); };
    if (!key) return send(new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Provide a key.'));
    const db = await getMongoClient();
    const result = await db.collection('premium_keys').updateOne({ key }, { $set: { activated: false, revokedAt: new Date(), activatedBy: null } });
    await send(new EmbedBuilder().setColor(result.modifiedCount ? COLORS.success : COLORS.error)
      .setTitle(result.modifiedCount ? '✅ Key Revoked' : '❌ Key Not Found')
      .setDescription(result.modifiedCount ? `Key \`${key}\` has been revoked and is now available again.` : `Key \`${key}\` not found.`));
  }
  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> { await this.run(i, null, i.options.getString('key', true)); }
  public async executePrefix(m: Message, args: string[]): Promise<void> { await this.run(null, m, args[0]); }
}
export default KeyrevokeCommand;
