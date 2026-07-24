import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants';
import { getPrismaClient } from '../../database/postgresql/client';

export class PremiumHistoryCommand extends BaseCommand {
  constructor() {
    super({ name: 'premium-history', description: 'View your premium subscription history', category: 'premium', premiumTier: 'free', cooldown: 5, guildOnly: false, slashCommand: true, prefixCommand: true, aliases: ['premiumlog', 'myhistory'], examples: ['/premium-history'] } as CommandOptions);
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    const prisma = getPrismaClient();
    const premium = await prisma.premium.findMany({ where: { userId: i.user.id }, orderBy: { activatedAt: 'desc' } });
    if (!premium.length) {
      const embed = new EmbedBuilder().setTitle('📜 Premium History').setColor(COLORS.default)
        .setDescription('You have no premium history. Use `/premium` to upgrade!');
      await i.reply({ embeds: [embed], ephemeral: true });
      return;
    }
    const embed = new EmbedBuilder().setTitle('📜 Premium History').setColor(COLORS.gold)
      .setDescription(premium.map(p => `**${(p.tier || 'unknown').toUpperCase()}**\nActivated: <t:${Math.floor(new Date(p.activatedAt || Date.now()).getTime() / 1000)}:D>${p.expiresAt ? `\nExpires: <t:${Math.floor(new Date(p.expiresAt).getTime() / 1000)}:D>` : ' (Permanent)'}\nGuild: ${p.guildId || 'N/A'}`).join('\n\n'))
      .setTimestamp();
    await i.reply({ embeds: [embed], ephemeral: true });
  }

  public async executePrefix(m: Message): Promise<void> {
    const prisma = getPrismaClient();
    const premium = await prisma.premium.findMany({ where: { userId: m.author.id }, orderBy: { activatedAt: 'desc' }, take: 5 });
    if (!premium.length) { await m.reply('📭 No premium history.'); return; }
    const embed = new EmbedBuilder().setTitle('📜 Premium History').setColor(COLORS.gold)
      .setDescription(premium.map(p => `**${(p.tier || '?').toUpperCase()}** — ${p.guildId || 'Global'}`).join('\n'));
    await m.reply({ embeds: [embed] });
  }
}
export default PremiumHistoryCommand;
