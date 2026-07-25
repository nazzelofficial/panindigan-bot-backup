/**
 * Music model helpers — typed wrappers around Prisma's Music operations.
 * Playlists, favorites, and history are stored as JSON arrays in PostgreSQL.
 */

import { getPrismaClient } from '../client';
import type { Music } from '@prisma/client';

export interface PlaylistTrack {
  title: string;
  uri: string;
  author: string;
  durationMs: number;
  addedAt: string;
}

export interface Playlist {
  id: string;
  name: string;
  tracks: PlaylistTrack[];
  createdAt: string;
  updatedAt: string;
}

export async function findOrCreateMusic(userId: string, guildId: string): Promise<Music> {
  const prisma = getPrismaClient();
  return prisma.music.upsert({
    where: { userId_guildId: { userId, guildId } },
    create: { userId, guildId },
    update: {},
  });
}

export async function getMusic(userId: string, guildId: string): Promise<Music | null> {
  const prisma = getPrismaClient();
  return prisma.music.findUnique({ where: { userId_guildId: { userId, guildId } } });
}

export async function getPlaylists(userId: string, guildId: string): Promise<Playlist[]> {
  const music = await getMusic(userId, guildId);
  return (music?.playlists ?? []) as unknown as Playlist[];
}

export async function getPlaylist(
  userId: string,
  guildId: string,
  name: string,
): Promise<Playlist | undefined> {
  const playlists = await getPlaylists(userId, guildId);
  return playlists.find((p) => p.name.toLowerCase() === name.toLowerCase());
}

export async function createPlaylist(
  userId: string,
  guildId: string,
  name: string,
): Promise<Playlist> {
  const prisma = getPrismaClient();
  const music = await findOrCreateMusic(userId, guildId);
  const playlists = (music.playlists as unknown as Playlist[]) ?? [];

  if (playlists.find((p) => p.name.toLowerCase() === name.toLowerCase())) {
    throw new Error(`Playlist "${name}" already exists`);
  }

  const newPlaylist: Playlist = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    name,
    tracks: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  playlists.push(newPlaylist);
  await prisma.music.update({
    where: { userId_guildId: { userId, guildId } },
    data: { playlists: playlists as any },
  });

  return newPlaylist;
}

export async function addToPlaylist(
  userId: string,
  guildId: string,
  playlistName: string,
  track: Omit<PlaylistTrack, 'addedAt'>,
): Promise<void> {
  const prisma = getPrismaClient();
  const music = await findOrCreateMusic(userId, guildId);
  const playlists = (music.playlists as unknown as Playlist[]) ?? [];
  const playlist = playlists.find((p) => p.name.toLowerCase() === playlistName.toLowerCase());
  if (!playlist) throw new Error(`Playlist "${playlistName}" not found`);

  playlist.tracks.push({ ...track, addedAt: new Date().toISOString() });
  playlist.updatedAt = new Date().toISOString();

  await prisma.music.update({
    where: { userId_guildId: { userId, guildId } },
    data: { playlists: playlists as any },
  });
}

export async function deletePlaylist(
  userId: string,
  guildId: string,
  name: string,
): Promise<void> {
  const prisma = getPrismaClient();
  const music = await findOrCreateMusic(userId, guildId);
  const playlists = ((music.playlists as unknown as Playlist[]) ?? []).filter(
    (p) => p.name.toLowerCase() !== name.toLowerCase(),
  );
  await prisma.music.update({
    where: { userId_guildId: { userId, guildId } },
    data: { playlists: playlists as any },
  });
}

export async function addToHistory(
  userId: string,
  guildId: string,
  track: Omit<PlaylistTrack, 'addedAt'>,
  maxHistory = 50,
): Promise<void> {
  const prisma = getPrismaClient();
  const music = await findOrCreateMusic(userId, guildId);
  const history = (music.musicHistory as unknown as PlaylistTrack[]) ?? [];
  history.unshift({ ...track, addedAt: new Date().toISOString() });
  if (history.length > maxHistory) history.splice(maxHistory);
  await prisma.music.update({
    where: { userId_guildId: { userId, guildId } },
    data: { musicHistory: history as any },
  });
}

export async function getFavorites(userId: string, guildId: string): Promise<PlaylistTrack[]> {
  const music = await getMusic(userId, guildId);
  return (music?.favorites ?? []) as unknown as PlaylistTrack[];
}

export async function addFavorite(
  userId: string,
  guildId: string,
  track: Omit<PlaylistTrack, 'addedAt'>,
): Promise<void> {
  const prisma = getPrismaClient();
  const music = await findOrCreateMusic(userId, guildId);
  const favorites = (music.favorites as unknown as PlaylistTrack[]) ?? [];
  if (!favorites.find((f) => f.uri === track.uri)) {
    favorites.push({ ...track, addedAt: new Date().toISOString() });
    await prisma.music.update({
      where: { userId_guildId: { userId, guildId } },
      data: { favorites: favorites as any },
    });
  }
}
