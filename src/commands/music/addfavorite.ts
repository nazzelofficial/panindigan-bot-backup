import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';
import { getPrismaClient } from '../../database/postgresql/client';

export class AddFavoriteCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'addfavorite',
      description: 'Add the current song to your favorites',
      category: 'music',
      cooldown: 5,
      userPermissions: [PermissionFlagsBits.Connect],
      botPermissions: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['af', 'fav', 'like'],
      examples: ['/addfavorite', 'p!addfavorite'],
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
      const user = await prisma.user.upsert({
        where: { userId: interaction.user.id },
        update: {},
        create: { userId: interaction.user.id },
      });

      const favoriteSongs = user.favoriteSongs ? JSON.parse(user.favoriteSongs) : [];

      if (favoriteSongs.some((song: any) => song.title === player.currentTrack.title)) {
        await interaction.reply({ content: '❌ This song is already in your favorites.', ephemeral: true });
        return;
      }

      favoriteSongs.push(player.currentTrack);

      await prisma.user.update({
        where: { userId: interaction.user.id },
        data: { favoriteSongs: JSON.stringify(favoriteSongs) },
      });

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.success} Added to Favorites`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Song', value: player.currentTrack.title, inline: true },
          { name: 'Added by', value: interaction.user.tag, inline: true },
        ])
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ content: '❌ Failed to add to favorites.', ephemeral: true });
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
      const user = await prisma.user.upsert({
        where: { userId: message.author.id },
        update: {},
        create: { userId: message.author.id },
      });

      const favoriteSongs = user.favoriteSongs ? JSON.parse(user.favoriteSongs) : [];

      if (favoriteSongs.some((song: any) => song.title === player.currentTrack.title)) {
        await message.reply('❌ This song is already in your favorites.');
        return;
      }

      favoriteSongs.push(player.currentTrack);

      await prisma.user.update({
        where: { userId: message.author.id },
        data: { favoriteSongs: JSON.stringify(favoriteSongs) },
      });

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.success} Added to Favorites`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Song', value: player.currentTrack.title, inline: true },
          { name: 'Added by', value: message.author.tag, inline: true },
        ])
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      await message.reply('❌ Failed to add to favorites.');
    }
  }
}

export default AddFavoriteCommand;
