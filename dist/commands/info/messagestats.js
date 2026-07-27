// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { getCollection } from '../../database/mongodb/client.js';
export class MessageStatsCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'messagestats',
            description: 'Show message statistics for this server',
            category: 'info',
            cooldown: 10,
            userPermissions: [],
            botPermissions: [],
            guildOnly: true,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['msgstats', 'messages'],
            examples: ['/messagestats', 'p!messagestats'],
        };
        super(options);
    }
    buildSlashCommand() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .setDMPermission(false);
    }
    async executeSlash(interaction) {
        await interaction.deferReply();
        try {
            const guild = interaction.guild;
            // Try to get stats from MongoDB analytics collection
            let statsText = '';
            try {
                const collection = getCollection('bot_analytics');
                const stats = await collection.findOne({ guildId: guild.id, type: 'message_stats' });
                if (stats) {
                    statsText = [
                        `📨 Total Tracked: **${stats.totalMessages?.toLocaleString() || 0}**`,
                        `👤 Unique Users: **${stats.uniqueUsers || 0}**`,
                        `📅 Today: **${stats.todayMessages || 0}**`,
                        `📆 This Week: **${stats.weekMessages || 0}**`,
                    ].join('\n');
                }
            }
            catch { /* MongoDB optional */ }
            const embed = new EmbedBuilder()
                .setTitle(`📊 Message Stats — ${guild.name}`)
                .setColor(COLORS.info)
                .setDescription(statsText || 'Message tracking data will accumulate over time as members chat.\n\nStats are logged to MongoDB analytics collection.')
                .addFields({ name: '📝 Channels', value: `**${guild.channels.cache.filter(c => c.isTextBased()).size}** text channels`, inline: true }, { name: '👥 Members', value: `**${guild.memberCount}** members`, inline: true }, { name: '📅 Server Created', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`, inline: true })
                .setFooter({ text: 'Stats tracked via bot analytics' })
                .setTimestamp();
            await interaction.editReply({ embeds: [embed] });
        }
        catch (err) {
            await interaction.editReply({ content: `${EMOJIS.error} ${err.message || 'Failed to fetch message stats.'}` });
        }
    }
    async executePrefix(message, _args) {
        const guild = message.guild;
        const embed = new EmbedBuilder()
            .setTitle(`📊 Message Stats — ${guild.name}`)
            .setColor(COLORS.info)
            .addFields({ name: '📝 Text Channels', value: `**${guild.channels.cache.filter(c => c.isTextBased()).size}**`, inline: true }, { name: '👥 Members', value: `**${guild.memberCount}**`, inline: true })
            .setTimestamp();
        await message.reply({ embeds: [embed] });
    }
}
export default MessageStatsCommand;
