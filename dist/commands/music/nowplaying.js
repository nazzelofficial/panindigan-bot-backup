// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class NowPlayingCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'nowplaying',
            description: 'View the currently playing song',
            category: 'music',
            cooldown: 5,
            userPermissions: [PermissionFlagsBits.Connect],
            botPermissions: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
            guildOnly: true,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['np', 'current'],
            examples: ['/nowplaying', 'p!np'],
        };
        super(options);
    }
    async executeSlash(interaction) {
        if (!interaction.guild)
            return;
        try {
            const client = interaction.client;
            const musicManager = client.kazagumo;
            if (!musicManager) {
                await interaction.reply({ content: '❌ Music system is not available.', ephemeral: true });
                return;
            }
            const player = client.kazagumo.players.get(interaction.guild.id);
            if (!player || !player.queue.current) {
                await interaction.reply({ content: '❌ Nothing is currently playing.', ephemeral: true });
                return;
            }
            const track = player.queue.current;
            const progressBar = this.createProgressBar(player.position, track.duration);
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.music} Now Playing`)
                .setColor(COLORS.info)
                .addFields([
                { name: 'Track', value: track.title, inline: false },
                { name: 'Artist', value: track.artist || 'Unknown', inline: true },
                { name: 'Duration', value: track.duration || 'Unknown', inline: true },
                { name: 'Requested by', value: track.requestedBy || 'Unknown', inline: true },
                { name: 'Progress', value: progressBar, inline: false },
            ])
                .setThumbnail(track.thumbnail || null)
                .setTimestamp();
            await interaction.reply({ embeds: [embed] });
        }
        catch (error) {
            await interaction.reply({ content: '❌ Failed to fetch now playing info.', ephemeral: true });
        }
    }
    async executePrefix(message) {
        if (!message.guild)
            return;
        try {
            const client = message.client;
            const musicManager = client.kazagumo;
            if (!musicManager) {
                await message.reply('❌ Music system is not available.');
                return;
            }
            const player = client.kazagumo.players.get(message.guild.id);
            if (!player || !player.queue.current) {
                await message.reply('❌ Nothing is currently playing.');
                return;
            }
            const track = player.queue.current;
            const progressBar = this.createProgressBar(player.position, track.duration);
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.music} Now Playing`)
                .setColor(COLORS.info)
                .addFields([
                { name: 'Track', value: track.title, inline: false },
                { name: 'Artist', value: track.artist || 'Unknown', inline: true },
                { name: 'Duration', value: track.duration || 'Unknown', inline: true },
                { name: 'Requested by', value: track.requestedBy || 'Unknown', inline: true },
                { name: 'Progress', value: progressBar, inline: false },
            ])
                .setThumbnail(track.thumbnail || null)
                .setTimestamp();
            await message.reply({ embeds: [embed] });
        }
        catch (error) {
            await message.reply('❌ Failed to fetch now playing info.');
        }
    }
    createProgressBar(position, duration) {
        if (!duration)
            return '⏸️ Unknown duration';
        const parts = duration.split(':').map(Number);
        let totalSeconds = 0;
        if (parts.length === 2) {
            totalSeconds = parts[0] * 60 + parts[1];
        }
        else if (parts.length === 3) {
            totalSeconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
        }
        const percentage = Math.min(100, Math.max(0, (position / totalSeconds) * 100));
        const filled = Math.round(percentage / 5);
        const empty = 20 - filled;
        return '▶️ ' + '█'.repeat(filled) + '░'.repeat(empty) + ` ${Math.round(percentage)}%`;
    }
}
export default NowPlayingCommand;
