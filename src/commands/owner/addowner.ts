// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import { getMongoDb as getMongoClient } from '../../database/mongodb/client.js';

export class AddownerCommand extends BaseCommand {
  constructor() {
    super({ name: 'addowner', description: 'Add a co-owner to the bot', category: 'owner', premiumTier: 'free', cooldown: 0, guildOnly: false, ownerOnly: true, slashCommand: true, prefixCommand: true, aliases: ['addco'], examples: ['p!addowner 123456789'] } as CommandOptions);
  }
  private async run(i: ChatInputCommandInteraction | null, m: Message | null, userId: string): Promise<void> {
    const send = async (e: EmbedBuilder) => { if (i) await i.reply({ embeds: [e], flags: 64 }); else await m!.reply({ embeds: [e] }); };
    if (!userId) return send(new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Provide a user ID.'));
    const db = await getMongoClient();
    await db.collection('bot_owners').updateOne({ userId }, { $set: { userId, addedAt: new Date() } }, { upsert: true });
    await send(new EmbedBuilder().setColor(COLORS.success).setTitle('✅ Co-Owner Added').setDescription(`User \`${userId}\` has been added as a bot co-owner.`));
  }
  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> { await this.run(i, null, i.options.getString('user_id', true)); }
  public async executePrefix(m: Message, args: string[]): Promise<void> { await this.run(null, m, args[0]); }
}
export default AddownerCommand;
