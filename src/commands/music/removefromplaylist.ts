// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';

export class RemoveFromPlaylistCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'removefromplaylist',
      description: 'Remove a song from a playlist',
      category: 'music',
      cooldown: 5,
      userPermissions: [PermissionFlagsBits.Connect],
      botPermissions: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['rfp', 'removesong'],
      examples: ['/removefromplaylist myplaylist 1', 'p!removefromplaylist myplaylist 1'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const playlistName = interaction.options.getString('playlist');
    const index = interaction.options.getInteger('index');

    if (!playlistName) {
      await interaction.reply({ content: '❌ Please provide a playlist name.', ephemeral: true });
      return;
    }

    if (index === null || index < 1) {
      await interaction.reply({ content: '❌ Please provide a valid song index (1-based).', ephemeral: true });
      return;
    }

    if (!interaction.guildId) return;

    try {
      const prisma = getPrismaClient();

      const playlist = await prisma.playlist.findFirst({
        where: { name: playlistName, guildId: interaction.guildId },
      });

      if (!playlist) {
        await interaction.reply({ content: '❌ Playlist not found.', ephemeral: true });
        return;
      }

      if (playlist.userId !== interaction.user.id) {
        await interaction.reply({ content: '❌ You can only remove songs from your own playlists.', ephemeral: true });
        return;
      }

      const currentSongs = JSON.parse(playlist.songs);

      if (index > currentSongs.length) {
        await interaction.reply({ content: '❌ Invalid index. Playlist only has ' + currentSongs.length + ' songs.', ephemeral: true });
        return;
      }

      const removedSong = currentSongs.splice(index - 1, 1)[0];

      await prisma.playlist.update({
        where: { id: playlist.id },
        data: { songs: JSON.stringify(currentSongs) },
      });

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.success} Removed from Playlist`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Playlist', value: playlistName, inline: true },
          { name: 'Removed song', value: removedSong.title, inline: true },
          { name: 'Removed by', value: interaction.user.tag, inline: false },
        ])
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ content: '❌ Failed to remove from playlist.', ephemeral: true });
    }
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const playlistName = args[0];
    const index = parseInt(args[1]);

    if (!playlistName) {
      await message.reply('❌ Please provide a playlist name.');
      return;
    }

    if (isNaN(index) || index < 1) {
      await message.reply('❌ Please provide a valid song index (1-based).');
      return;
    }

    if (!message.guildId) return;

    try {
      const prisma = getPrismaClient();

      const playlist = await prisma.playlist.findFirst({
        where: { name: playlistName, guildId: message.guildId },
      });

      if (!playlist) {
        await message.reply('❌ Playlist not found.');
        return;
      }

      if (playlist.userId !== message.author.id) {
        await message.reply('❌ You can only remove songs from your own playlists.');
        return;
      }

      const currentSongs = JSON.parse(playlist.songs);

      if (index > currentSongs.length) {
        await message.reply('❌ Invalid index. Playlist only has ' + currentSongs.length + ' songs.');
        return;
      }

      const removedSong = currentSongs.splice(index - 1, 1)[0];

      await prisma.playlist.update({
        where: { id: playlist.id },
        data: { songs: JSON.stringify(currentSongs) },
      });

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.success} Removed from Playlist`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Playlist', value: playlistName, inline: true },
          { name: 'Removed song', value: removedSong.title, inline: true },
          { name: 'Removed by', value: message.author.tag, inline: false },
        ])
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      await message.reply('❌ Failed to remove from playlist.');
    }
  }
}

export default RemoveFromPlaylistCommand;
