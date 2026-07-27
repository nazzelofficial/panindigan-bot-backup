// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';
export class LoadQueueCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'loadqueue',
            description: 'Load a saved playlist into the queue',
            category: 'music',
            cooldown: 5,
            userPermissions: [PermissionFlagsBits.Connect],
            botPermissions: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
            guildOnly: true,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['load', 'lq'],
            examples: ['/loadqueue myplaylist', 'p!loadqueue myplaylist'],
        };
        super(options);
    }
    async executeSlash(interaction) {
        const name = interaction.options.getString('name');
        if (!name) {
            await interaction.reply({ content: '❌ Please provide a playlist name.', ephemeral: true });
            return;
        }
        if (!interaction.guild || !interaction.member)
            return;
        const voiceChannel = interaction.member.voice.channel;
        if (!voiceChannel) {
            await interaction.reply({ content: '❌ You need to be in a voice channel to load a playlist.', ephemeral: true });
            return;
        }
        if (!interaction.guildId)
            return;
        try {
            const prisma = getPrismaClient();
            const playlist = await prisma.playlist.findFirst({
                where: { name, guildId: interaction.guildId },
            });
            if (!playlist) {
                await interaction.reply({ content: '❌ Playlist not found.', ephemeral: true });
                return;
            }
            const songs = JSON.parse(playlist.songs);
            const client = interaction.client;
            const musicManager = client.kazagumo;
            if (!musicManager) {
                await interaction.reply({ content: '❌ Music system is not available.', ephemeral: true });
                return;
            }
            const player = client.kazagumo.players.get(interaction.guild.id);
            if (!player) {
                await client.kazagumo.createPlayer({ guildId: interaction.guild.id, voiceId: voiceChannel.id, textId: interaction.channel.id, volume: 80, deaf: true });
            }
            player.queue.add(songs);
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.success} Playlist Loaded`)
                .setColor(COLORS.success)
                .addFields([
                { name: 'Playlist', value: playlist.name, inline: true },
                { name: 'Songs', value: songs.length.toString(), inline: true },
                { name: 'Loaded by', value: interaction.user.tag, inline: false },
            ])
                .setTimestamp();
            await interaction.reply({ embeds: [embed] });
        }
        catch (error) {
            await interaction.reply({ content: '❌ Failed to load queue.', ephemeral: true });
        }
    }
    async executePrefix(message, _args) {
        const name = args[0];
        if (!name) {
            await message.reply('❌ Please provide a playlist name.');
            return;
        }
        if (!message.guild || !message.member)
            return;
        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) {
            await message.reply('❌ You need to be in a voice channel to load a playlist.');
            return;
        }
        if (!message.guildId)
            return;
        try {
            const prisma = getPrismaClient();
            const playlist = await prisma.playlist.findFirst({
                where: { name, guildId: message.guildId },
            });
            if (!playlist) {
                await message.reply('❌ Playlist not found.');
                return;
            }
            const songs = JSON.parse(playlist.songs);
            const client = message.client;
            const musicManager = client.kazagumo;
            if (!musicManager) {
                await message.reply('❌ Music system is not available.');
                return;
            }
            const player = client.kazagumo.players.get(message.guild.id);
            if (!player) {
                await client.kazagumo.createPlayer({ guildId: message.guild.id, voiceId: voiceChannel.id, textId: message.channel.id, volume: 80, deaf: true });
            }
            player.queue.add(songs);
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.success} Playlist Loaded`)
                .setColor(COLORS.success)
                .addFields([
                { name: 'Playlist', value: playlist.name, inline: true },
                { name: 'Songs', value: songs.length.toString(), inline: true },
                { name: 'Loaded by', value: message.author.tag, inline: false },
            ])
                .setTimestamp();
            await message.reply({ embeds: [embed] });
        }
        catch (error) {
            await message.reply('❌ Failed to load queue.');
        }
    }
}
export default LoadQueueCommand;
