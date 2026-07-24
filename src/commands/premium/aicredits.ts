import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants';
import { getCollection } from '../../database/mongodb/client';

export class AiCreditsCommand extends BaseCommand {
  constructor() {
    super({ name: 'aicredits', description: 'Check your AI usage credits', category: 'premium', premiumTier: 'free', cooldown: 5, guildOnly: false, slashCommand: true, prefixCommand: true, aliases: ['aiusage', 'aitokens'], examples: ['/aicredits'] } as CommandOptions);
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    const col = getCollection('ai_requests');
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const [todayCount, totalCount] = await Promise.all([
      col.countDocuments({ userId: i.user.id, createdAt: { $gte: today } }),
      col.countDocuments({ userId: i.user.id }),
    ]);

    const premiumTier = (i.member as any)?.premiumTier || 'free';
    const dailyLimits: Record<string, number> = { free: 20, bronze: 100, silver: 300, gold: 1000, diamond: 5000 };
    const dailyLimit = dailyLimits[premiumTier] || 20;
    const remaining = Math.max(0, dailyLimit - todayCount);

    const embed = new EmbedBuilder().setTitle('🤖 AI Credits').setColor(COLORS.info)
      .addFields(
        { name: '📅 Used Today', value: `${todayCount} / ${dailyLimit}`, inline: true },
        { name: '✨ Remaining', value: `${remaining}`, inline: true },
        { name: '📊 Total Requests', value: `${totalCount}`, inline: true },
        { name: '💎 Your Tier', value: premiumTier.charAt(0).toUpperCase() + premiumTier.slice(1), inline: true },
      )
      .setFooter({ text: 'Credits reset at midnight UTC' });
    await i.reply({ embeds: [embed], ephemeral: true });
  }

  public async executePrefix(m: Message): Promise<void> {
    const col = getCollection('ai_requests');
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const todayCount = await col.countDocuments({ userId: m.author.id, createdAt: { $gte: today } });
    await m.reply(`🤖 **AI Credits:** Used **${todayCount}** requests today. Resets at midnight UTC.`);
  }
}
export default AiCreditsCommand;
