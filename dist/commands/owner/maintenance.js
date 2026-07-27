// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import getRedisClient from '../../database/redis/client.js';
export class MaintenanceCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'maintenance',
            description: 'Toggle maintenance mode on/off (Owner only)',
            category: 'owner',
            premiumTier: 'free',
            cooldown: 0,
            userPermissions: [],
            botPermissions: [],
            ownerOnly: true,
            guildOnly: false,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['maint'],
            examples: ['/maintenance on Scheduled update', '/maintenance off', 'p!maintenance on Scheduled update'],
        };
        super(options);
    }
    buildSlashCommand() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption(o => o.setName('state').setDescription('on or off').setRequired(true)
            .addChoices({ name: 'on', value: 'on' }, { name: 'off', value: 'off' }))
            .addStringOption(o => o.setName('reason').setDescription('Reason for maintenance').setRequired(false));
    }
    async toggleMaintenance(state, reason) {
        const redis = await getRedisClient();
        if (state === 'on') {
            await redis.set('maintenance:enabled', 'true');
            await redis.set('maintenance:reason', reason ?? 'Scheduled maintenance');
        }
        else {
            await redis.del('maintenance:enabled');
            await redis.del('maintenance:reason');
        }
    }
    async getMaintenanceStatus() {
        const redis = await getRedisClient();
        const enabled = await redis.get('maintenance:enabled');
        const reason = await redis.get('maintenance:reason');
        return { enabled: enabled === 'true', reason };
    }
    async executeSlash(interaction) {
        const state = interaction.options.getString('state', true);
        const reason = interaction.options.getString('reason') ?? undefined;
        await interaction.deferReply({ ephemeral: true });
        try {
            await this.toggleMaintenance(state, reason);
            const status = await this.getMaintenanceStatus();
            const embed = new EmbedBuilder()
                .setTitle(`${state === 'on' ? EMOJIS.warning : EMOJIS.success} Maintenance Mode ${state === 'on' ? 'Enabled' : 'Disabled'}`)
                .setColor(state === 'on' ? COLORS.warning : COLORS.success)
                .addFields({ name: 'Status', value: status.enabled ? '🔴 ENABLED' : '🟢 DISABLED', inline: true }, { name: 'Reason', value: status.reason ?? 'None', inline: true })
                .setTimestamp();
            await interaction.editReply({ embeds: [embed] });
        }
        catch (error) {
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.error} Error`)
                .setColor(COLORS.error)
                .setDescription(`Failed to toggle maintenance: ${error?.message ?? 'Unknown error'}`)
                .setTimestamp();
            await interaction.editReply({ embeds: [embed] });
        }
    }
    async executePrefix(message, _args) {
        const [state, ...reasonParts] = _args;
        const reason = reasonParts.join(' ') || undefined;
        if (!state || !['on', 'off'].includes(state.toLowerCase())) {
            await message.reply(`${EMOJIS.error} Usage: \`p!maintenance <on|off> [reason]\``);
            return;
        }
        try {
            await this.toggleMaintenance(state.toLowerCase(), reason);
            const status = await this.getMaintenanceStatus();
            const embed = new EmbedBuilder()
                .setTitle(`${state === 'on' ? EMOJIS.warning : EMOJIS.success} Maintenance Mode ${state === 'on' ? 'Enabled' : 'Disabled'}`)
                .setColor(state === 'on' ? COLORS.warning : COLORS.success)
                .addFields({ name: 'Status', value: status.enabled ? '🔴 ENABLED' : '🟢 DISABLED', inline: true }, { name: 'Reason', value: status.reason ?? 'None', inline: true })
                .setTimestamp();
            await message.reply({ embeds: [embed] });
        }
        catch (error) {
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.error} Error`)
                .setColor(COLORS.error)
                .setDescription(`Failed to toggle maintenance: ${error?.message ?? 'Unknown error'}`)
                .setTimestamp();
            await message.reply({ embeds: [embed] });
        }
    }
}
export default MaintenanceCommand;
