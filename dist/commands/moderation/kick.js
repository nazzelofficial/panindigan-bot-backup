// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';
export class KickCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'kick',
            description: 'Kick a user from the server',
            category: 'moderation',
            cooldown: 3,
            userPermissions: [PermissionFlagsBits.KickMembers],
            botPermissions: [PermissionFlagsBits.KickMembers],
            guildOnly: true,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['k'],
            examples: ['/kick @user', 'p!kick @user spamming'],
        };
        super(options);
    }
    async executeSlash(interaction) {
        const target = interaction.options.getUser('target');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        if (!target) {
            await interaction.reply({ content: '❌ Please provide a user to kick.', ephemeral: true });
            return;
        }
        if (target.id === interaction.user.id) {
            await interaction.reply({ content: '❌ You cannot kick yourself.', ephemeral: true });
            return;
        }
        if (target.id === interaction.client.user.id) {
            await interaction.reply({ content: '❌ I cannot kick myself.', ephemeral: true });
            return;
        }
        if (!interaction.guild)
            return;
        const member = await interaction.guild.members.fetch(target.id).catch(() => null);
        if (!member) {
            await interaction.reply({ content: '❌ User not found in server.', ephemeral: true });
            return;
        }
        if (!member.kickable) {
            await interaction.reply({ content: '❌ I cannot kick this user due to role hierarchy.', ephemeral: true });
            return;
        }
        try {
            await member.kick(reason);
            const prisma = getPrismaClient();
            await prisma.moderation.upsert({
                where: { userId_guildId: { userId: target.id, guildId: interaction.guild.id } },
                update: {
                    cases: {
                        push: {
                            action: 'kick',
                            moderatorId: interaction.user.id,
                            reason,
                            timestamp: new Date(),
                        },
                    },
                },
                create: {
                    userId: target.id,
                    guildId: interaction.guild.id,
                    cases: [{
                            action: 'kick',
                            moderatorId: interaction.user.id,
                            reason,
                            timestamp: new Date(),
                        }],
                },
            });
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.moderation} User Kicked`)
                .setColor(COLORS.warning)
                .addFields([
                { name: 'User', value: `${target.tag} (${target.id})`, inline: true },
                { name: 'Moderator', value: interaction.user.tag, inline: true },
                { name: 'Reason', value: reason, inline: false },
            ])
                .setTimestamp();
            await interaction.reply({ embeds: [embed] });
        }
        catch (error) {
            await interaction.reply({ content: '❌ Failed to kick user.', ephemeral: true });
        }
    }
    async executePrefix(message, _args) {
        const target = message.mentions.users.first();
        const reason = _args.slice(1).join(' ') || 'No reason provided';
        if (!target) {
            await message.reply('❌ Please mention a user to kick.');
            return;
        }
        if (target.id === message.author.id) {
            await message.reply('❌ You cannot kick yourself.');
            return;
        }
        if (!message.guild)
            return;
        const member = await message.guild.members.fetch(target.id).catch(() => null);
        if (!member) {
            await message.reply('❌ User not found in server.');
            return;
        }
        if (!member.kickable) {
            await message.reply('❌ I cannot kick this user due to role hierarchy.');
            return;
        }
        try {
            await member.kick(reason);
            const prisma = getPrismaClient();
            await prisma.moderation.upsert({
                where: { userId_guildId: { userId: target.id, guildId: message.guild.id } },
                update: {
                    cases: {
                        push: {
                            action: 'kick',
                            moderatorId: message.author.id,
                            reason,
                            timestamp: new Date(),
                        },
                    },
                },
                create: {
                    userId: target.id,
                    guildId: message.guild.id,
                    cases: [{
                            action: 'kick',
                            moderatorId: message.author.id,
                            reason,
                            timestamp: new Date(),
                        }],
                },
            });
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.moderation} User Kicked`)
                .setColor(COLORS.warning)
                .addFields([
                { name: 'User', value: `${target.tag} (${target.id})`, inline: true },
                { name: 'Moderator', value: message.author.tag, inline: true },
                { name: 'Reason', value: reason, inline: false },
            ])
                .setTimestamp();
            await message.reply({ embeds: [embed] });
        }
        catch (error) {
            await message.reply('❌ Failed to kick user.');
        }
    }
}
export default KickCommand;
