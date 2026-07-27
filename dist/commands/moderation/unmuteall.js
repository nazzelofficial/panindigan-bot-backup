// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class UnmuteAllCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'unmuteall',
            description: 'Unmute all users in the current voice channel',
            category: 'moderation',
            cooldown: 10,
            userPermissions: [PermissionFlagsBits.MuteMembers],
            botPermissions: [PermissionFlagsBits.MuteMembers],
            guildOnly: true,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['unmutemembers'],
            examples: ['/unmuteall', 'p!unmuteall'],
        };
        super(options);
    }
    async executeSlash(interaction) {
        const reason = interaction.options.getString('reason') || 'Mass unmute';
        if (!interaction.member || !interaction.guild)
            return;
        const voiceChannel = interaction.member.voice?.channel;
        if (!voiceChannel) {
            await interaction.reply({ content: '❌ You must be in a voice channel to use this command.', ephemeral: true });
            return;
        }
        const membersToUnmute = voiceChannel.members.filter(m => !m.user.bot && m.voice.serverMute);
        if (membersToUnmute.size === 0) {
            await interaction.reply({ content: '❌ No members to unmute in this channel.', ephemeral: true });
            return;
        }
        await interaction.deferReply();
        let unmuted = 0;
        let failed = 0;
        for (const member of membersToUnmute.values()) {
            try {
                await member.voice.setMute(false, reason);
                unmuted++;
            }
            catch {
                failed++;
            }
        }
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.success} Voice Unmute Complete`)
            .setColor(COLORS.success)
            .addFields([
            { name: 'Unmuted', value: unmuted.toString(), inline: true },
            { name: 'Failed', value: failed.toString(), inline: true },
            { name: 'Total', value: membersToUnmute.size.toString(), inline: true },
            { name: 'Moderator', value: interaction.user.tag, inline: false },
        ])
            .setTimestamp();
        await interaction.editReply({ embeds: [embed] });
    }
    async executePrefix(message, _args) {
        const reason = _args.slice(0).join(' ') || 'Mass unmute';
        if (!message.member || !message.guild)
            return;
        const voiceChannel = message.member.voice?.channel;
        if (!voiceChannel) {
            await message.reply('❌ You must be in a voice channel to use this command.');
            return;
        }
        const membersToUnmute = voiceChannel.members.filter(m => !m.user.bot && m.voice.serverMute);
        if (membersToUnmute.size === 0) {
            await message.reply('❌ No members to unmute in this channel.');
            return;
        }
        await message.reply('Starting mass voice unmute...');
        let unmuted = 0;
        let failed = 0;
        for (const member of membersToUnmute.values()) {
            try {
                await member.voice.setMute(false, reason);
                unmuted++;
            }
            catch {
                failed++;
            }
        }
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.success} Voice Unmute Complete`)
            .setColor(COLORS.success)
            .addFields([
            { name: 'Unmuted', value: unmuted.toString(), inline: true },
            { name: 'Failed', value: failed.toString(), inline: true },
            { name: 'Total', value: membersToUnmute.size.toString(), inline: true },
            { name: 'Moderator', value: message.author.tag, inline: false },
        ])
            .setTimestamp();
        await message.channel.send({ embeds: [embed] });
    }
}
export default UnmuteAllCommand;
