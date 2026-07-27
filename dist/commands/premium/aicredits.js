// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import { getCollection } from '../../database/mongodb/client.js';
export class AiCreditsCommand extends BaseCommand {
    constructor() {
        super({ name: 'aicredits', description: 'Check your AI usage credits', category: 'premium', premiumTier: 'free', cooldown: 5, guildOnly: false, slashCommand: true, prefixCommand: true, aliases: ['aiusage', 'aitokens'], examples: ['/aicredits'] });
    }
    async executeSlash(i) {
        const col = getCollection('ai_requests');
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const [todayCount, totalCount] = await Promise.all([
            col.countDocuments({ userId: i.user.id, createdAt: { $gte: today } }),
            col.countDocuments({ userId: i.user.id }),
        ]);
        const premiumTier = i.member?.premiumTier || 'free';
        const dailyLimits = { free: 20, bronze: 100, silver: 300, gold: 1000, diamond: 5000 };
        const dailyLimit = dailyLimits[premiumTier] || 20;
        const remaining = Math.max(0, dailyLimit - todayCount);
        const embed = new EmbedBuilder().setTitle('🤖 AI Credits').setColor(COLORS.info)
            .addFields({ name: '📅 Used Today', value: `${todayCount} / ${dailyLimit}`, inline: true }, { name: '✨ Remaining', value: `${remaining}`, inline: true }, { name: '📊 Total Requests', value: `${totalCount}`, inline: true }, { name: '💎 Your Tier', value: premiumTier.charAt(0).toUpperCase() + premiumTier.slice(1), inline: true })
            .setFooter({ text: 'Credits reset at midnight UTC' });
        await i.reply({ embeds: [embed], ephemeral: true });
    }
    async executePrefix(m) {
        const col = getCollection('ai_requests');
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayCount = await col.countDocuments({ userId: m.author.id, createdAt: { $gte: today } });
        await m.reply(`🤖 **AI Credits:** Used **${todayCount}** requests today. Resets at midnight UTC.`);
    }
}
export default AiCreditsCommand;
