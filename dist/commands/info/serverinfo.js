// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { Formatter } from '../../utils/Formatter.js';
export class ServerInfoCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'serverinfo',
            description: 'Display detailed information about the server',
            category: 'info',
            cooldown: 5,
            userPermissions: [],
            botPermissions: [],
            guildOnly: true,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['si', 'guildinfo', 'server'],
            examples: ['/serverinfo', 'p!serverinfo'],
        };
        super(options);
    }
    async executeSlash(interaction) {
        const guild = interaction.guild;
        const owner = await guild.fetchOwner();
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.info} Server Information`)
            .setColor(COLORS.info)
            .setThumbnail(guild.iconURL({ size: 256, extension: 'png' }))
            .addFields([
            { name: 'Name', value: guild.name, inline: true },
            { name: 'ID', value: guild.id, inline: true },
            { name: 'Owner', value: owner.user.username, inline: true },
            { name: 'Members', value: Formatter.formatNumber(guild.memberCount), inline: true },
            { name: 'Roles', value: Formatter.formatNumber(guild.roles.cache.size), inline: true },
            { name: 'Channels', value: Formatter.formatNumber(guild.channels.cache.size), inline: true },
            { name: 'Created', value: Formatter.formatDate(guild.createdAt), inline: true },
            { name: 'Verification Level', value: guild.verificationLevel.toString(), inline: true },
        ])
            .setTimestamp();
        await interaction.reply({ embeds: [embed] });
    }
    async executePrefix(message) {
        const guild = message.guild;
        const owner = await guild.fetchOwner();
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.info} Server Information`)
            .setColor(COLORS.info)
            .setThumbnail(guild.iconURL({ size: 256, extension: 'png' }))
            .addFields([
            { name: 'Name', value: guild.name, inline: true },
            { name: 'ID', value: guild.id, inline: true },
            { name: 'Owner', value: owner.user.username, inline: true },
            { name: 'Members', value: Formatter.formatNumber(guild.memberCount), inline: true },
            { name: 'Roles', value: Formatter.formatNumber(guild.roles.cache.size), inline: true },
            { name: 'Channels', value: Formatter.formatNumber(guild.channels.cache.size), inline: true },
            { name: 'Created', value: Formatter.formatDate(guild.createdAt), inline: true },
            { name: 'Verification Level', value: guild.verificationLevel.toString(), inline: true },
        ])
            .setTimestamp();
        await message.reply({ embeds: [embed] });
    }
}
export default ServerInfoCommand;
