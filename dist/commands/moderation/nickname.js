// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class NicknameCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'nickname',
            description: 'Change a user\'s nickname',
            category: 'moderation',
            cooldown: 3,
            userPermissions: [PermissionFlagsBits.ManageNicknames],
            botPermissions: [PermissionFlagsBits.ManageNicknames],
            guildOnly: true,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['nick', 'setnick'],
            examples: ['/nickname @user New Name', 'p!nickname @user New Name'],
        };
        super(options);
    }
    async executeSlash(interaction) {
        const target = interaction.options.getUser('target');
        const nickname = interaction.options.getString('nickname');
        if (!target) {
            await interaction.reply({ content: '❌ Please provide a user to change nickname.', ephemeral: true });
            return;
        }
        if (!nickname) {
            await interaction.reply({ content: '❌ Please provide a new nickname.', ephemeral: true });
            return;
        }
        if (nickname.length > 32) {
            await interaction.reply({ content: '❌ Nickname cannot exceed 32 characters.', ephemeral: true });
            return;
        }
        if (!interaction.guild)
            return;
        const member = await interaction.guild.members.fetch(target.id).catch(() => null);
        if (!member) {
            await interaction.reply({ content: '❌ User not found in server.', ephemeral: true });
            return;
        }
        if (!member.manageable) {
            await interaction.reply({ content: '❌ I cannot change this user\'s nickname due to role hierarchy.', ephemeral: true });
            return;
        }
        try {
            await member.setNickname(nickname);
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.success} Nickname Changed`)
                .setColor(COLORS.success)
                .addFields([
                { name: 'User', value: `${target.tag} (${target.id})`, inline: true },
                { name: 'Moderator', value: interaction.user.tag, inline: true },
                { name: 'New Nickname', value: nickname, inline: false },
            ])
                .setTimestamp();
            await interaction.reply({ embeds: [embed] });
        }
        catch (error) {
            await interaction.reply({ content: '❌ Failed to change nickname.', ephemeral: true });
        }
    }
    async executePrefix(message, _args) {
        const target = message.mentions.users.first();
        const nickname = _args.slice(1).join(' ');
        if (!target) {
            await message.reply('❌ Please mention a user to change nickname.');
            return;
        }
        if (!nickname) {
            await message.reply('❌ Please provide a new nickname.');
            return;
        }
        if (nickname.length > 32) {
            await message.reply('❌ Nickname cannot exceed 32 characters.');
            return;
        }
        if (!message.guild)
            return;
        const member = await message.guild.members.fetch(target.id).catch(() => null);
        if (!member) {
            await message.reply('❌ User not found in server.');
            return;
        }
        if (!member.manageable) {
            await message.reply('❌ I cannot change this user\'s nickname due to role hierarchy.');
            return;
        }
        try {
            await member.setNickname(nickname);
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.success} Nickname Changed`)
                .setColor(COLORS.success)
                .addFields([
                { name: 'User', value: `${target.tag} (${target.id})`, inline: true },
                { name: 'Moderator', value: message.author.tag, inline: true },
                { name: 'New Nickname', value: nickname, inline: false },
            ])
                .setTimestamp();
            await message.reply({ embeds: [embed] });
        }
        catch (error) {
            await message.reply('❌ Failed to change nickname.');
        }
    }
}
export default NicknameCommand;
