// @ts-nocheck
/**
 * Music model helpers — typed wrappers around Prisma's Music operations.
 * Playlists, favorites, and history are stored as JSON arrays in PostgreSQL.
 */
import { getPrismaClient } from '../client.js';
export async function findOrCreateMusic(userId, guildId) {
    const prisma = getPrismaClient();
    return prisma.music.upsert({
        where: { userId_guildId: { userId, guildId } },
        create: { userId, guildId },
        update: {},
    });
}
export async function getMusic(userId, guildId) {
    const prisma = getPrismaClient();
    return prisma.music.findUnique({ where: { userId_guildId: { userId, guildId } } });
}
export async function getPlaylists(userId, guildId) {
    const music = await getMusic(userId, guildId);
    return (music?.playlists ?? []);
}
export async function getPlaylist(userId, guildId, name) {
    const playlists = await getPlaylists(userId, guildId);
    return playlists.find((p) => p.name.toLowerCase() === name.toLowerCase());
}
export async function createPlaylist(userId, guildId, name) {
    const prisma = getPrismaClient();
    const music = await findOrCreateMusic(userId, guildId);
    const playlists = music.playlists ?? [];
    if (playlists.find((p) => p.name.toLowerCase() === name.toLowerCase())) {
        throw new Error(`Playlist "${name}" already exists`);
    }
    const newPlaylist = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        name,
        tracks: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
    playlists.push(newPlaylist);
    await prisma.music.update({
        where: { userId_guildId: { userId, guildId } },
        data: { playlists: playlists },
    });
    return newPlaylist;
}
export async function addToPlaylist(userId, guildId, playlistName, track) {
    const prisma = getPrismaClient();
    const music = await findOrCreateMusic(userId, guildId);
    const playlists = music.playlists ?? [];
    const playlist = playlists.find((p) => p.name.toLowerCase() === playlistName.toLowerCase());
    if (!playlist)
        throw new Error(`Playlist "${playlistName}" not found`);
    playlist.tracks.push({ ...track, addedAt: new Date().toISOString() });
    playlist.updatedAt = new Date().toISOString();
    await prisma.music.update({
        where: { userId_guildId: { userId, guildId } },
        data: { playlists: playlists },
    });
}
export async function deletePlaylist(userId, guildId, name) {
    const prisma = getPrismaClient();
    const music = await findOrCreateMusic(userId, guildId);
    const playlists = (music.playlists ?? []).filter((p) => p.name.toLowerCase() !== name.toLowerCase());
    await prisma.music.update({
        where: { userId_guildId: { userId, guildId } },
        data: { playlists: playlists },
    });
}
export async function addToHistory(userId, guildId, track, maxHistory = 50) {
    const prisma = getPrismaClient();
    const music = await findOrCreateMusic(userId, guildId);
    const history = music.musicHistory ?? [];
    history.unshift({ ...track, addedAt: new Date().toISOString() });
    if (history.length > maxHistory)
        history.splice(maxHistory);
    await prisma.music.update({
        where: { userId_guildId: { userId, guildId } },
        data: { musicHistory: history },
    });
}
export async function getFavorites(userId, guildId) {
    const music = await getMusic(userId, guildId);
    return (music?.favorites ?? []);
}
export async function addFavorite(userId, guildId, track) {
    const prisma = getPrismaClient();
    const music = await findOrCreateMusic(userId, guildId);
    const favorites = music.favorites ?? [];
    if (!favorites.find((f) => f.uri === track.uri)) {
        favorites.push({ ...track, addedAt: new Date().toISOString() });
        await prisma.music.update({
            where: { userId_guildId: { userId, guildId } },
            data: { favorites: favorites },
        });
    }
}
//# sourceMappingURL=Music.js.map