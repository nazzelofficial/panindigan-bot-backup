// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';

const SHOP_BADGES: Array<{ id: string; emoji: string; name: string; desc: string; price: number }> = [
  { id: 'heart_badge', emoji: '❤️', name: 'Heart', desc: 'A cosmetic heart badge for your profile', price: 500 },
  { id: 'fire_badge', emoji: '🔥', name: 'Fire', desc: 'A blazing fire badge', price: 500 },
  { id: 'crown_badge', emoji: '👑', name: 'Crown', desc: 'A regal crown badge', price: 1000 },
  { id: 'star_badge', emoji: '⭐', name: 'Star', desc: 'A shining star badge', price: 750 },
  { id: 'diamond_badge', emoji: '💎', name: 'Diamond', desc: 'A sparkling diamond badge', price: 2000 },
  { id: 'rainbow_badge', emoji: '🌈', name: 'Rainbow', desc: 'A colorful rainbow badge', price: 1500 },
];

export class BadgeShopCommand extends BaseCommand {
  constructor() {
    super({ name: 'badgeshop', description: 'Buy cosmetic badges for your profile (Diamond) 🛒', category: 'social', premiumTier: 'diamond', cooldown: 5, guildOnly: true, slashCommand: true, prefixCommand: true, aliases: ['buybadge', 'badgestore'], examples: ['/badgeshop', '/badgeshop buy heart_badge', 'p!badgeshop'] } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder().setName(this.name).setDescription(this.description)
      .addSubcommand(s => s.setName('list').setDescription('Browse available badges'))
      .addSubcommand(s => s.setName('buy').setDescription('Purchase a badge')
        .addStringOption(o => o.setName('badge').setDescription('Badge ID to buy').setRequired(true)
          .addChoices(...SHOP_BADGES.map(b => ({ name: `${b.emoji} ${b.name} (${b.price} coins)`, value: b.id })))))
      .setDMPermission(false)) as SlashCommandBuilder;
  }

  private async handle(sub: string, userId: string, badgeId: string | null, send: (c: any) => Promise<any>): Promise<void> {
    const prisma = getPrismaClient();

    if (sub === 'list' || !sub) {
      const embed = new EmbedBuilder()
        .setTitle('🛒 Badge Shop')
        .setDescription(SHOP_BADGES.map(b => `${b.emoji} **${b.name}** — ${b.price} coins\n> ${b.desc}`).join('\n\n'))
        .setColor(COLORS.diamond)
        .setFooter({ text: 'Use /badgeshop buy <badge_id> to purchase • Badges are cosmetic only' })
        .setTimestamp();
      await send({ embeds: [embed] });

    } else if (sub === 'buy') {
      const badge = SHOP_BADGES.find(b => b.id === badgeId);
      if (!badge) { await send({ content: '❌ Invalid badge.', ephemeral: true }); return; }

      const userData = await prisma.user.findUnique({ where: { userId } }).catch(() => null);
      const balance = (userData as any)?.wallet || 0;
      const ownedBadges: string[] = (userData as any)?.badges || [];

      if (ownedBadges.includes(badge.id)) { await send({ content: `❌ You already own the **${badge.name}** badge!`, ephemeral: true }); return; }
      if (balance < badge.price) { await send({ content: `❌ Insufficient funds! You need **${badge.price}** coins but only have **${balance}**.`, ephemeral: true }); return; }

      await prisma.user.update({
        where: { userId },
        data: {
          wallet: { decrement: badge.price },
          badges: { push: badge.id } as any,
        } as any,
      }).catch(() => null);

      const embed = new EmbedBuilder()
        .setTitle('✅ Badge Purchased!')
        .setDescription(`You bought the ${badge.emoji} **${badge.name}** badge for **${badge.price}** coins!\n\nUse \`/badge\` to view your badge collection.`)
        .setColor(COLORS.success)
        .setTimestamp();
      await send({ embeds: [embed] });
    }
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    const sub = i.options.getSubcommand(false) || 'list';
    await this.handle(sub, i.user.id, i.options.getString('badge'), (c) => i.reply(c));
  }

  public async executePrefix(m: Message, _args: string[]): Promise<void> {
    const sub = args[0]?.toLowerCase() === 'buy' ? 'buy' : 'list';
    const badgeId = sub === 'buy' ? args[1] : null;
    await this.handle(sub, m.author.id, badgeId, (c) => m.reply(c));
  }
}
export default BadgeShopCommand;
