import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants';
import { getPrismaClient } from '../../database/postgresql/client';

export class GiveawayHistoryCommand extends BaseCommand {
  constructor() {
    super({ name: 'ghistory', description: 'View history of past giveaways in this server', category: 'giveaway', premiumTier: 'free', cooldown: 5, guildOnly: true, slashCommand: true, prefixCommand: true, aliases: ['giveaway-history', 'gw-history'], examples: ['/ghistory', 'p!ghistory'] } as CommandOptions);
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    const prisma = getPrismaClient();
    const giveaways = await prisma.giveaway.findMany({ where: { guildId: i.guildId!, active: false }, orderBy: { endsAt: 'desc' }, take: 15 });
    if (!giveaways.length) { await i.editReply({ content: '📭 No completed giveaways found.' }); return; }
    const embed = new EmbedBuilder().setTitle('📜 Giveaway History').setColor(COLORS.default)
      .setDescription(giveaways.map((g, idx) => `**${idx + 1}.** ${g.prize}\nEnded: <t:${Math.floor(new Date(g.endsAt).getTime() / 1000)}:D>${g.winnerId ? `\nWinner(s): ${g.winnerId.split(',').map(id => `<@${id}>`).join(', ')}` : ''}`).join('\n\n'))
      .setTimestamp();
    await i.editReply({ embeds: [embed] });
  }

  public async executePrefix(m: Message, args: string[]): Promise<void> {
    const prisma = getPrismaClient();
    const giveaways = await prisma.giveaway.findMany({ where: { guildId: m.guildId!, active: false }, orderBy: { endsAt: 'desc' }, take: 10 });
    if (!giveaways.length) { await m.reply('📭 No completed giveaways.'); return; }
    const embed = new EmbedBuilder().setTitle('📜 Giveaway History').setColor(COLORS.default)
      .setDescription(giveaways.map((g, i) => `**${i + 1}.** ${g.prize} — Ended <t:${Math.floor(new Date(g.endsAt).getTime() / 1000)}:D>`).join('\n'))
      .setTimestamp();
    await m.reply({ embeds: [embed] });
  }
}
export default GiveawayHistoryCommand;
