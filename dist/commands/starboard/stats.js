// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import { getCollection } from '../../database/mongodb/client.js';
import { getPrismaClient } from '../../database/postgresql/client.js';
export class StarboardStatsCommand extends BaseCommand {
    constructor() {
        super({ name: 'starboard-stats', description: 'View starboard statistics for this server', category: 'starboard', premiumTier: 'free', cooldown: 5, guildOnly: true, slashCommand: true, prefixCommand: true, aliases: ['sb-stats', 'sbstats'], examples: ['/starboard-stats'] });
    }
    async executeSlash(i) {
        await i.deferReply();
        const col = getCollection('starboard');
        const [total, totalStarResult, topMsg] = await Promise.all([
            col.countDocuments({ guildId: i.guildId }),
            col.aggregate([{ $match: { guildId: i.guildId } }, { $group: { _id: null, sum: { $sum: '$starCount' } } }]).toArray(),
            col.find({ guildId: i.guildId }).sort({ starCount: -1 }).limit(1).toArray(),
        ]);
        const totalStars = totalStarResult[0]?.sum || 0;
        const prisma = getPrismaClient();
        const guild = await prisma.guild.findUnique({ where: { guildId: i.guildId } });
        const embed = new EmbedBuilder().setTitle('⭐ Starboard Stats').setColor(COLORS.gold)
            .addFields({ name: '📌 Total Starred Messages', value: `${total}`, inline: true }, { name: '⭐ Total Stars Given', value: `${totalStars}`, inline: true }, { name: '📋 Star Threshold', value: `${guild?.starboardThreshold || 3}`, inline: true }, { name: '📣 Starboard Channel', value: guild?.starboardChannelId ? `<#${guild.starboardChannelId}>` : 'Not set', inline: true }, { name: '🔒 Locked', value: guild?.starboardLocked ? '✅ Yes' : '❌ No', inline: true }, ...(topMsg[0] ? [{ name: '🏆 Most Starred', value: `[Jump](${topMsg[0].jumpUrl || '#'}) — ${topMsg[0].starCount} ⭐`, inline: true }] : [])).setTimestamp();
        await i.editReply({ embeds: [embed] });
    }
    async executePrefix(m) {
        const col = getCollection('starboard');
        const total = await col.countDocuments({ guildId: m.guildId });
        const embed = new EmbedBuilder().setTitle('⭐ Starboard Stats').setColor(COLORS.gold)
            .addFields({ name: '📌 Starred Messages', value: `${total}`, inline: true });
        await m.reply({ embeds: [embed] });
    }
}
export default StarboardStatsCommand;
