// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';
export class WarnsCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'warns',
            description: 'View warnings for a user',
            category: 'moderation',
            cooldown: 3,
            userPermissions: [PermissionFlagsBits.ModerateMembers],
            botPermissions: [PermissionFlagsBits.ModerateMembers],
            guildOnly: true,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['warnings', 'warnlist'],
            examples: ['/warns @user', 'p!warns @user'],
        };
        super(options);
    }
    async executeSlash(interaction) {
        const target = interaction.options.getUser('target');
        if (!target) {
            await interaction.reply({ content: '❌ Please provide a user to check warnings.', ephemeral: true });
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
            const warnings = user?.moderation?.warnings || 0;
            const cases = user?.moderation?.cases || [];
            const warnCases = cases.filter((c) => c.action === 'warn');
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.moderation} Warnings for ${target.tag}`)
                .setColor(COLORS.info)
                .addFields([
                { name: 'User', value: `${target.tag} (${target.id})`, inline: true },
                { name: 'Total Warnings', value: `${warnings}/10`, inline: true },
            ])
                .setTimestamp();
            if (warnCases.length > 0) {
                const recentWarns = warnCases.slice(-5).reverse();
                let warnList = '';
                recentWarns.forEach((c, index) => {
                    warnList += `**#${warnCases.length - index}** - ${c.reason}\n`;
                });
                embed.addField('Recent Warnings', warnList.substring(0, 1024));
            }
            else {
                embed.addField('Recent Warnings', 'No warnings');
            }
            await interaction.reply({ embeds: [embed] });
        }
        catch (error) {
            await interaction.reply({ content: '❌ Failed to fetch warnings.', ephemeral: true });
        }
    }
    async executePrefix(message, _args) {
        const target = message.mentions.users.first();
        if (!target) {
            await message.reply('❌ Please mention a user to check warnings.');
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
            const warnings = user?.moderation?.warnings || 0;
            const cases = user?.moderation?.cases || [];
            const warnCases = cases.filter((c) => c.action === 'warn');
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.moderation} Warnings for ${target.tag}`)
                .setColor(COLORS.info)
                .addFields([
                { name: 'User', value: `${target.tag} (${target.id})`, inline: true },
                { name: 'Total Warnings', value: `${warnings}/10`, inline: true },
            ])
                .setTimestamp();
            if (warnCases.length > 0) {
                const recentWarns = warnCases.slice(-5).reverse();
                let warnList = '';
                recentWarns.forEach((c, index) => {
                    warnList += `**#${warnCases.length - index}** - ${c.reason}\n`;
                });
                embed.addField('Recent Warnings', warnList.substring(0, 1024));
            }
            else {
                embed.addField('Recent Warnings', 'No warnings');
            }
            await message.reply({ embeds: [embed] });
        }
        catch (error) {
            await message.reply('❌ Failed to fetch warnings.');
        }
    }
}
export default WarnsCommand;
