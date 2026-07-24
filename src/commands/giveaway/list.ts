import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants';
import { getPrismaClient } from '../../database/postgresql/client';

export class GiveawayListCommand extends BaseCommand {
  constructor() {
    super({ name: 'glist', description: 'List all active giveaways in the server', category: 'giveaway', premiumTier: 'free', cooldown: 5, guildOnly: true, slashCommand: true, prefixCommand: true, aliases: ['giveaway-list', 'gw-list', 'giveaways'], examples: ['/glist', 'p!glist'] } as CommandOptions);
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    const prisma = getPrismaClient();
    const giveaways = await prisma.giveaway.findMany({ where: { guildId: i.guildId!, active: true }, orderBy: { endsAt: 'asc' } });

    if (!giveaways.length) { await i.editReply({ content: '📭 No active giveaways in this server.' }); return; }

    const embed = new EmbedBuilder().setTitle('🎉 Active Giveaways').setColor(COLORS.gold)
      .setDescription(giveaways.map((g, idx) => {
        const entryFetch = `<#${g.channelId}>`;
        return `**${idx + 1}.** ${g.prize}\n🎫 ID: \`${g.id}\` • ${entryFetch} • Ends: <t:${Math.floor(new Date(g.endsAt).getTime() / 1000)}:R> • 👥 ${g.winnerCount} winner(s)`;
      }).join('\n\n'))
      .setTimestamp();
    await i.editReply({ embeds: [embed] });
  }

  public async executePrefix(m: Message, args: string[]): Promise<void> {
    const prisma = getPrismaClient();
    const giveaways = await prisma.giveaway.findMany({ where: { guildId: m.guildId!, active: true }, orderBy: { endsAt: 'asc' } });
    if (!giveaways.length) { await m.reply('📭 No active giveaways.'); return; }
    const embed = new EmbedBuilder().setTitle('🎉 Active Giveaways').setColor(COLORS.gold)
      .setDescription(giveaways.map((g, i) => `**${i + 1}.** ${g.prize} — <#${g.channelId}> — Ends <t:${Math.floor(new Date(g.endsAt).getTime() / 1000)}:R>`).join('\n'));
    await m.reply({ embeds: [embed] });
  }
}
export default GiveawayListCommand;
