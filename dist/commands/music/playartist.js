// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class PlayArtistCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'playartist',
            description: 'Play top songs by an artist',
            category: 'music',
            cooldown: 5,
            userPermissions: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
            botPermissions: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
            guildOnly: true,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['artist', 'artisttop'],
            examples: ['/playartist artist name', 'p!playartist artist name'],
        };
        super(options);
    }
    async executeSlash(interaction) {
        const artist = interaction.options.getString('artist');
        if (!artist) {
            await interaction.reply({ content: '❌ Please provide an artist name.', ephemeral: true });
            return;
        }
        if (!interaction.member || !interaction.guild)
            return;
        const voiceChannel = interaction.member.voice.channel;
        if (!voiceChannel) {
            await interaction.reply({ content: '❌ You need to be in a voice channel to play artist songs.', ephemeral: true });
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
            if (player && player.voiceChannel !== voiceChannel.id) {
                await interaction.editReply({ content: '❌ I\'m already playing in another voice channel.' });
                return;
            }
            const tracks = await musicManager.searchArtist(artist);
            if (!tracks || tracks.length === 0) {
                await interaction.editReply({ content: '❌ No songs found for that artist.' });
                return;
            }
            if (!player) {
                await client.kazagumo.createPlayer({ guildId: interaction.guild.id, voiceId: voiceChannel.id, textId: interaction.channel.id, volume: 80, deaf: true });
            }
            player.queue.add(tracks);
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.music} Artist Songs Added to Queue`)
                .setColor(COLORS.success)
                .addFields([
                { name: 'Artist', value: artist, inline: true },
                { name: 'Songs', value: tracks.length.toString(), inline: true },
                { name: 'Requested by', value: interaction.user.tag, inline: false },
            ])
                .setTimestamp();
            await interaction.editReply({ embeds: [embed] });
        }
        catch (error) {
            await interaction.editReply({ content: '❌ Failed to play artist songs.' });
        }
    }
    async executePrefix(message, _args) {
        const artist = _args.join(' ');
        if (!artist) {
            await message.reply('❌ Please provide an artist name.');
            return;
        }
        if (!message.member || !message.guild)
            return;
        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) {
            await message.reply('❌ You need to be in a voice channel to play artist songs.');
            return;
        }
        try {
            await message.reply('🎵 Searching for artist...');
            const client = message.client;
            const musicManager = client.kazagumo;
            if (!musicManager) {
                await message.edit('❌ Music system is not available.');
                return;
            }
            const player = client.kazagumo.players.get(message.guild.id);
            if (player && player.voiceChannel !== voiceChannel.id) {
                await message.edit('❌ I\'m already playing in another voice channel.');
                return;
            }
            const tracks = await musicManager.searchArtist(artist);
            if (!tracks || tracks.length === 0) {
                await message.edit('❌ No songs found for that artist.');
                return;
            }
            if (!player) {
                await client.kazagumo.createPlayer({ guildId: message.guild.id, voiceId: voiceChannel.id, textId: message.channel.id, volume: 80, deaf: true });
            }
            player.queue.add(tracks);
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.music} Artist Songs Added to Queue`)
                .setColor(COLORS.success)
                .addFields([
                { name: 'Artist', value: artist, inline: true },
                { name: 'Songs', value: tracks.length.toString(), inline: true },
                { name: 'Requested by', value: message.author.tag, inline: false },
            ])
                .setTimestamp();
            await message.edit({ embeds: [embed] });
        }
        catch (error) {
            await message.edit('❌ Failed to play artist songs.');
        }
    }
}
export default PlayArtistCommand;
