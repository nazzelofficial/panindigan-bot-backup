// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class PlayMixCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'playmix',
            description: 'Play a mix of songs based on a genre or mood',
            category: 'music',
            cooldown: 5,
            userPermissions: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
            botPermissions: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
            guildOnly: true,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['mix', 'genre'],
            examples: ['/playmix pop', 'p!playmix rock'],
        };
        super(options);
    }
    async executeSlash(interaction) {
        const genre = interaction.options.getString('genre') || 'pop';
        if (!interaction.member || !interaction.guild)
            return;
        const voiceChannel = interaction.member.voice.channel;
        if (!voiceChannel) {
            await interaction.reply({ content: '❌ You need to be in a voice channel to play music.', ephemeral: true });
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
            const tracks = await musicManager.getMix(genre);
            if (!tracks || tracks.length === 0) {
                await interaction.editReply({ content: '❌ No tracks found for that genre.' });
                return;
            }
            if (!player) {
                await client.kazagumo.createPlayer({ guildId: interaction.guild.id, voiceId: voiceChannel.id, textId: interaction.channel.id, volume: 80, deaf: true });
            }
            await musicManager.playMix(interaction.guild.id, tracks);
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.music} Mix Playing`)
                .setColor(COLORS.success)
                .addFields([
                { name: 'Genre', value: genre, inline: true },
                { name: 'Tracks', value: tracks.length.toString(), inline: true },
                { name: 'Requested by', value: interaction.user.tag, inline: false },
            ])
                .setTimestamp();
            await interaction.editReply({ embeds: [embed] });
        }
        catch (error) {
            await interaction.editReply({ content: '❌ Failed to play the mix.' });
        }
    }
    async executePrefix(message, _args) {
        const genre = args[0] || 'pop';
        if (!message.member || !message.guild)
            return;
        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) {
            await message.reply('❌ You need to be in a voice channel to play music.');
            return;
        }
        try {
            await message.reply('🎵 Loading mix...');
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
            const tracks = await musicManager.getMix(genre);
            if (!tracks || tracks.length === 0) {
                await message.edit('❌ No tracks found for that genre.');
                return;
            }
            if (!player) {
                await client.kazagumo.createPlayer({ guildId: message.guild.id, voiceId: voiceChannel.id, textId: message.channel.id, volume: 80, deaf: true });
            }
            await musicManager.playMix(message.guild.id, tracks);
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.music} Mix Playing`)
                .setColor(COLORS.success)
                .addFields([
                { name: 'Genre', value: genre, inline: true },
                { name: 'Tracks', value: tracks.length.toString(), inline: true },
                { name: 'Requested by', value: message.author.tag, inline: false },
            ])
                .setTimestamp();
            await message.edit({ embeds: [embed] });
        }
        catch (error) {
            await message.edit('❌ Failed to play the mix.');
        }
    }
}
export default PlayMixCommand;
