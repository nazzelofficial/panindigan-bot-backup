// @ts-nocheck
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, } from 'discord.js';
import { EmbedManager } from '../structures/EmbedManager.js';
export class MusicUIService {
    static PROGRESS_BAR_LENGTH = 20;
    createMusicPlayerEmbed(options) {
        const progress = this.createProgressBar(options.position, options.currentTrack.duration);
        const queueList = this.createQueueList(options.queue);
        const embed = new EmbedBuilder()
            .setTitle('🎵 Now Playing')
            .setDescription(`**${options.currentTrack.title}**\nby ${options.currentTrack.author}`)
            .addFields({ name: '⏱️ Duration', value: this.formatTime(options.currentTrack.duration), inline: true }, { name: '🔊 Volume', value: `${options.volume}%`, inline: true }, { name: '🔁 Loop', value: options.loop, inline: true }, { name: '⏸️ Status', value: options.paused ? 'Paused' : 'Playing', inline: true }, { name: '📊 Progress', value: progress, inline: false }, { name: '📋 Queue', value: queueList || 'Empty', inline: false })
            .setColor(0x5865F2)
            .setTimestamp();
        if (options.currentTrack.thumbnail) {
            embed.setThumbnail(options.currentTrack.thumbnail);
        }
        return embed;
    }
    createMusicControls(customIdPrefix, paused) {
        return new ActionRowBuilder().addComponents(new ButtonBuilder()
            .setCustomId(`${customIdPrefix}_prev`)
            .setLabel('⏮️')
            .setStyle(ButtonStyle.Secondary), new ButtonBuilder()
            .setCustomId(`${customIdPrefix}_${paused ? 'resume' : 'pause'}`)
            .setLabel(paused ? '▶️' : '⏸️')
            .setStyle(ButtonStyle.Primary), new ButtonBuilder()
            .setCustomId(`${customIdPrefix}_stop`)
            .setLabel('⏹️')
            .setStyle(ButtonStyle.Danger), new ButtonBuilder()
            .setCustomId(`${customIdPrefix}_next`)
            .setLabel('⏭️')
            .setStyle(ButtonStyle.Secondary), new ButtonBuilder()
            .setCustomId(`${customIdPrefix}_loop`)
            .setLabel('🔁')
            .setStyle(ButtonStyle.Secondary));
    }
    createVolumeControls(customIdPrefix, currentVolume) {
        return new ActionRowBuilder().addComponents(new ButtonBuilder()
            .setCustomId(`${customIdPrefix}_vol_down`)
            .setLabel('🔉')
            .setStyle(ButtonStyle.Secondary), new ButtonBuilder()
            .setCustomId(`${customIdPrefix}_vol_10`)
            .setLabel('10%')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(currentVolume === 10), new ButtonBuilder()
            .setCustomId(`${customIdPrefix}_vol_50`)
            .setLabel('50%')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(currentVolume === 50), new ButtonBuilder()
            .setCustomId(`${customIdPrefix}_vol_100`)
            .setLabel('100%')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(currentVolume === 100), new ButtonBuilder()
            .setCustomId(`${customIdPrefix}_vol_up`)
            .setLabel('🔊')
            .setStyle(ButtonStyle.Secondary));
    }
    createQueuePagination(customIdPrefix, currentPage, totalPages) {
        return new ActionRowBuilder().addComponents(new ButtonBuilder()
            .setCustomId(`${customIdPrefix}_queue_prev`)
            .setLabel('◀️')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(currentPage === 0), new ButtonBuilder()
            .setCustomId(`${customIdPrefix}_queue_page`)
            .setLabel(`${currentPage + 1}/${totalPages}`)
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true), new ButtonBuilder()
            .setCustomId(`${customIdPrefix}_queue_next`)
            .setLabel('▶️')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(currentPage === totalPages - 1), new ButtonBuilder()
            .setCustomId(`${customIdPrefix}_shuffle`)
            .setLabel('🔀')
            .setStyle(ButtonStyle.Secondary), new ButtonBuilder()
            .setCustomId(`${customIdPrefix}_clear`)
            .setLabel('🗑️')
            .setStyle(ButtonStyle.Danger));
    }
    createProgressBar(position, duration) {
        const percentage = position / duration;
        const filled = Math.round(percentage * this.PROGRESS_BAR_LENGTH);
        const empty = this.PROGRESS_BAR_LENGTH - filled;
        const bar = '█'.repeat(filled) + '░'.repeat(empty);
        const time = `${this.formatTime(position)} / ${this.formatTime(duration)}`;
        return `${bar}\n${time}`;
    }
    createQueueList(queue, maxItems = 10) {
        if (queue.length === 0)
            return 'No tracks in queue';
        return queue.slice(0, maxItems).map((track, index) => `${index + 1}. **${track.title}** - ${this.formatTime(track.duration)}`).join('\n');
    }
    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
    createTrackAddedEmbed(track, position) {
        return new EmbedBuilder()
            .setTitle('✅ Track Added')
            .setDescription(`**${track.title}**\nby ${track.author}`)
            .addFields({ name: '⏱️ Duration', value: this.formatTime(track.duration), inline: true }, { name: '📊 Position', value: `#${position + 1}`, inline: true })
            .setColor(0x57F287)
            .setThumbnail(track.thumbnail)
            .setTimestamp();
    }
    createTrackRemovedEmbed(track) {
        return new EmbedBuilder()
            .setTitle('🗑️ Track Removed')
            .setDescription(`**${track.title}**\nby ${track.author}`)
            .setColor(0xED4245)
            .setTimestamp();
    }
    createQueueClearedEmbed(count) {
        return new EmbedBuilder()
            .setTitle('🗑️ Queue Cleared')
            .setDescription(`Removed ${count} tracks from the queue`)
            .setColor(0xED4245)
            .setTimestamp();
    }
    createShuffleEmbed() {
        return new EmbedBuilder()
            .setTitle('🔀 Queue Shuffled')
            .setDescription('The queue has been shuffled')
            .setColor(0x5865F2)
            .setTimestamp();
    }
    createLoopEmbed(mode) {
        const modeText = mode === 'none' ? 'Disabled' : mode === 'track' ? 'Track' : 'Queue';
        return new EmbedBuilder()
            .setTitle('🔁 Loop Mode')
            .setDescription(`Loop mode set to: **${modeText}**`)
            .setColor(0x5865F2)
            .setTimestamp();
    }
    createVolumeEmbed(volume) {
        return new EmbedBuilder()
            .setTitle('🔊 Volume Changed')
            .setDescription(`Volume set to **${volume}%**`)
            .setColor(0x5865F2)
            .setTimestamp();
    }
    createNoVoiceChannelEmbed() {
        return EmbedManager.error('Error', 'You must be in a voice channel to use music commands');
    }
    createNoPlayerEmbed() {
        return EmbedManager.error('Error', 'No music is currently playing');
    }
    createEmptyQueueEmbed() {
        return EmbedManager.warning('Empty Queue', 'The queue is empty. Add some tracks first!');
    }
}
export const musicUIService = new MusicUIService();
export default musicUIService;
//# sourceMappingURL=MusicUIService.js.map