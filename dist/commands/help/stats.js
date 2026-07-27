// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class StatsCommand extends BaseCommand {
    constructor() {
        super({ name: 'stats', description: 'View detailed bot statistics and uptime 📊', category: 'help', premiumTier: 'free', cooldown: 10, guildOnly: false, slashCommand: true, prefixCommand: true, aliases: ['botstats', 'botinfo2', 'status'], examples: ['/stats', 'p!stats'] });
    }
    bytesToMb(bytes) {
        return (bytes / 1024 / 1024).toFixed(2) + ' MB';
    }
    formatUptime(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        const parts = [];
        if (days > 0)
            parts.push(`${days}d`);
        if (hours % 24 > 0)
            parts.push(`${hours % 24}h`);
        if (minutes % 60 > 0)
            parts.push(`${minutes % 60}m`);
        parts.push(`${seconds % 60}s`);
        return parts.join(' ');
    }
    async buildEmbed(client) {
        const mem = process.memoryUsage();
        const uptime = client.uptime ?? 0;
        const ping = client.ws.ping;
        const totalGuilds = client.guilds.cache.size;
        const totalMembers = client.guilds.cache.reduce((acc, g) => acc + (g.memberCount || 0), 0);
        const totalChannels = client.channels.cache.size;
        const commandCount = client.commands?.size ?? 0;
        return new EmbedBuilder()
            .setTitle(`${EMOJIS.info} Panindigan Bot Statistics`)
            .setColor(COLORS.info)
            .setThumbnail(client.user?.displayAvatarURL() || null)
            .addFields({ name: '⚡ Performance', value: [
                `**Ping:** ${ping}ms`,
                `**Uptime:** ${this.formatUptime(uptime)}`,
                `**Node.js:** ${process.version}`,
            ].join('\n'), inline: true }, { name: '💾 Memory Usage', value: [
                `**Heap Used:** ${this.bytesToMb(mem.heapUsed)}`,
                `**Heap Total:** ${this.bytesToMb(mem.heapTotal)}`,
                `**RSS:** ${this.bytesToMb(mem.rss)}`,
            ].join('\n'), inline: true }, { name: '🌐 Coverage', value: [
                `**Servers:** ${totalGuilds.toLocaleString()}`,
                `**Members:** ${totalMembers.toLocaleString()}`,
                `**Channels:** ${totalChannels.toLocaleString()}`,
            ].join('\n'), inline: true }, { name: '🤖 Bot Info', value: [
                `**Commands:** ${commandCount}`,
                `**Version:** v${client.config?.bot?.version || '0.1.0'}`,
                `**Discord.js:** v14`,
            ].join('\n'), inline: true }, { name: '📅 Started', value: `<t:${Math.floor((Date.now() - uptime) / 1000)}:F>`, inline: true }, { name: '🔰 Shard', value: `${client.shard?.ids?.[0] ?? 0}/${(client.shard?.count ?? 1) - 1}`, inline: true })
            .setFooter({ text: 'Panindigan • All-in-One Discord Bot' })
            .setTimestamp();
    }
    async executeSlash(i) {
        const embed = await this.buildEmbed(i.client);
        await i.reply({ embeds: [embed] });
    }
    async executePrefix(m, _args) {
        const embed = await this.buildEmbed(m.client);
        await m.reply({ embeds: [embed] });
    }
}
export default StatsCommand;
