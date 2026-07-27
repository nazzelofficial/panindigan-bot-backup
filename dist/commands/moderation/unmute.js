// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';
export class UnmuteCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'unmute',
            description: 'Unmute a user in the server',
            category: 'moderation',
            cooldown: 3,
            userPermissions: [PermissionFlagsBits.ModerateMembers],
            botPermissions: [PermissionFlagsBits.ModerateMembers],
            guildOnly: true,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['unsilence', 'untimeout'],
            examples: ['/unmute @user', 'p!unmute @user'],
        };
        super(options);
    }
    async executeSlash(interaction) {
        const target = interaction.options.getUser('target');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        if (!target) {
            await interaction.reply({ content: '❌ Please provide a user to unmute.', ephemeral: true });
            return;
        }
        if (!interaction.guild)
            return;
        const member = await interaction.guild.members.fetch(target.id).catch(() => null);
        if (!member) {
            await interaction.reply({ content: '❌ User not found in server.', ephemeral: true });
            return;
        }
        if (!member.isCommunicationDisabled()) {
            await interaction.reply({ content: '❌ This user is not muted.', ephemeral: true });
            return;
        }
        try {
            await member.timeout(null, reason);
            const prisma = getPrismaClient();
            await prisma.moderation.upsert({
                where: { userId_guildId: { userId: target.id, guildId: interaction.guild.id } },
                update: {
                    isMuted: false,
                    muteExpiresAt: null,
                    cases: {
                        push: {
                            action: 'unmute',
                            moderatorId: interaction.user.id,
                            reason,
                            timestamp: new Date(),
                        },
                    },
                },
                create: {
                    userId: target.id,
                    guildId: interaction.guild.id,
                    isMuted: false,
                    cases: [{
                            action: 'unmute',
                            moderatorId: interaction.user.id,
                            reason,
                            timestamp: new Date(),
                        }],
                },
            });
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.success} User Unmuted`)
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
            await interaction.reply({ content: '❌ Failed to unmute user.', ephemeral: true });
        }
    }
    async executePrefix(message, _args) {
        const target = message.mentions.users.first();
        const reason = _args.slice(1).join(' ') || 'No reason provided';
        if (!target) {
            await message.reply('❌ Please mention a user to unmute.');
            return;
        }
        if (!message.guild)
            return;
        const member = await message.guild.members.fetch(target.id).catch(() => null);
        if (!member) {
            await message.reply('❌ User not found in server.');
            return;
        }
        if (!member.isCommunicationDisabled()) {
            await message.reply('❌ This user is not muted.');
            return;
        }
        try {
            await member.timeout(null, reason);
            const prisma = getPrismaClient();
            await prisma.moderation.upsert({
                where: { userId_guildId: { userId: target.id, guildId: message.guild.id } },
                update: {
                    isMuted: false,
                    muteExpiresAt: null,
                    cases: {
                        push: {
                            action: 'unmute',
                            moderatorId: message.author.id,
                            reason,
                            timestamp: new Date(),
                        },
                    },
                },
                create: {
                    userId: target.id,
                    guildId: message.guild.id,
                    isMuted: false,
                    cases: [{
                            action: 'unmute',
                            moderatorId: message.author.id,
                            reason,
                            timestamp: new Date(),
                        }],
                },
            });
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.success} User Unmuted`)
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
            await message.reply('❌ Failed to unmute user.');
        }
    }
}
export default UnmuteCommand;
