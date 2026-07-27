// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { getMongoDb } from '../../database/mongodb/client.js';
export class TopChannelsCommand extends BaseCommand {
    constructor() {
        super({
            name: 'topchannels',
            description: 'View the most active channels in this server (Gold+)',
            category: 'info',
            premiumTier: 'gold',
            cooldown: 30,
            guildOnly: true,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['activechannels', 'channelstats'],
            examples: ['/topchannels', 'p!topchannels'],
        });
    }
    async buildEmbed(guild) {
        try {
            const db = getMongoDb();
            const logs = db.collection('event_logs');
            const pipeline = [
                { $match: { guildId: guild.id, type: 'MESSAGE_CREATE', createdAt: { $gte: new Date(Date.now() - 30 * 86400000) } } },
                { $group: { _id: '$channelId', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 10 },
            ];
            const results = await logs.aggregate(pipeline).toArray().catch(() => []);
            if (!results.length) {
                return new EmbedBuilder()
                    .setTitle(`📊 Top Active Channels — ${guild.name}`)
                    .setColor(COLORS.gold)
                    .setDescription('No message activity data available yet.\nActivity logging will populate this over time.');
            }
            const total = results.reduce((s, r) => s + r.count, 0);
            const list = results.map((r, i) => {
                const ch = guild.channels.cache.get(r._id);
                const name = ch ? `<#${r._id}>` : `\`${r._id}\``;
                const pct = ((r.count / total) * 100).toFixed(1);
                return `**${i + 1}.** ${name} — **${r.count.toLocaleString()}** messages (${pct}%)`;
            }).join('\n');
            return new EmbedBuilder()
                .setTitle(`📊 Top Active Channels — ${guild.name}`)
                .setColor(COLORS.gold)
                .setDescription(list)
                .addFields({ name: '📨 Total Messages (30d)', value: total.toLocaleString(), inline: true })
                .setFooter({ text: 'Gold tier analytics • Last 30 days' })
                .setTimestamp();
        }
        catch {
            // Fallback: show channels by type if no analytics data
            const textChannels = guild.channels.cache.filter((c) => c.type === 0);
            const list = [...textChannels.values()].slice(0, 10)
                .map((c, i) => `**${i + 1}.** <#${c.id}> — Activity data unavailable`).join('\n');
            return new EmbedBuilder()
                .setTitle(`📊 Top Active Channels — ${guild.name}`)
                .setColor(COLORS.gold)
                .setDescription(list || 'No text channels found.')
                .setFooter({ text: 'Gold tier analytics • Enable activity logging for full stats' })
                .setTimestamp();
        }
    }
    async executeSlash(interaction) {
        await interaction.deferReply();
        const embed = await this.buildEmbed(interaction.guild);
        await interaction.editReply({ embeds: [embed] });
    }
    async executePrefix(message) {
        if (!message.guild)
            return;
        const msg = await message.reply(`${EMOJIS.loading} Fetching channel stats...`);
        const embed = await this.buildEmbed(message.guild);
        await msg.edit({ content: null, embeds: [embed] });
    }
}
export default TopChannelsCommand;
