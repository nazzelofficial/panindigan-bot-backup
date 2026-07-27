// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class UptimeCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'uptime',
            description: 'Display the bot uptime',
            category: 'info',
            cooldown: 5,
            userPermissions: [],
            botPermissions: [],
            guildOnly: false,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['up'],
            examples: ['/uptime', 'p!uptime'],
        };
        super(options);
    }
    async executeSlash(interaction) {
        const uptime = this.formatUptime(interaction.client.uptime);
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.info} ⏱️ Uptime`)
            .setColor(COLORS.info)
            .setDescription(uptime)
            .setTimestamp();
        await interaction.reply({ embeds: [embed] });
    }
    async executePrefix(message) {
        const uptime = this.formatUptime(message.client.uptime);
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.info} ⏱️ Uptime`)
            .setColor(COLORS.info)
            .setDescription(uptime)
            .setTimestamp();
        await message.reply({ embeds: [embed] });
    }
    formatUptime(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        const d = days;
        const h = hours % 24;
        const m = minutes % 60;
        const s = seconds % 60;
        return `${d}d ${h}h ${m}m ${s}s`;
    }
}
export default UptimeCommand;
