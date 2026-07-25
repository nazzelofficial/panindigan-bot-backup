import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants';
import getMongoClient from '../../database/mongodb/client';

export class RemoveownerCommand extends BaseCommand {
  constructor() {
    super({ name: 'removeowner', description: 'Remove a co-owner from the bot', category: 'owner', premiumTier: 'free', cooldown: 0, guildOnly: false, ownerOnly: true, slashCommand: true, prefixCommand: true, aliases: ['remco'], examples: ['p!removeowner 123456789'] } as CommandOptions);
  }
  private async run(i: ChatInputCommandInteraction | null, m: Message | null, userId: string): Promise<void> {
    const send = async (e: EmbedBuilder) => { if (i) await i.reply({ embeds: [e], flags: 64 }); else await m!.reply({ embeds: [e] }); };
    if (!userId) return send(new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Provide a user ID.'));
    const db = await getMongoClient();
    const result = await db.collection('bot_owners').deleteOne({ userId });
    await send(new EmbedBuilder().setColor(result.deletedCount ? COLORS.success : COLORS.error)
      .setTitle(result.deletedCount ? '✅ Co-Owner Removed' : '❌ Not Found')
      .setDescription(result.deletedCount ? `User \`${userId}\` removed from co-owners.` : `User \`${userId}\` was not a co-owner.`));
  }
  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> { await this.run(i, null, i.options.getString('user_id', true)); }
  public async executePrefix(m: Message, args: string[]): Promise<void> { await this.run(null, m, args[0]); }
}
export default RemoveownerCommand;
