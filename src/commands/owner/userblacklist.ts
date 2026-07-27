// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import { getMongoDb as getMongoClient } from '../../database/mongodb/client.js';

export class UserblacklistCommand extends BaseCommand {
  constructor() {
    super({ name: 'userblacklist', description: 'Add a user to the global bot blacklist', category: 'owner', premiumTier: 'free', cooldown: 0, guildOnly: false, ownerOnly: true, slashCommand: true, prefixCommand: true, aliases: ['ublk'], examples: ['p!userblacklist 123456789 spamming'] } as CommandOptions);
  }
  private async run(i: ChatInputCommandInteraction | null, m: Message | null, userId: string, reason: string): Promise<void> {
    const send = async (e: EmbedBuilder) => { if (i) await i.reply({ embeds: [e], flags: 64 }); else await m!.reply({ embeds: [e] }); };
    if (!userId) return send(new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Provide a user ID.'));
    try {
      const db = await getMongoClient();
      await db.collection('global_blacklist').updateOne({ userId }, { $set: { userId, reason: reason || 'No reason provided', blacklistedAt: new Date(), type: 'user' } }, { upsert: true });
      await send(new EmbedBuilder().setColor(COLORS.success).setTitle('🚫 User Blacklisted')
        .addFields({ name: 'User ID', value: userId, inline: true }, { name: 'Reason', value: reason || 'No reason', inline: true }));
    } catch (err: any) {
      await send(new EmbedBuilder().setColor(COLORS.error).setDescription(`❌ ${err.message}`));
    }
  }
  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> { await this.run(i, null, i.options.getString('user_id', true), i.options.getString('reason') ?? ''); }
  public async executePrefix(m: Message, _args: string[]): Promise<void> { await this.run(null, m, args[0], args.slice(1).join(' ')); }
}
export default UserblacklistCommand;
