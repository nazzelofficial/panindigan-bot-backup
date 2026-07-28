// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';
export class HistoryCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'modhistory',
            description: 'View moderation history for a user',
            category: 'moderation',
            cooldown: 5,
            userPermissions: [PermissionFlagsBits.ModerateMembers],
            botPermissions: [PermissionFlagsBits.ModerateMembers],
            guildOnly: true,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['modhistory', 'cases', 'modlog'],
            examples: ['/history @user', 'p!history @user'],
        };
        super(options);
    }
    async executeSlash(interaction) {
        const target = interaction.options.getUser('target');
        if (!target) {
            await interaction.reply({ content: '❌ Please provide a user to check history.', ephemeral: true });
            return;
        }
        if (!interaction.guild)
            return;
        try {
            const prisma = getPrismaClient();
            const user = await prisma.user.findUnique({
                where: { userId_guildId: { userId: target.id, guildId: interaction.guild.id } },
                include: { moderation: true },
            });
            const cases = user?.moderation?.cases || [];
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.moderation} Moderation History for ${target.tag}`)
                .setColor(COLORS.info)
                .addFields([
                { name: 'User', value: `${target.tag} (${target.id})`, inline: true },
                { name: 'Total Cases', value: cases.length.toString(), inline: true },
            ])
                .setTimestamp();
            if (cases.length > 0) {
                const recentCases = cases.slice(-10).reverse();
                let caseList = '';
                recentCases.forEach((c, index) => {
                    const actionEmoji = this.getActionEmoji(c.action);
                    caseList += `${actionEmoji} **${c.action.toUpperCase()}** - ${c.reason}\n`;
                });
                embed.addField('Recent Cases', caseList.substring(0, 1024));
            }
            else {
                embed.addField('Recent Cases', 'No moderation history');
            }
            await interaction.reply({ embeds: [embed] });
        }
        catch (error) {
            await interaction.reply({ content: '❌ Failed to fetch moderation history.', ephemeral: true });
        }
    }
    async executePrefix(message, _args) {
        const target = message.mentions.users.first();
        if (!target) {
            await message.reply('❌ Please mention a user to check history.');
            return;
        }
        if (!message.guild)
            return;
        try {
            const prisma = getPrismaClient();
            const user = await prisma.user.findUnique({
                where: { userId_guildId: { userId: target.id, guildId: message.guild.id } },
                include: { moderation: true },
            });
            const cases = user?.moderation?.cases || [];
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.moderation} Moderation History for ${target.tag}`)
                .setColor(COLORS.info)
                .addFields([
                { name: 'User', value: `${target.tag} (${target.id})`, inline: true },
                { name: 'Total Cases', value: cases.length.toString(), inline: true },
            ])
                .setTimestamp();
            if (cases.length > 0) {
                const recentCases = cases.slice(-10).reverse();
                let caseList = '';
                recentCases.forEach((c, index) => {
                    const actionEmoji = this.getActionEmoji(c.action);
                    caseList += `${actionEmoji} **${c.action.toUpperCase()}** - ${c.reason}\n`;
                });
                embed.addField('Recent Cases', caseList.substring(0, 1024));
            }
            else {
                embed.addField('Recent Cases', 'No moderation history');
            }
            await message.reply({ embeds: [embed] });
        }
        catch (error) {
            await message.reply('❌ Failed to fetch moderation history.');
        }
    }
    getActionEmoji(action) {
        const emojis = {
            ban: '🔨',
            kick: '👢',
            mute: '🔇',
            unmute: '🔊',
            warn: '⚠️',
            unban: '🔓',
            clearwarns: '✅',
        };
        return emojis[action] || '📋';
    }
}
export default HistoryCommand;
