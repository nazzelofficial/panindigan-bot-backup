// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class VoiceDeafenCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'voicedeafen',
            description: 'Deafen a user in voice channels',
            category: 'moderation',
            cooldown: 3,
            userPermissions: [PermissionFlagsBits.MuteMembers],
            botPermissions: [PermissionFlagsBits.MuteMembers],
            guildOnly: true,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['vdeafen', 'vcdeafen'],
            examples: ['/voicedeafen @user', 'p!voicedeafen @user'],
        };
        super(options);
    }
    async executeSlash(interaction) {
        const target = interaction.options.getUser('target');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        if (!target) {
            await interaction.reply({ content: '❌ Please provide a user to voice deafen.', ephemeral: true });
            return;
        }
        if (target.id === interaction.user.id) {
            await interaction.reply({ content: '❌ You cannot voice deafen yourself.', ephemeral: true });
            return;
        }
        if (!interaction.guild)
            return;
        const member = await interaction.guild.members.fetch(target.id).catch(() => null);
        if (!member) {
            await interaction.reply({ content: '❌ User not found in server.', ephemeral: true });
            return;
        }
        if (!member.voice.channel) {
            await interaction.reply({ content: '❌ User is not in a voice channel.', ephemeral: true });
            return;
        }
        if (!member.moderatable) {
            await interaction.reply({ content: '❌ I cannot voice deafen this user due to role hierarchy.', ephemeral: true });
            return;
        }
        try {
            await member.voice.setDeaf(true, reason);
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.moderation} User Voice Deafened`)
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
            await interaction.reply({ content: '❌ Failed to voice deafen user.', ephemeral: true });
        }
    }
    async executePrefix(message, _args) {
        const target = message.mentions.users.first();
        const reason = _args.slice(1).join(' ') || 'No reason provided';
        if (!target) {
            await message.reply('❌ Please mention a user to voice deafen.');
            return;
        }
        if (target.id === message.author.id) {
            await message.reply('❌ You cannot voice deafen yourself.');
            return;
        }
        if (!message.guild)
            return;
        const member = await message.guild.members.fetch(target.id).catch(() => null);
        if (!member) {
            await message.reply('❌ User not found in server.');
            return;
        }
        if (!member.voice.channel) {
            await message.reply('❌ User is not in a voice channel.');
            return;
        }
        if (!member.moderatable) {
            await message.reply('❌ I cannot voice deafen this user due to role hierarchy.');
            return;
        }
        try {
            await member.voice.setDeaf(true, reason);
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.moderation} User Voice Deafened`)
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
            await message.reply('❌ Failed to voice deafen user.');
        }
    }
}
export default VoiceDeafenCommand;
