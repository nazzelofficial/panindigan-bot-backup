// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';
import { getMongoDb as getMongoClient } from '../../database/mongodb/client.js';

export class UserstatsCommand extends BaseCommand {
  constructor() {
    super({ name: 'userstats', description: 'Show all stats for any user by ID', category: 'owner', premiumTier: 'free', cooldown: 0, guildOnly: false, ownerOnly: true, slashCommand: true, prefixCommand: true, aliases: ['ustat'], examples: ['p!userstats 123456789'] } as CommandOptions);
  }
  private async run(i: ChatInputCommandInteraction | null, m: Message | null, userId: string): Promise<void> {
    const send = async (e: EmbedBuilder) => { if (i) await i.reply({ embeds: [e], flags: 64 }); else await m!.reply({ embeds: [e] }); };
    if (!userId) return send(new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Provide a user ID.'));
    try {
      const prisma = getPrismaClient();
      const db = await getMongoClient();
      const [economy, level, cmdCount] = await Promise.all([
        (prisma as any).economy?.findFirst({ where: { userId } }).catch(() => null),
        (prisma as any).userLevel?.findFirst({ where: { userId } }).catch(() => null),
        db.collection('command_executions').countDocuments({ userId }).catch(() => 0),
      ]);
      const client = i?.client ?? m!.client;
      const user = await client.users.fetch(userId).catch(() => null);
      const embed = new EmbedBuilder().setColor(COLORS.default).setTitle(`📊 User Stats: ${user?.tag ?? userId}`)
        .setThumbnail(user?.displayAvatarURL() ?? null)
        .addFields(
          { name: '💰 Wallet', value: economy?.wallet?.toLocaleString() ?? '0', inline: true },
          { name: '🏦 Bank', value: economy?.bank?.toLocaleString() ?? '0', inline: true },
          { name: '⭐ Level', value: level?.level?.toString() ?? '0', inline: true },
          { name: '💫 XP', value: level?.xp?.toLocaleString() ?? '0', inline: true },
          { name: '🤖 Commands Used', value: cmdCount.toString(), inline: true },
          { name: '💎 Premium', value: (economy as any)?.premiumTier ?? 'free', inline: true },
        );
      await send(embed);
    } catch (err: any) {
      await send(new EmbedBuilder().setColor(COLORS.error).setDescription(`❌ ${err.message}`));
    }
  }
  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> { await this.run(i, null, i.options.getString('user_id', true)); }
  public async executePrefix(m: Message, args: string[]): Promise<void> { await this.run(null, m, args[0]); }
}
export default UserstatsCommand;
