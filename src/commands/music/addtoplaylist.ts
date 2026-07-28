// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';

export class AddToPlaylistCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'addtoplaylist',
      description: 'Add the current song to a playlist',
      category: 'music',
      cooldown: 5,
      userPermissions: [PermissionFlagsBits.Connect],
      botPermissions: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['atp', 'addsong'],
      examples: ['/addtoplaylist myplaylist', 'p!addtoplaylist myplaylist'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const playlistName = interaction.options.getString('playlist');

    if (!playlistName) {
      await interaction.reply({ content: '❌ Please provide a playlist name.', ephemeral: true });
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

      const client = interaction.client as any;
      const musicManager = client.kazagumo;

      if (!musicManager) {
        await interaction.reply({ content: '❌ Music system is not available.', ephemeral: true });
        return;
      }

      const player = client.kazagumo!.players.get(interaction.guildId);
      if (!player || !player.queue.current) {
        await interaction.reply({ content: '❌ Nothing is currently playing.', ephemeral: true });
        return;
      }

      const currentSongs = JSON.parse(playlist.songs);
      currentSongs.push(player.queue.current);

      await prisma.playlist.update({
        where: { id: playlist.id },
        data: { songs: JSON.stringify(currentSongs) },
      });

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.success} Added to Playlist`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Playlist', value: playlistName, inline: true },
          { name: 'Song', value: player.queue.current.title, inline: true },
          { name: 'Added by', value: interaction.user.tag, inline: false },
        ])
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ content: '❌ Failed to add to playlist.', ephemeral: true });
    }
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const playlistName = args[0];

    if (!playlistName) {
      await message.reply('❌ Please provide a playlist name.');
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

      const client = message.client as any;
      const musicManager = client.kazagumo;

      if (!musicManager) {
        await message.reply('❌ Music system is not available.');
        return;
      }

      const player = client.kazagumo!.players.get(message.guildId);
      if (!player || !player.queue.current) {
        await message.reply('❌ Nothing is currently playing.');
        return;
      }

      const currentSongs = JSON.parse(playlist.songs);
      currentSongs.push(player.queue.current);

      await prisma.playlist.update({
        where: { id: playlist.id },
        data: { songs: JSON.stringify(currentSongs) },
      });

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.success} Added to Playlist`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Playlist', value: playlistName, inline: true },
          { name: 'Song', value: player.queue.current.title, inline: true },
          { name: 'Added by', value: message.author.tag, inline: false },
        ])
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      await message.reply('❌ Failed to add to playlist.');
    }
  }
}

export default AddToPlaylistCommand;
