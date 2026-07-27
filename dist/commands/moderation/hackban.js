// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';
export class HackBanCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'hackban',
            description: 'Ban a user by ID (even if they are not in the server)',
            category: 'moderation',
            cooldown: 3,
            userPermissions: [PermissionFlagsBits.BanMembers],
            botPermissions: [PermissionFlagsBits.BanMembers],
            guildOnly: true,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['idban', 'forceban'],
            examples: ['/hackban 123456789012345678', 'p!hackban 123456789012345678'],
        };
        super(options);
    }
    async executeSlash(interaction) {
        const userId = interaction.options.getString('user_id');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        if (!userId) {
            await interaction.reply({ content: '❌ Please provide a user ID.', ephemeral: true });
            return;
        }
        if (!/^\d{17,20}$/.test(userId)) {
            await interaction.reply({ content: '❌ Invalid user ID format.', ephemeral: true });
            return;
        }
        if (!interaction.guild)
            return;
        try {
            await interaction.guild.bans.create(userId, { reason });
            const prisma = getPrismaClient();
            await prisma.moderation.upsert({
                where: { userId_guildId: { userId, guildId: interaction.guild.id } },
                update: {
                    cases: {
                        push: {
                            action: 'hackban',
                            moderatorId: interaction.user.id,
                            reason,
                            timestamp: new Date(),
                        },
                    },
                },
                create: {
                    userId,
                    guildId: interaction.guild.id,
                    cases: [{
                            action: 'hackban',
                            moderatorId: interaction.user.id,
                            reason,
                            timestamp: new Date(),
                        }],
                },
            });
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.moderation} User Hackbanned`)
                .setColor(COLORS.error)
                .addFields([
                { name: 'User ID', value: userId, inline: true },
                { name: 'Moderator', value: interaction.user.tag, inline: true },
                { name: 'Reason', value: reason, inline: false },
            ])
                .setTimestamp();
            await interaction.reply({ embeds: [embed] });
        }
        catch (error) {
            await interaction.reply({ content: '❌ Failed to hackban user. User may already be banned or ID is invalid.', ephemeral: true });
        }
    }
    async executePrefix(message, _args) {
        const userId = args[0];
        const reason = _args.slice(1).join(' ') || 'No reason provided';
        if (!userId) {
            await message.reply('❌ Please provide a user ID.');
            return;
        }
        if (!/^\d{17,20}$/.test(userId)) {
            await message.reply('❌ Invalid user ID format.');
            return;
        }
        if (!message.guild)
            return;
        try {
            await message.guild.bans.create(userId, { reason });
            const prisma = getPrismaClient();
            await prisma.moderation.upsert({
                where: { userId_guildId: { userId, guildId: message.guild.id } },
                update: {
                    cases: {
                        push: {
                            action: 'hackban',
                            moderatorId: message.author.id,
                            reason,
                            timestamp: new Date(),
                        },
                    },
                },
                create: {
                    userId,
                    guildId: message.guild.id,
                    cases: [{
                            action: 'hackban',
                            moderatorId: message.author.id,
                            reason,
                            timestamp: new Date(),
                        }],
                },
            });
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.moderation} User Hackbanned`)
                .setColor(COLORS.error)
                .addFields([
                { name: 'User ID', value: userId, inline: true },
                { name: 'Moderator', value: message.author.tag, inline: true },
                { name: 'Reason', value: reason, inline: false },
            ])
                .setTimestamp();
            await message.reply({ embeds: [embed] });
        }
        catch (error) {
            await message.reply('❌ Failed to hackban user. User may already be banned or ID is invalid.');
        }
    }
}
export default HackBanCommand;
