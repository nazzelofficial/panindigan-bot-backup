// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';

export class PlaylistCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'playlist',
      description: 'Save, load, or manage playlists',
      category: 'music',
      cooldown: 5,
      userPermissions: [PermissionFlagsBits.Connect],
      botPermissions: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['pl', 'list'],
      examples: ['/playlist create mylist', 'p!playlist load mylist'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const action = interaction.options.getString('action') || 'list';
    const name = interaction.options.getString('name');

    if (!interaction.guildId) return;

    try {
      const prisma = getPrismaClient();

      if (action === 'create') {
        if (!name) {
          await interaction.reply({ content: '❌ Please provide a playlist name.', ephemeral: true });
          return;
        }

        const existingPlaylist = await prisma.playlist.findFirst({
          where: { name, guildId: interaction.guildId },
        });

        if (existingPlaylist) {
          await interaction.reply({ content: '❌ A playlist with this name already exists.', ephemeral: true });
          return;
        }

        const client = interaction.client as any;
        const musicManager = client.kazagumo;

        if (!musicManager) {
          await interaction.reply({ content: '❌ Music system is not available.', ephemeral: true });
          return;
        }

        const player = client.kazagumo!.players.get(interaction.guildId);
        if (!player || player.queue.size === 0) {
          await interaction.reply({ content: '❌ No songs in the current queue to save.', ephemeral: true });
          return;
        }

        await prisma.playlist.create({
          data: {
            name,
            guildId: interaction.guildId,
            userId: interaction.user.id,
            songs: JSON.stringify(player.queue),
          },
        });

        const embed = new EmbedBuilder()
          .setTitle(`${EMOJIS.success} Playlist Created`)
          .setColor(COLORS.success)
          .addFields([
            { name: 'Name', value: name, inline: true },
            { name: 'Songs', value: player.queue.size.toString(), inline: true },
            { name: 'Created by', value: interaction.user.tag, inline: false },
          ])
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });
      } else if (action === 'load') {
        if (!name) {
          await interaction.reply({ content: '❌ Please provide a playlist name.', ephemeral: true });
          return;
        }

        const playlist = await prisma.playlist.findFirst({
          where: { name, guildId: interaction.guildId },
        });

        if (!playlist) {
          await interaction.reply({ content: '❌ Playlist not found.', ephemeral: true });
          return;
        }

        const songs = JSON.parse(playlist.songs);

        const embed = new EmbedBuilder()
          .setTitle(`${EMOJIS.music} Playlist Loaded`)
          .setColor(COLORS.success)
          .addFields([
            { name: 'Name', value: playlist.name, inline: true },
            { name: 'Songs', value: songs.length.toString(), inline: true },
          ])
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });
      } else if (action === 'list') {
        const playlists = await prisma.playlist.findMany({
          where: { guildId: interaction.guildId },
          orderBy: { createdAt: 'desc' },
          take: 10,
        });

        if (playlists.length === 0) {
          await interaction.reply({ content: '❌ No playlists found.', ephemeral: true });
          return;
        }

        const embed = new EmbedBuilder()
          .setTitle(`${EMOJIS.music} Server Playlists`)
          .setColor(COLORS.info)
          .addFields(
            playlists.map((pl) => ({
              name: pl.name,
              value: `Created by <@${pl.userId}> • ${JSON.parse(pl.songs).length} songs`,
              inline: false,
            }))
          )
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });
      } else if (action === 'delete') {
        if (!name) {
          await interaction.reply({ content: '❌ Please provide a playlist name.', ephemeral: true });
          return;
        }

        const playlist = await prisma.playlist.findFirst({
          where: { name, guildId: interaction.guildId },
        });

        if (!playlist) {
          await interaction.reply({ content: '❌ Playlist not found.', ephemeral: true });
          return;
        }

        if (playlist.userId !== interaction.user.id) {
          await interaction.reply({ content: '❌ You can only delete your own playlists.', ephemeral: true });
          return;
        }

        await prisma.playlist.delete({
          where: { id: playlist.id },
        });

        const embed = new EmbedBuilder()
          .setTitle(`${EMOJIS.success} Playlist Deleted`)
          .setColor(COLORS.success)
          .addFields([
            { name: 'Name', value: playlist.name, inline: true },
          ])
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });
      }
    } catch (error) {
      await interaction.reply({ content: '❌ Failed to manage playlist.', ephemeral: true });
    }
  }

  public async executePrefix(message: Message, _args: string[]): Promise<void> {
    const action = args[0] || 'list';
    const name = args[1];

    if (!message.guildId) return;

    try {
      const prisma = getPrismaClient();

      if (action === 'create') {
        if (!name) {
          await message.reply('❌ Please provide a playlist name.');
          return;
        }

        const existingPlaylist = await prisma.playlist.findFirst({
          where: { name, guildId: message.guildId },
        });

        if (existingPlaylist) {
          await message.reply('❌ A playlist with this name already exists.');
          return;
        }

        const client = message.client as any;
        const musicManager = client.kazagumo;

        if (!musicManager) {
          await message.reply('❌ Music system is not available.');
          return;
        }

        const player = client.kazagumo!.players.get(message.guildId);
        if (!player || player.queue.size === 0) {
          await message.reply('❌ No songs in the current queue to save.');
          return;
        }

        await prisma.playlist.create({
          data: {
            name,
            guildId: message.guildId,
            userId: message.author.id,
            songs: JSON.stringify(player.queue),
          },
        });

        const embed = new EmbedBuilder()
          .setTitle(`${EMOJIS.success} Playlist Created`)
          .setColor(COLORS.success)
          .addFields([
            { name: 'Name', value: name, inline: true },
            { name: 'Songs', value: player.queue.size.toString(), inline: true },
            { name: 'Created by', value: message.author.tag, inline: false },
          ])
          .setTimestamp();

        await message.reply({ embeds: [embed] });
      } else if (action === 'load') {
        if (!name) {
          await message.reply('❌ Please provide a playlist name.');
          return;
        }

        const playlist = await prisma.playlist.findFirst({
          where: { name, guildId: message.guildId },
        });

        if (!playlist) {
          await message.reply('❌ Playlist not found.');
          return;
        }

        const songs = JSON.parse(playlist.songs);

        const embed = new EmbedBuilder()
          .setTitle(`${EMOJIS.music} Playlist Loaded`)
          .setColor(COLORS.success)
          .addFields([
            { name: 'Name', value: playlist.name, inline: true },
            { name: 'Songs', value: songs.length.toString(), inline: true },
          ])
          .setTimestamp();

        await message.reply({ embeds: [embed] });
      } else if (action === 'list') {
        const playlists = await prisma.playlist.findMany({
          where: { guildId: message.guildId },
          orderBy: { createdAt: 'desc' },
          take: 10,
        });

        if (playlists.length === 0) {
          await message.reply('❌ No playlists found.');
          return;
        }

        const embed = new EmbedBuilder()
          .setTitle(`${EMOJIS.music} Server Playlists`)
          .setColor(COLORS.info)
          .addFields(
            playlists.map((pl) => ({
              name: pl.name,
              value: `Created by <@${pl.userId}> • ${JSON.parse(pl.songs).length} songs`,
              inline: false,
            }))
          )
          .setTimestamp();

        await message.reply({ embeds: [embed] });
      } else if (action === 'delete') {
        if (!name) {
          await message.reply('❌ Please provide a playlist name.');
          return;
        }

        const playlist = await prisma.playlist.findFirst({
          where: { name, guildId: message.guildId },
        });

        if (!playlist) {
          await message.reply('❌ Playlist not found.');
          return;
        }

        if (playlist.userId !== message.author.id) {
          await message.reply('❌ You can only delete your own playlists.');
          return;
        }

        await prisma.playlist.delete({
          where: { id: playlist.id },
        });

        const embed = new EmbedBuilder()
          .setTitle(`${EMOJIS.success} Playlist Deleted`)
          .setColor(COLORS.success)
          .addFields([
            { name: 'Name', value: playlist.name, inline: true },
          ])
          .setTimestamp();

        await message.reply({ embeds: [embed] });
      }
    } catch (error) {
      await message.reply('❌ Failed to manage playlist.');
    }
  }
}

export default PlaylistCommand;
