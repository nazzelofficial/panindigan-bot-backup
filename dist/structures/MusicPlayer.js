// @ts-nocheck
/**
 * ══════════════════════════════════════════════════
 *  Panindigan Enterprise Music Player
 *  Modern embeds · Animated emoji fallback · Full UI
 * ══════════════════════════════════════════════════
 */
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, } from 'discord.js';
import { COLORS } from '../constants/DesignSystem.js';
import emojiManager from '../utils/EmojiManager.js';
// ─── Emoji helpers ────────────────────────────────────────────────────────────
function e(category, key) {
    return emojiManager.get(category, key);
}
// ─── Duration / progress ─────────────────────────────────────────────────────
export function formatDuration(ms) {
    if (!ms || ms <= 0)
        return '0:00';
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (hours > 0) {
        return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
}
export function getProgressBar(current, total, length = 22) {
    if (!total || total <= 0)
        return '▬'.repeat(length);
    const progress = Math.min(current / total, 1);
    const filled = Math.floor(progress * length);
    return '█'.repeat(filled) + '░'.repeat(length - filled);
}
export function getProgressBarWithKnob(current, total, length = 20) {
    if (!total || total <= 0)
        return `${'▬'.repeat(length)}`;
    const progress = Math.min(current / total, 1);
    const knob = Math.floor(progress * length);
    const bar = '▬'.repeat(knob) + '🔘' + '▬'.repeat(length - knob);
    return bar;
}
// ─── Source badge ─────────────────────────────────────────────────────────────
function sourceBadge(sourceName) {
    const map = {
        youtube: 'YouTube',
        youtubemusic: 'YT Music',
        ytmusic: 'YT Music',
        spotify: 'Spotify',
        soundcloud: 'SoundCloud',
        applemusic: 'Apple Music',
        deezer: 'Deezer',
        tidal: 'Tidal',
        bandcamp: 'Bandcamp',
        twitch: 'Twitch',
        vimeo: 'Vimeo',
        http: 'Direct',
    };
    const key = (sourceName ?? '').toLowerCase().replace(/\s/g, '');
    return map[key] ?? (sourceName ?? 'Unknown');
}
// ─── Loop status text ─────────────────────────────────────────────────────────
function loopText(loop) {
    if (loop === 'track')
        return `${e('music', 'loop')} Track`;
    if (loop === 'queue')
        return `${e('music', 'loop')} Queue`;
    return '➡️ Off';
}
// ─── Volume icon ──────────────────────────────────────────────────────────────
function volumeIcon(vol) {
    if (vol <= 0)
        return '🔇';
    if (vol <= 30)
        return '🔈';
    if (vol <= 70)
        return `${e('music', 'volume')}`;
    return `${e('music', 'volume')}`;
}
// ─── MusicPlayer static class ─────────────────────────────────────────────────
export class MusicPlayer {
    static formatDuration = formatDuration;
    static getProgressBar = getProgressBar;
    // ── Now Playing embed ──────────────────────────────────────────────────────
    static getNowPlayingEmbed(player) {
        const track = player.queue.current;
        if (!track) {
            return new EmbedBuilder()
                .setTitle(`${e('music', 'nowplaying')} Nothing Playing`)
                .setColor(COLORS.music)
                .setDescription('The queue is empty. Use `/music player play` to add a song.');
        }
        const current = player.position || 0;
        const total = track.length || 0;
        const bar = getProgressBarWithKnob(current, total);
        const curFmt = formatDuration(current);
        const totFmt = total > 0 ? formatDuration(total) : '∞';
        const vol = player.volume ?? 80;
        const requester = track.requester;
        const reqText = requester ? `<@${requester.id ?? requester}>` : 'Unknown';
        const source = sourceBadge(track.sourceName);
        const queueSize = player.queue.size;
        return new EmbedBuilder()
            .setTitle(`${e('music', 'nowplaying')} Now Playing`)
            .setColor(COLORS.music)
            .setDescription(`### [${track.title}](${track.uri})\n` +
            `${bar}\n` +
            `\`${curFmt}\` ───────────────── \`${totFmt}\``)
            .addFields({ name: `🎤 Artist`, value: track.author || 'Unknown', inline: true }, { name: `📀 Source`, value: source, inline: true }, { name: `${volumeIcon(vol)} Volume`, value: `${vol}%`, inline: true }, { name: `🔁 Loop`, value: loopText(player.loop ?? 'none'), inline: true }, { name: `${e('music', 'queue')} Queue`, value: `${queueSize} remaining`, inline: true }, { name: `👤 Requested by`, value: reqText, inline: true })
            .setThumbnail(track.thumbnail ?? null)
            .setFooter({ text: `Panindigan Music • ${new Date().toLocaleString('en-PH', { timeZone: 'Asia/Manila' })}` })
            .setTimestamp();
    }
    // ── Queue embed ────────────────────────────────────────────────────────────
    static getQueueEmbed(player, page = 1, perPage = 10) {
        const queue = player.queue;
        const tracks = [...(queue.size > 0 ? queue : [])];
        const current = queue.current;
        const totalPages = Math.max(1, Math.ceil(tracks.length / perPage));
        const currentPage = Math.min(Math.max(1, page), totalPages);
        const start = (currentPage - 1) * perPage;
        const slice = tracks.slice(start, start + perPage);
        const totalDuration = tracks.reduce((acc, t) => acc + (t.length || 0), 0);
        const currentDuration = current?.length || 0;
        const list = slice.length
            ? slice.map((t, i) => {
                const n = start + i + 1;
                const dur = formatDuration(t.length || 0);
                return `\`${String(n).padStart(2, ' ')}.\` **[${t.title}](${t.uri})** — \`${dur}\``;
            }).join('\n')
            : '_No tracks in queue_';
        const nowLine = current
            ? `${e('music', 'play')} **Now:** [${current.title}](${current.uri}) — \`${formatDuration(currentDuration)}\`\n\n`
            : '';
        return new EmbedBuilder()
            .setTitle(`${e('music', 'queue')} Music Queue`)
            .setColor(COLORS.music)
            .setDescription(`${nowLine}${list}`)
            .addFields({ name: `${e('music', 'nowplaying')} Tracks`, value: `${tracks.length + (current ? 1 : 0)}`, inline: true }, { name: `⏱️ Total Duration`, value: formatDuration(totalDuration + currentDuration), inline: true }, { name: `${volumeIcon(player.volume ?? 80)} Volume`, value: `${player.volume ?? 80}%`, inline: true })
            .setFooter({ text: `Page ${currentPage} / ${totalPages}` });
    }
    // ── Search results embed ───────────────────────────────────────────────────
    static getSearchEmbed(query, results) {
        const list = results.slice(0, 10).map((t, i) => {
            const dur = t.length ? formatDuration(t.length) : '∞';
            return `\`${i + 1}.\` **[${t.title}](${t.uri})** — ${t.author ?? 'Unknown'} — \`${dur}\``;
        }).join('\n');
        return new EmbedBuilder()
            .setTitle(`${e('music', 'search')} Search Results`)
            .setColor(COLORS.music)
            .setDescription(`**Query:** \`${query}\`\n\n${list || 'No results found.'}`)
            .setFooter({ text: `Showing ${Math.min(results.length, 10)} results · Select a track below` });
    }
    // ── Control buttons ────────────────────────────────────────────────────────
    static buildControlButtons(player) {
        const isPaused = player.paused;
        const loopMode = player.loop ?? 'none';
        return new ActionRowBuilder().addComponents(new ButtonBuilder()
            .setCustomId('music_prev')
            .setEmoji(e('music', 'previous') || '⏮️')
            .setStyle(ButtonStyle.Secondary)
            .setLabel('Back'), new ButtonBuilder()
            .setCustomId('music_pause')
            .setEmoji(isPaused ? (e('music', 'play') || '▶️') : (e('music', 'pause') || '⏸️'))
            .setStyle(isPaused ? ButtonStyle.Success : ButtonStyle.Primary)
            .setLabel(isPaused ? 'Resume' : 'Pause'), new ButtonBuilder()
            .setCustomId('music_skip')
            .setEmoji(e('music', 'skip') || '⏭️')
            .setStyle(ButtonStyle.Secondary)
            .setLabel('Skip'), new ButtonBuilder()
            .setCustomId('music_loop')
            .setEmoji(e('music', 'loop') || '🔁')
            .setStyle(loopMode !== 'none' ? ButtonStyle.Success : ButtonStyle.Secondary)
            .setLabel(loopMode === 'track' ? 'Loop: Track' : loopMode === 'queue' ? 'Loop: Queue' : 'Loop: Off'), new ButtonBuilder()
            .setCustomId('music_stop')
            .setEmoji(e('music', 'stop') || '⏹️')
            .setStyle(ButtonStyle.Danger)
            .setLabel('Stop'));
    }
    // ── Secondary buttons ──────────────────────────────────────────────────────
    static buildVolumeButtons(player) {
        const vol = player.volume ?? 80;
        const shuffle = player.shuffle ?? false;
        return new ActionRowBuilder().addComponents(new ButtonBuilder()
            .setCustomId('music_voldown')
            .setEmoji('🔉')
            .setStyle(ButtonStyle.Secondary)
            .setLabel('Vol-')
            .setDisabled(vol <= 0), new ButtonBuilder()
            .setCustomId('music_queue')
            .setEmoji(e('music', 'queue') || '📋')
            .setStyle(ButtonStyle.Secondary)
            .setLabel('Queue'), new ButtonBuilder()
            .setCustomId('music_shuffle')
            .setEmoji(e('music', 'shuffle') || '🔀')
            .setStyle(shuffle ? ButtonStyle.Success : ButtonStyle.Secondary)
            .setLabel('Shuffle'), new ButtonBuilder()
            .setCustomId('music_lyrics')
            .setEmoji(e('music', 'lyrics') || '🎵')
            .setStyle(ButtonStyle.Secondary)
            .setLabel('Lyrics'), new ButtonBuilder()
            .setCustomId('music_volup')
            .setEmoji('🔊')
            .setStyle(ButtonStyle.Secondary)
            .setLabel('Vol+')
            .setDisabled(vol >= 200));
    }
    // ── Filter buttons ─────────────────────────────────────────────────────────
    static buildFilterButtons(activeFilters) {
        return new ActionRowBuilder().addComponents(new ButtonBuilder()
            .setCustomId('music_nightcore')
            .setLabel('Nightcore')
            .setEmoji('🌙')
            .setStyle(activeFilters.has('nightcore') ? ButtonStyle.Success : ButtonStyle.Secondary), new ButtonBuilder()
            .setCustomId('music_bassboost')
            .setLabel('Bassboost')
            .setEmoji('🎸')
            .setStyle(activeFilters.has('bassboost') ? ButtonStyle.Success : ButtonStyle.Secondary), new ButtonBuilder()
            .setCustomId('music_vaporwave')
            .setLabel('Vaporwave')
            .setEmoji('🌊')
            .setStyle(activeFilters.has('vaporwave') ? ButtonStyle.Success : ButtonStyle.Secondary), new ButtonBuilder()
            .setCustomId('music_8d')
            .setLabel('8D Audio')
            .setEmoji('🎧')
            .setStyle(activeFilters.has('8d') ? ButtonStyle.Success : ButtonStyle.Secondary), new ButtonBuilder()
            .setCustomId('music_filter_reset')
            .setLabel('Reset')
            .setEmoji('✖️')
            .setStyle(ButtonStyle.Danger));
    }
    // ── Search select menu ────────────────────────────────────────────────────
    static buildSearchSelect(results, query) {
        const options = results.slice(0, 10).map((t, i) => {
            const dur = t.length ? formatDuration(t.length) : '∞';
            return new StringSelectMenuOptionBuilder()
                .setValue(String(i))
                .setLabel(`${i + 1}. ${t.title.slice(0, 80)}`)
                .setDescription(`${(t.author ?? 'Unknown').slice(0, 50)} • ${dur}`);
        });
        return new ActionRowBuilder().addComponents(new StringSelectMenuBuilder()
            .setCustomId(`music_search_select:${query.slice(0, 50)}`)
            .setPlaceholder('Choose a track to play…')
            .addOptions(options));
    }
    // ── Convenience error embeds ──────────────────────────────────────────────
    static errorEmbed(title, description) {
        return new EmbedBuilder()
            .setTitle(`❌ ${title}`)
            .setColor(COLORS.danger)
            .setDescription(description);
    }
    static successEmbed(title, description) {
        return new EmbedBuilder()
            .setTitle(`${e('music', 'play') || '✅'} ${title}`)
            .setColor(COLORS.music)
            .setDescription(description);
    }
    static infoEmbed(title, description) {
        return new EmbedBuilder()
            .setTitle(`${e('music', 'nowplaying') || 'ℹ️'} ${title}`)
            .setColor(COLORS.music)
            .setDescription(description);
    }
    // ── Lyrics embed ──────────────────────────────────────────────────────────
    static buildLyricsEmbed(trackName, artistName, content, pageInfo, options = {}) {
        const embed = new EmbedBuilder()
            .setTitle(`${e('music', 'lyrics') || '🎵'} ${trackName}`)
            .setColor(COLORS.music)
            .setDescription(options.instrumental
            ? '*This track is instrumental — no lyrics available.*'
            : content || '_Lyrics not available for this track._')
            .addFields({ name: '🎤 Artist', value: artistName || 'Unknown', inline: true }, { name: '📄 Type', value: options.synced ? 'Synced' : 'Plain', inline: true })
            .setFooter({
            text: pageInfo.total > 1
                ? `Page ${pageInfo.current} / ${pageInfo.total} • Powered by LRCLIB`
                : 'Powered by LRCLIB',
        });
        return embed;
    }
    // ── Filter status embed ───────────────────────────────────────────────────
    static buildFilterStatusEmbed(player, activeFilters) {
        const filterStatus = activeFilters.length > 0
            ? activeFilters.map((f) => `• ${f}`).join('\n')
            : '_No filters active_';
        return new EmbedBuilder()
            .setTitle(`🎛️ Audio Filters`)
            .setColor(COLORS.music)
            .setDescription(filterStatus)
            .addFields({ name: `${volumeIcon(player.volume ?? 80)} Volume`, value: `${player.volume ?? 80}%`, inline: true }, { name: `🔁 Loop`, value: loopText(player.loop ?? 'none'), inline: true })
            .setFooter({ text: 'Use the buttons to toggle filters' });
    }
    // ── Added to queue embed ──────────────────────────────────────────────────
    static buildAddedEmbed(track, position, player) {
        const dur = track.length ? formatDuration(track.length) : '∞';
        const source = sourceBadge(track.sourceName);
        return new EmbedBuilder()
            .setTitle(`${e('music', 'play') || '✅'} Added to Queue`)
            .setColor(COLORS.music)
            .setDescription(`**[${track.title}](${track.uri})**`)
            .addFields({ name: '🎤 Artist', value: track.author || 'Unknown', inline: true }, { name: '⏱️ Duration', value: dur, inline: true }, { name: '📀 Source', value: source, inline: true }, { name: '📋 Position', value: position === 0 ? 'Now Playing' : `#${position}`, inline: true }, { name: `${e('music', 'queue') || '📜'} In Queue`, value: `${player.queue.size}`, inline: true })
            .setThumbnail(track.thumbnail ?? null)
            .setTimestamp();
    }
    // ── Playlist embed ────────────────────────────────────────────────────────
    static buildPlaylistEmbed(playlistName, trackCount, totalDuration, source) {
        return new EmbedBuilder()
            .setTitle(`${e('music', 'playlist') || '📁'} Playlist Added`)
            .setColor(COLORS.music)
            .setDescription(`**${playlistName}**`)
            .addFields({ name: `${e('music', 'queue') || '📜'} Tracks`, value: `${trackCount}`, inline: true }, { name: '⏱️ Total Duration', value: formatDuration(totalDuration), inline: true }, { name: '📀 Source', value: sourceBadge(source), inline: true })
            .setTimestamp();
    }
}
//# sourceMappingURL=MusicPlayer.js.map