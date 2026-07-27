// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { Formatter } from '../../utils/Formatter.js';
export class UserInfoCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'userinfo',
            description: 'Display detailed information about a user',
            category: 'info',
            cooldown: 5,
            userPermissions: [],
            botPermissions: [],
            guildOnly: false,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['whois', 'ui', 'user'],
            examples: ['/userinfo', '/userinfo @user', 'p!userinfo @user'],
        };
        super(options);
    }
    async executeSlash(interaction) {
        const target = interaction.options.getUser('user') || interaction.user;
        const member = interaction.options.getMember('user');
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.info} User Information`)
            .setColor(COLORS.info)
            .setThumbnail(target.displayAvatarURL({ size: 256, extension: 'png' }))
            .addFields([
            { name: 'Username', value: target.username, inline: true },
            { name: 'Display Name', value: target.displayName, inline: true },
            { name: 'ID', value: target.id, inline: true },
            { name: 'Bot', value: target.bot ? 'Yes' : 'No', inline: true },
            { name: 'Created', value: Formatter.formatDate(target.createdAt), inline: true },
        ])
            .setTimestamp();
        if (member) {
            embed.addFields([
                { name: 'Joined Server', value: Formatter.formatDate(member.joinedAt), inline: true },
                { name: 'Roles', value: member.roles.cache.map(role => role.name).join(', ') || 'None', inline: false },
            ]);
        }
        await interaction.reply({ embeds: [embed] });
    }
    async executePrefix(message) {
        const target = message.mentions.users.first() || message.author;
        const member = message.mentions.members?.first() || message.member;
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.info} User Information`)
            .setColor(COLORS.info)
            .setThumbnail(target.displayAvatarURL({ size: 256, extension: 'png' }))
            .addFields([
            { name: 'Username', value: target.username, inline: true },
            { name: 'Display Name', value: target.displayName, inline: true },
            { name: 'ID', value: target.id, inline: true },
            { name: 'Bot', value: target.bot ? 'Yes' : 'No', inline: true },
            { name: 'Created', value: Formatter.formatDate(target.createdAt), inline: true },
        ])
            .setTimestamp();
        if (member && 'joinedAt' in member) {
            embed.addFields([
                { name: 'Joined Server', value: Formatter.formatDate(member.joinedAt), inline: true },
                { name: 'Roles', value: member.roles.cache.map(role => role.name).join(', ') || 'None', inline: false },
            ]);
        }
        await message.reply({ embeds: [embed] });
    }
}
export default UserInfoCommand;
