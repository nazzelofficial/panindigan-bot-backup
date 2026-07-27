// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder, } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class PlayCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'play',
            description: 'Play a song or add it to the queue',
            category: 'music',
            cooldown: 2,
            userPermissions: [],
            botPermissions: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
            guildOnly: true,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['p', 'music', 'pl'],
            examples: ['/play Never Gonna Give You Up', 'p!play https://youtube.com/watch?v=...'],
        };
        super(options);
    }
    buildSlashCommand() {
        return (new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption(opt => opt.setName('query').setDescription('Song name, URL, or search query').setRequired(true))
            .setDMPermission(false));
    }
    async getVoiceChannel(member) {
        return member?.voice?.channel ?? null;
    }
    formatDuration(ms) {
        if (!ms)
            return 'Live';
        const s = Math.floor(ms / 1000);
        const m = Math.floor(s / 60);
        const h = Math.floor(m / 60);
        if (h > 0)
            return `${h}:${String(m % 60).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
        return `${m}:${String(s % 60).padStart(2, '0')}`;
    }
    async executeSlash(interaction) {
        const client = interaction.client;
        const query = interaction.options.getString('query', true);
        if (!client.kazagumo) {
            await interaction.reply({ content: '❌ Music system is not available.', ephemeral: true });
            return;
        }
        const member = interaction.member;
        const voiceChannel = await this.getVoiceChannel(member);
        if (!voiceChannel) {
            await interaction.reply({ content: '❌ You need to be in a voice channel to play music.', ephemeral: true });
            return;
        }
        const guild = interaction.guild;
        const textChannel = interaction.channel;
        await interaction.deferReply();
        try {
            let player = client.kazagumo.players.get(guild.id);
            if (player && player.voiceId && player.voiceId !== voiceChannel.id) {
                await interaction.editReply({ content: '❌ I\'m already playing in another voice channel.' });
                return;
            }
            if (!player) {
                player = await client.kazagumo.createPlayer({
                    guildId: guild.id,
                    voiceId: voiceChannel.id,
                    textId: textChannel.id,
                    volume: 80,
                    deaf: true,
                });
            }
            const result = await player.search(query, { requester: interaction.user });
            if (!result || !result.tracks.length || result.type === 'ERROR') {
                await interaction.editReply({ content: '❌ No results found. Try a different query.' });
                return;
            }
            const isPlaylist = result.type === 'PLAYLIST';
            const tracks = isPlaylist ? result.tracks : [result.tracks[0]];
            player.queue.add(tracks);
            const track = tracks[0];
            const queueSize = player.queue.size + (player.queue.current ? 1 : 0);
            const position = isPlaylist ? 'Added playlist' : queueSize;
            const embed = new EmbedBuilder()
                .setColor(COLORS.default)
                .setTimestamp();
            if (isPlaylist) {
                embed
                    .setTitle(`${EMOJIS.music} Playlist Added`)
                    .addFields({ name: 'Playlist', value: result.playlistName || 'Unknown', inline: true }, { name: 'Tracks', value: `${tracks.length}`, inline: true }, { name: 'Requested by', value: interaction.user.toString(), inline: false });
            }
            else {
                embed
                    .setTitle(`${EMOJIS.music} ${player.playing || player.queue.current ? 'Added to Queue' : 'Now Playing'}`)
                    .addFields({ name: 'Track', value: `[${track.title}](${track.uri})`, inline: false }, { name: 'Artist', value: track.author || 'Unknown', inline: true }, { name: 'Duration', value: this.formatDuration(track.length ?? 0), inline: true }, { name: 'Requested by', value: interaction.user.toString(), inline: false });
                if (track.thumbnail)
                    embed.setThumbnail(track.thumbnail);
                if (player.playing || player.queue.current) {
                    embed.addFields({ name: 'Position in Queue', value: `#${position}`, inline: true });
                }
            }
            if (!player.playing && !player.paused)
                await player.play();
            await interaction.editReply({ embeds: [embed] });
        }
        catch (error) {
            console.error('Play command error:', error);
            await interaction.editReply({ content: '❌ Failed to play the song. Please try again.' });
        }
    }
    async executePrefix(message, _args) {
        const client = message.client;
        const query = _args.join(' ');
        if (!query) {
            await message.reply('❌ Please provide a song name or URL. Example: `p!play Never Gonna Give You Up`');
            return;
        }
        if (!client.kazagumo) {
            await message.reply('❌ Music system is not available.');
            return;
        }
        const member = message.member;
        const voiceChannel = await this.getVoiceChannel(member);
        if (!voiceChannel) {
            await message.reply('❌ You need to be in a voice channel to play music.');
            return;
        }
        const guild = message.guild;
        const searching = await message.reply('🎵 Searching...');
        try {
            let player = client.kazagumo.players.get(guild.id);
            if (player && player.voiceId && player.voiceId !== voiceChannel.id) {
                await searching.edit('❌ I\'m already playing in another voice channel.');
                return;
            }
            if (!player) {
                player = await client.kazagumo.createPlayer({
                    guildId: guild.id,
                    voiceId: voiceChannel.id,
                    textId: message.channel.id,
                    volume: 80,
                    deaf: true,
                });
            }
            const result = await player.search(query, { requester: message.author });
            if (!result || !result.tracks.length || result.type === 'ERROR') {
                await searching.edit('❌ No results found. Try a different query.');
                return;
            }
            const isPlaylist = result.type === 'PLAYLIST';
            const tracks = isPlaylist ? result.tracks : [result.tracks[0]];
            player.queue.add(tracks);
            const track = tracks[0];
            const queueSize = player.queue.size + (player.queue.current ? 1 : 0);
            const embed = new EmbedBuilder()
                .setColor(COLORS.default)
                .setTimestamp();
            if (isPlaylist) {
                embed
                    .setTitle(`${EMOJIS.music} Playlist Added`)
                    .addFields({ name: 'Playlist', value: result.playlistName || 'Unknown', inline: true }, { name: 'Tracks', value: `${tracks.length}`, inline: true }, { name: 'Requested by', value: message.author.toString(), inline: false });
            }
            else {
                embed
                    .setTitle(`${EMOJIS.music} ${player.playing || player.queue.current ? 'Added to Queue' : 'Now Playing'}`)
                    .addFields({ name: 'Track', value: `[${track.title}](${track.uri})`, inline: false }, { name: 'Artist', value: track.author || 'Unknown', inline: true }, { name: 'Duration', value: this.formatDuration(track.length ?? 0), inline: true }, { name: 'Requested by', value: message.author.toString(), inline: false });
                if (track.thumbnail)
                    embed.setThumbnail(track.thumbnail);
                if (player.playing || player.queue.current) {
                    embed.addFields({ name: 'Position in Queue', value: `#${queueSize}`, inline: true });
                }
            }
            if (!player.playing && !player.paused)
                await player.play();
            await searching.edit({ content: null, embeds: [embed] });
        }
        catch (error) {
            console.error('Play command error:', error);
            await searching.edit('❌ Failed to play the song. Please try again.');
        }
    }
}
export default PlayCommand;
