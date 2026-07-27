// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import getPrismaClient from '../../database/postgresql/client.js';

export class UsersetCommand extends BaseCommand {
  constructor() {
    super({ name: 'userset', description: 'Set economy balance for any user', category: 'owner', premiumTier: 'free', cooldown: 0, guildOnly: false, ownerOnly: true, slashCommand: true, prefixCommand: true, aliases: ['uset'], examples: ['p!userset economy 123456789 50000'] } as CommandOptions);
  }
  private async run(i: ChatInputCommandInteraction | null, m: Message | null, _args: string[]): Promise<void> {
    const send = async (e: EmbedBuilder) => { if (i) await i.reply({ embeds: [e], flags: 64 }); else await m!.reply({ embeds: [e] }); };
    const [type, userId, amountStr] = _args;
    if (!type || !userId || !amountStr) return send(new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Usage: `userset economy <user_id> <amount>`'));
    const amount = parseInt(amountStr);
    if (isNaN(amount)) return send(new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Amount must be a number.'));
    try {
      const prisma = getPrismaClient();
      if (type === 'economy') {
        await (prisma as any).economy?.upsert({ where: { userId }, update: { wallet: amount }, create: { userId, wallet: amount, bank: 0, netWorth: amount } }).catch(() =>
          (prisma as any).user?.upsert({ where: { id: userId }, update: { wallet: amount }, create: { id: userId, wallet: amount } })
        );
      }
      await send(new EmbedBuilder().setColor(COLORS.success).setTitle('✅ User Updated')
        .addFields({ name: 'User ID', value: userId, inline: true }, { name: 'Type', value: type, inline: true }, { name: 'New Value', value: `${amount.toLocaleString()}`, inline: true }));
    } catch (err: any) {
      await send(new EmbedBuilder().setColor(COLORS.error).setDescription(`❌ ${err.message}`));
    }
  }
  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> { await this.run(i, null, [i.options.getString('type', true), i.options.getString('user_id', true), i.options.getString('amount', true)]); }
  public async executePrefix(m: Message, _args: string[]): Promise<void> { await this.run(null, m, args); }
}
export default UsersetCommand;
