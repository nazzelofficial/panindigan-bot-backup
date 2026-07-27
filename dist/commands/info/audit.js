// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class AuditCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'audit',
            description: 'Display recent audit log entries',
            category: 'info',
            cooldown: 5,
            userPermissions: ['ViewAuditLog'],
            botPermissions: ['ViewAuditLog'],
            guildOnly: true,
            slashCommand: true,
            prefixCommand: true,
            aliases: [],
            examples: ['/audit', 'p!audit'],
        };
        super(options);
    }
    async executeSlash(interaction) {
        const guild = interaction.guild;
        try {
            const auditLogs = await guild.fetchAuditLogs({ limit: 10 });
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.info} 📋 Recent Audit Logs`)
                .setColor(COLORS.info)
                .setDescription('Last 10 audit log entries')
                .addFields(auditLogs.entries.slice(0, 5).map(entry => ({
                name: `${entry.action} - ${entry.executor.username}`,
                value: entry.target ? `${entry.target}` : 'N/A',
                inline: false,
            })))
                .setTimestamp();
            await interaction.reply({ embeds: [embed] });
        }
        catch (error) {
            const errorEmbed = new EmbedBuilder()
                .setTitle(`${EMOJIS.error} Error`)
                .setColor(COLORS.error)
                .setDescription('Could not fetch audit logs. Missing permissions.')
                .setTimestamp();
            await interaction.reply({ embeds: [errorEmbed] });
        }
    }
    async executePrefix(message) {
        const guild = message.guild;
        try {
            const auditLogs = await guild.fetchAuditLogs({ limit: 10 });
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.info} 📋 Recent Audit Logs`)
                .setColor(COLORS.info)
                .setDescription('Last 10 audit log entries')
                .addFields(auditLogs.entries.slice(0, 5).map(entry => ({
                name: `${entry.action} - ${entry.executor.username}`,
                value: entry.target ? `${entry.target}` : 'N/A',
                inline: false,
            })))
                .setTimestamp();
            await message.reply({ embeds: [embed] });
        }
        catch (error) {
            const errorEmbed = new EmbedBuilder()
                .setTitle(`${EMOJIS.error} Error`)
                .setColor(COLORS.error)
                .setDescription('Could not fetch audit logs. Missing permissions.')
                .setTimestamp();
            await message.reply({ embeds: [errorEmbed] });
        }
    }
}
export default AuditCommand;
