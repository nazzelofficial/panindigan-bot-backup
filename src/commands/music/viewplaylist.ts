import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';
import { getPrismaClient } from '../../database/postgresql/client';

export class ViewPlaylistCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'viewplaylist',
      description: 'View the contents of a playlist',
      category: 'music',
      cooldown: 5,
      userPermissions: [PermissionFlagsBits.Connect],
      botPermissions: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['vp', 'showplaylist'],
      examples: ['/viewplaylist myplaylist', 'p!viewplaylist myplaylist'],
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

      const songs = JSON.parse(playlist.songs);

      if (songs.length === 0) {
        await interaction.reply({ content: '❌ This playlist is empty.', ephemeral: true });
        return;
      }

      const songList = songs.slice(0, 10).map((song: any, index: number) => 
        `${index + 1}. ${song.title} (${song.duration || 'Unknown'})`
      ).join('\n');

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.music} Playlist: ${playlistName}`)
        .setColor(COLORS.info)
        .addFields([
          { name: 'Songs', value: songs.length.toString(), inline: true },
          { name: 'Created by', value: `<@${playlist.userId}>`, inline: true },
          { name: 'Songs (First 10)', value: songList, inline: false },
        ])
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ content: '❌ Failed to view playlist.', ephemeral: true });
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

      const songs = JSON.parse(playlist.songs);

      if (songs.length === 0) {
        await message.reply('❌ This playlist is empty.');
        return;
      }

      const songList = songs.slice(0, 10).map((song: any, index: number) => 
        `${index + 1}. ${song.title} (${song.duration || 'Unknown'})`
      ).join('\n');

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.music} Playlist: ${playlistName}`)
        .setColor(COLORS.info)
        .addFields([
          { name: 'Songs', value: songs.length.toString(), inline: true },
          { name: 'Created by', value: `<@${playlist.userId}>`, inline: true },
          { name: 'Songs (First 10)', value: songList, inline: false },
        ])
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      await message.reply('❌ Failed to view playlist.');
    }
  }
}

export default ViewPlaylistCommand;
