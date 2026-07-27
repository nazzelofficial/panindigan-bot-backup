// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class StereoCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'stereo',
            description: 'Apply stereo panning effect',
            category: 'music',
            cooldown: 3,
            userPermissions: [PermissionFlagsBits.Connect],
            botPermissions: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
            guildOnly: true,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['pan'],
            examples: ['/stereo', 'p!stereo'],
        };
        super(options);
    }
    async executeSlash(interaction) {
        if (!interaction.guild || !interaction.member)
            return;
        const voiceChannel = interaction.member.voice.channel;
        if (!voiceChannel) {
            await interaction.reply({ content: '❌ You need to be in a voice channel to apply stereo.', ephemeral: true });
            return;
        }
        try {
            const client = interaction.client;
            const musicManager = client.kazagumo;
            if (!musicManager) {
                await interaction.reply({ content: '❌ Music system is not available.', ephemeral: true });
                return;
            }
            const player = client.kazagumo.players.get(interaction.guild.id);
            if (!player) {
                await interaction.reply({ content: '❌ Nothing is currently playing.', ephemeral: true });
                return;
            }
            if (player.voiceChannel !== voiceChannel.id) {
                await interaction.reply({ content: '❌ You need to be in the same voice channel as the bot.', ephemeral: true });
                return;
            }
            await player.setFilters('stereo');
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.music} Stereo Applied`)
                .setColor(COLORS.success)
                .addFields([
                { name: 'Applied by', value: interaction.user.tag, inline: true },
            ])
                .setTimestamp();
            await interaction.reply({ embeds: [embed] });
        }
        catch (error) {
            await interaction.reply({ content: '❌ Failed to apply stereo.', ephemeral: true });
        }
    }
    async executePrefix(message) {
        if (!message.guild || !message.member)
            return;
        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) {
            await message.reply('❌ You need to be in a voice channel to apply stereo.');
            return;
        }
        try {
            const client = message.client;
            const musicManager = client.kazagumo;
            if (!musicManager) {
                await message.reply('❌ Music system is not available.');
                return;
            }
            const player = client.kazagumo.players.get(message.guild.id);
            if (!player) {
                await message.reply('❌ Nothing is currently playing.');
                return;
            }
            if (player.voiceChannel !== voiceChannel.id) {
                await message.reply('❌ You need to be in the same voice channel as the bot.');
                return;
            }
            await player.setFilters('stereo');
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.music} Stereo Applied`)
                .setColor(COLORS.success)
                .addFields([
                { name: 'Applied by', value: message.author.tag, inline: true },
            ])
                .setTimestamp();
            await message.reply({ embeds: [embed] });
        }
        catch (error) {
            await message.reply('❌ Failed to apply stereo.');
        }
    }
}
export default StereoCommand;
