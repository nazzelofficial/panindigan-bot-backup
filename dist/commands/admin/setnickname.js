// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class SetNicknameCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'setnickname',
            description: 'Change a user\'s nickname in the server',
            category: 'admin',
            cooldown: 3,
            userPermissions: [PermissionFlagsBits.ManageNicknames],
            botPermissions: [PermissionFlagsBits.ManageNicknames],
            guildOnly: true,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['nick', 'rename'],
            examples: ['/setnickname @user NewName', 'p!setnickname @user NewName'],
        };
        super(options);
    }
    async executeSlash(interaction) {
        const user = interaction.options.getUser('user');
        const nickname = interaction.options.getString('nickname');
        if (!user) {
            await interaction.reply({ content: '❌ Please provide a user.', ephemeral: true });
            return;
        }
        if (!interaction.guild)
            return;
        const member = await interaction.guild.members.fetch(user.id).catch(() => null);
        if (!member) {
            await interaction.reply({ content: '❌ User not found in server.', ephemeral: true });
            return;
        }
        try {
            await member.setNickname(nickname || null, 'Nickname changed by ' + interaction.user.tag);
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.success} Nickname Updated`)
                .setColor(COLORS.success)
                .addFields([
                { name: 'User', value: `${user.tag} (${user.id})`, inline: true },
                { name: 'New Nickname', value: nickname || 'Reset to username', inline: true },
                { name: 'Updated by', value: interaction.user.tag, inline: true },
            ])
                .setTimestamp();
            await interaction.reply({ embeds: [embed] });
        }
        catch (error) {
            await interaction.reply({ content: '❌ Failed to update nickname. Check role hierarchy.', ephemeral: true });
        }
    }
    async executePrefix(message, _args) {
        const user = message.mentions.users.first();
        const nickname = _args.slice(1).join(' ');
        if (!user) {
            await message.reply('❌ Please mention a user.');
            return;
        }
        if (!message.guild)
            return;
        const member = await message.guild.members.fetch(user.id).catch(() => null);
        if (!member) {
            await message.reply('❌ User not found in server.');
            return;
        }
        try {
            await member.setNickname(nickname || null, 'Nickname changed by ' + message.author.tag);
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.success} Nickname Updated`)
                .setColor(COLORS.success)
                .addFields([
                { name: 'User', value: `${user.tag} (${user.id})`, inline: true },
                { name: 'New Nickname', value: nickname || 'Reset to username', inline: true },
                { name: 'Updated by', value: message.author.tag, inline: true },
            ])
                .setTimestamp();
            await message.reply({ embeds: [embed] });
        }
        catch (error) {
            await message.reply('❌ Failed to update nickname. Check role hierarchy.');
        }
    }
}
export default SetNicknameCommand;
