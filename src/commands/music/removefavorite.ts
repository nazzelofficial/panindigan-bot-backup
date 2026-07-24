import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';
import { getPrismaClient } from '../../database/postgresql/client';

export class RemoveFavoriteCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'removefavorite',
      description: 'Remove a song from your favorites',
      category: 'music',
      cooldown: 5,
      userPermissions: [PermissionFlagsBits.Connect],
      botPermissions: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['rf', 'unfav', 'dislike'],
      examples: ['/removefavorite', 'p!removefavorite'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guildId) return;

    try {
      const client = interaction.client as any;
      const musicManager = client.kazagumo;

      if (!musicManager) {
        await interaction.reply({ content: '❌ Music system is not available.', ephemeral: true });
        return;
      }

      const player = client.kazagumo!.players.get(interaction.guildId);
      if (!player || !player.currentTrack) {
        await interaction.reply({ content: '❌ Nothing is currently playing.', ephemeral: true });
        return;
      }

      const prisma = getPrismaClient();
      const user = await prisma.user.findUnique({
        where: { userId: interaction.user.id },
      });

      if (!user || !user.favoriteSongs) {
        await interaction.reply({ content: '❌ You have no favorite songs.', ephemeral: true });
        return;
      }

      const favoriteSongs = JSON.parse(user.favoriteSongs);
      const songIndex = favoriteSongs.findIndex((song: any) => song.title === player.currentTrack.title);

      if (songIndex === -1) {
        await interaction.reply({ content: '❌ This song is not in your favorites.', ephemeral: true });
        return;
      }

      favoriteSongs.splice(songIndex, 1);

      await prisma.user.update({
        where: { userId: interaction.user.id },
        data: { favoriteSongs: JSON.stringify(favoriteSongs) },
      });

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.success} Removed from Favorites`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Song', value: player.currentTrack.title, inline: true },
          { name: 'Removed by', value: interaction.user.tag, inline: true },
        ])
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ content: '❌ Failed to remove from favorites.', ephemeral: true });
    }
  }

  public async executePrefix(message: Message): Promise<void> {
    if (!message.guildId) return;

    try {
      const client = message.client as any;
      const musicManager = client.kazagumo;

      if (!musicManager) {
        await message.reply('❌ Music system is not available.');
        return;
      }

      const player = client.kazagumo!.players.get(message.guildId);
      if (!player || !player.currentTrack) {
        await message.reply('❌ Nothing is currently playing.');
        return;
      }

      const prisma = getPrismaClient();
      const user = await prisma.user.findUnique({
        where: { userId: message.author.id },
      });

      if (!user || !user.favoriteSongs) {
        await message.reply('❌ You have no favorite songs.');
        return;
      }

      const favoriteSongs = JSON.parse(user.favoriteSongs);
      const songIndex = favoriteSongs.findIndex((song: any) => song.title === player.currentTrack.title);

      if (songIndex === -1) {
        await message.reply('❌ This song is not in your favorites.');
        return;
      }

      favoriteSongs.splice(songIndex, 1);

      await prisma.user.update({
        where: { userId: message.author.id },
        data: { favoriteSongs: JSON.stringify(favoriteSongs) },
      });

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.success} Removed from Favorites`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Song', value: player.currentTrack.title, inline: true },
          { name: 'Removed by', value: message.author.tag, inline: true },
        ])
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      await message.reply('❌ Failed to remove from favorites.');
    }
  }
}

export default RemoveFavoriteCommand;
