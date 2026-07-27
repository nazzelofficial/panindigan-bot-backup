// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';
export class UnignoreUserCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'unignoreuser',
            description: 'Stop ignoring commands from a specific user',
            category: 'admin',
            cooldown: 3,
            userPermissions: [PermissionFlagsBits.Administrator],
            botPermissions: [PermissionFlagsBits.ManageGuild],
            guildOnly: true,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['userunignore'],
            examples: ['/unignoreuser @user', 'p!unignoreuser @user'],
        };
        super(options);
    }
    async executeSlash(interaction) {
        const user = interaction.options.getUser('user');
        if (!user) {
            await interaction.reply({ content: '❌ Please provide a user to unignore.', ephemeral: true });
            return;
        }
        if (!interaction.guild)
            return;
        const prisma = getPrismaClient();
        const guild = await prisma.guild.findUnique({
            where: { guildId: interaction.guild.id },
        });
        const ignoredUsers = guild?.ignoredUsers || [];
        if (!ignoredUsers.includes(user.id)) {
            await interaction.reply({ content: '❌ This user is not ignored.', ephemeral: true });
            return;
        }
        await prisma.guild.update({
            where: { guildId: interaction.guild.id },
            data: { ignoredUsers: ignoredUsers.filter(u => u !== user.id) },
        });
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.success} User Unignored`)
            .setColor(COLORS.success)
            .addFields([
            { name: 'User', value: `${user.tag} (${user.id})`, inline: true },
            { name: 'Unignored by', value: interaction.user.tag, inline: true },
        ])
            .setTimestamp();
        await interaction.reply({ embeds: [embed] });
    }
    async executePrefix(message, _args) {
        const user = message.mentions.users.first();
        if (!user) {
            await message.reply('❌ Please mention a user to unignore.');
            return;
        }
        if (!message.guild)
            return;
        const prisma = getPrismaClient();
        const guild = await prisma.guild.findUnique({
            where: { guildId: message.guild.id },
        });
        const ignoredUsers = guild?.ignoredUsers || [];
        if (!ignoredUsers.includes(user.id)) {
            await message.reply('❌ This user is not ignored.');
            return;
        }
        await prisma.guild.update({
            where: { guildId: message.guild.id },
            data: { ignoredUsers: ignoredUsers.filter(u => u !== user.id) },
        });
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.success} User Unignored`)
            .setColor(COLORS.success)
            .addFields([
            { name: 'User', value: `${user.tag} (${user.id})`, inline: true },
            { name: 'Unignored by', value: message.author.tag, inline: true },
        ])
            .setTimestamp();
        await message.reply({ embeds: [embed] });
    }
}
export default UnignoreUserCommand;
