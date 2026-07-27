// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import { getCollection } from '../../database/mongodb/client.js';
import { getPrismaClient } from '../../database/postgresql/client.js';

export class AnalyticsAccessCommand extends BaseCommand {
  constructor() {
    super({ name: 'analyticsaccess', description: 'Access your personal analytics dashboard (Gold+)', category: 'premium', premiumTier: 'gold', cooldown: 10, guildOnly: false, slashCommand: true, prefixCommand: true, aliases: ['myanalytics', 'personalanalytics'], examples: ['/analyticsaccess'] } as CommandOptions);
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply({ ephemeral: true });
    const col = getCollection('event_logs');
    const prisma = getPrismaClient();
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const month = new Date(); month.setDate(1); month.setHours(0, 0, 0, 0);

    const [cmdToday, cmdMonth, aiTotal, userProfiles] = await Promise.all([
      col.countDocuments({ userId: i.user.id, type: 'command', createdAt: { $gte: today } }),
      col.countDocuments({ userId: i.user.id, type: 'command', createdAt: { $gte: month } }),
      getCollection('ai_requests').countDocuments({ userId: i.user.id }),
      prisma.user.findMany({ where: { userId: i.user.id }, select: { guildId: true, xp: true, level: true, walletBalance: true } }),
    ]);

    const totalXp = userProfiles.reduce((a, u) => a + (u.xp || 0), 0);
    const avgLevel = userProfiles.length ? userProfiles.reduce((a, u) => a + (u.level || 0), 0) / userProfiles.length : 0;
    const totalBalance = userProfiles.reduce((a, u) => a + (u.walletBalance || 0), 0);

    const embed = new EmbedBuilder().setTitle('📊 Personal Analytics').setColor(COLORS.gold)
      .setThumbnail(i.user.displayAvatarURL({ size: 64 }))
      .addFields(
        { name: '📋 Commands Today', value: `${cmdToday}`, inline: true },
        { name: '📅 Commands This Month', value: `${cmdMonth}`, inline: true },
        { name: '🤖 Total AI Requests', value: `${aiTotal}`, inline: true },
        { name: '⭐ Total XP', value: `${totalXp.toLocaleString()}`, inline: true },
        { name: '📈 Avg Level', value: `${avgLevel.toFixed(1)}`, inline: true },
        { name: '💰 Total Balance', value: `₱${totalBalance.toLocaleString()}`, inline: true },
        { name: '🌐 Servers Tracked', value: `${userProfiles.length}`, inline: true },
      )
      .setTimestamp();
    await i.editReply({ embeds: [embed] });
  }

  public async executePrefix(m: Message): Promise<void> {
    const col = getCollection('event_logs');
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const count = await col.countDocuments({ userId: m.author.id, type: 'command', createdAt: { $gte: today } });
    await m.reply(`📊 **Your Analytics:** ${count} commands used today.`);
  }
}
export default AnalyticsAccessCommand;
