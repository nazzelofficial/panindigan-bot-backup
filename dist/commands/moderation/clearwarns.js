// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';
export class ClearWarnsCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'clearwarns',
            description: 'Clear all warnings for a user',
            category: 'moderation',
            cooldown: 3,
            userPermissions: [PermissionFlagsBits.ModerateMembers],
            botPermissions: [PermissionFlagsBits.ModerateMembers],
            guildOnly: true,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['resetwarns', 'removewarns'],
            examples: ['/clearwarns @user', 'p!clearwarns @user'],
        };
        super(options);
    }
    async executeSlash(interaction) {
        const target = interaction.options.getUser('target');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        if (!target) {
            await interaction.reply({ content: '❌ Please provide a user to clear warnings.', ephemeral: true });
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
            if (!user || !user.moderation || user.moderation.warnings === 0) {
                await interaction.reply({ content: '❌ This user has no warnings.', ephemeral: true });
                return;
            }
            await prisma.moderation.update({
                where: { userId_guildId: { userId: target.id, guildId: interaction.guild.id } },
                data: {
                    warnings: 0,
                    cases: {
                        push: {
                            action: 'clearwarns',
                            moderatorId: interaction.user.id,
                            reason,
                            timestamp: new Date(),
                        },
                    },
                },
            });
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.success} Warnings Cleared`)
                .setColor(COLORS.success)
                .addFields([
                { name: 'User', value: `${target.tag} (${target.id})`, inline: true },
                { name: 'Moderator', value: interaction.user.tag, inline: true },
                { name: 'Reason', value: reason, inline: false },
            ])
                .setTimestamp();
            await interaction.reply({ embeds: [embed] });
        }
        catch (error) {
            await interaction.reply({ content: '❌ Failed to clear warnings.', ephemeral: true });
        }
    }
    async executePrefix(message, _args) {
        const target = message.mentions.users.first();
        const reason = _args.slice(1).join(' ') || 'No reason provided';
        if (!target) {
            await message.reply('❌ Please mention a user to clear warnings.');
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
            if (!user || !user.moderation || user.moderation.warnings === 0) {
                await message.reply('❌ This user has no warnings.');
                return;
            }
            await prisma.moderation.update({
                where: { userId_guildId: { userId: target.id, guildId: message.guild.id } },
                data: {
                    warnings: 0,
                    cases: {
                        push: {
                            action: 'clearwarns',
                            moderatorId: message.author.id,
                            reason,
                            timestamp: new Date(),
                        },
                    },
                },
            });
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.success} Warnings Cleared`)
                .setColor(COLORS.success)
                .addFields([
                { name: 'User', value: `${target.tag} (${target.id})`, inline: true },
                { name: 'Moderator', value: message.author.tag, inline: true },
                { name: 'Reason', value: reason, inline: false },
            ])
                .setTimestamp();
            await message.reply({ embeds: [embed] });
        }
        catch (error) {
            await message.reply('❌ Failed to clear warnings.');
        }
    }
}
export default ClearWarnsCommand;
