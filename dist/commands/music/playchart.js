// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class PlayChartCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'playchart',
            description: 'Play songs from music charts',
            category: 'music',
            cooldown: 5,
            userPermissions: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
            botPermissions: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
            guildOnly: true,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['chart', 'top100'],
            examples: ['/playchart', 'p!playchart'],
        };
        super(options);
    }
    async executeSlash(interaction) {
        const chart = interaction.options.getString('chart') || 'top100';
        if (!interaction.member || !interaction.guild)
            return;
        const voiceChannel = interaction.member.voice.channel;
        if (!voiceChannel) {
            await interaction.reply({ content: '❌ You need to be in a voice channel to play chart songs.', ephemeral: true });
            return;
        }
        try {
            await interaction.deferReply();
            const client = interaction.client;
            const musicManager = client.kazagumo;
            if (!musicManager) {
                await interaction.editReply({ content: '❌ Music system is not available.' });
                return;
            }
            const player = client.kazagumo.players.get(interaction.guild.id);
            if (player && player.voiceId !== voiceChannel.id) {
                await interaction.editReply({ content: '❌ I\'m already playing in another voice channel.' });
                return;
            }
            const tracks = await musicManager.getChart(chart);
            if (!tracks || tracks.length === 0) {
                await interaction.editReply({ content: '❌ No songs found for that chart.' });
                return;
            }
            if (!player) {
                await client.kazagumo.createPlayer({ guildId: interaction.guild.id, voiceId: voiceChannel.id, textId: interaction.channel.id, volume: 80, deaf: true });
            }
            player.queue.add(tracks);
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.music} Chart Songs Added to Queue`)
                .setColor(COLORS.success)
                .addFields([
                { name: 'Chart', value: chart, inline: true },
                { name: 'Songs', value: tracks.length.toString(), inline: true },
                { name: 'Requested by', value: interaction.user.tag, inline: false },
            ])
                .setTimestamp();
            await interaction.editReply({ embeds: [embed] });
        }
        catch (error) {
            await interaction.editReply({ content: '❌ Failed to play chart songs.' });
        }
    }
    async executePrefix(message, _args) {
        const chart = args[0] || 'top100';
        if (!message.member || !message.guild)
            return;
        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) {
            await message.reply('❌ You need to be in a voice channel to play chart songs.');
            return;
        }
        try {
            await message.reply('🎵 Loading chart...');
            const client = message.client;
            const musicManager = client.kazagumo;
            if (!musicManager) {
                await message.edit('❌ Music system is not available.');
                return;
            }
            const player = client.kazagumo.players.get(message.guild.id);
            if (player && player.voiceId !== voiceChannel.id) {
                await message.edit('❌ I\'m already playing in another voice channel.');
                return;
            }
            const tracks = await musicManager.getChart(chart);
            if (!tracks || tracks.length === 0) {
                await message.edit('❌ No songs found for that chart.');
                return;
            }
            if (!player) {
                await client.kazagumo.createPlayer({ guildId: message.guild.id, voiceId: voiceChannel.id, textId: message.channel.id, volume: 80, deaf: true });
            }
            player.queue.add(tracks);
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.music} Chart Songs Added to Queue`)
                .setColor(COLORS.success)
                .addFields([
                { name: 'Chart', value: chart, inline: true },
                { name: 'Songs', value: tracks.length.toString(), inline: true },
                { name: 'Requested by', value: message.author.tag, inline: false },
            ])
                .setTimestamp();
            await message.edit({ embeds: [embed] });
        }
        catch (error) {
            await message.edit('❌ Failed to play chart songs.');
        }
    }
}
export default PlayChartCommand;
