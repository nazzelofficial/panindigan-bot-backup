// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { Formatter } from '../../utils/Formatter.js';
import { getPrismaClient } from '../../database/postgresql/client.js';
export class UserInfoCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'userinfo',
            description: 'View detailed information about a user',
            category: 'moderation',
            cooldown: 3,
            userPermissions: [PermissionFlagsBits.ModerateMembers],
            botPermissions: [PermissionFlagsBits.ModerateMembers],
            guildOnly: true,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['whois', 'user'],
            examples: ['/userinfo @user', 'p!userinfo @user'],
        };
        super(options);
    }
    async executeSlash(interaction) {
        const target = interaction.options.getUser('target') || interaction.user;
        if (!interaction.guild)
            return;
        const member = await interaction.guild.members.fetch(target.id).catch(() => null);
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.info} User Information`)
            .setColor(COLORS.info)
            .setThumbnail(target.displayAvatarURL())
            .addFields([
            { name: 'User', value: `${target.tag} (${target.id})`, inline: true },
            { name: 'Created', value: Formatter.formatDate(target.createdAt), inline: true },
            { name: 'Joined', value: member ? Formatter.formatDate(member.joinedAt) : 'Not in server', inline: true },
            { name: 'Roles', value: member ? member.roles.cache.size.toString() : '0', inline: true },
            { name: 'Bot', value: target.bot ? 'Yes' : 'No', inline: true },
        ])
            .setTimestamp();
        if (member) {
            const prisma = getPrismaClient();
            const user = await prisma.user.findUnique({
                where: { userId_guildId: { userId: target.id, guildId: interaction.guild.id } },
                include: { moderation: true },
            });
            if (user) {
                embed.addField('Balance', Formatter.formatCurrency(user.walletBalance + user.bankBalance), true);
                embed.addField('Level', user.level.toString(), true);
                embed.addField('XP', `${user.xp} XP`, true);
                if (user.moderation) {
                    embed.addField('Warnings', user.moderation.warnings.toString(), true);
                    embed.addField('Muted', user.moderation.isMuted ? 'Yes' : 'No', true);
                    embed.addField('Cases', user.moderation.cases.length.toString(), true);
                }
            }
        }
        await interaction.reply({ embeds: [embed] });
    }
    async executePrefix(message, _args) {
        const target = message.mentions.users.first() || message.author;
        if (!message.guild)
            return;
        const member = await message.guild.members.fetch(target.id).catch(() => null);
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.info} User Information`)
            .setColor(COLORS.info)
            .setThumbnail(target.displayAvatarURL())
            .addFields([
            { name: 'User', value: `${target.tag} (${target.id})`, inline: true },
            { name: 'Created', value: Formatter.formatDate(target.createdAt), inline: true },
            { name: 'Joined', value: member ? Formatter.formatDate(member.joinedAt) : 'Not in server', inline: true },
            { name: 'Roles', value: member ? member.roles.cache.size.toString() : '0', inline: true },
            { name: 'Bot', value: target.bot ? 'Yes' : 'No', inline: true },
        ])
            .setTimestamp();
        if (member) {
            const prisma = getPrismaClient();
            const user = await prisma.user.findUnique({
                where: { userId_guildId: { userId: target.id, guildId: message.guild.id } },
                include: { moderation: true },
            });
            if (user) {
                embed.addField('Balance', Formatter.formatCurrency(user.walletBalance + user.bankBalance), true);
                embed.addField('Level', user.level.toString(), true);
                embed.addField('XP', `${user.xp} XP`, true);
                if (user.moderation) {
                    embed.addField('Warnings', user.moderation.warnings.toString(), true);
                    embed.addField('Muted', user.moderation.isMuted ? 'Yes' : 'No', true);
                    embed.addField('Cases', user.moderation.cases.length.toString(), true);
                }
            }
        }
        await message.reply({ embeds: [embed] });
    }
}
export default UserInfoCommand;
