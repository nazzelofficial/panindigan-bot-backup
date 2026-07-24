import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';
import { getPrismaClient } from '../../database/postgresql/client';

export class PlayFavoritesCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'playfavorites',
      description: 'Play your favorite songs',
      category: 'music',
      cooldown: 5,
      userPermissions: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
      botPermissions: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['pf', 'favs'],
      examples: ['/playfavorites', 'p!playfavorites'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.member || !interaction.guild) return;

    const voiceChannel = (interaction.member as any).voice.channel;
    if (!voiceChannel) {
      await interaction.reply({ content: '❌ You need to be in a voice channel to play favorites.', ephemeral: true });
      return;
    }

    if (!interaction.guildId) return;

    try {
      const prisma = getPrismaClient();
      const user = await prisma.user.findUnique({
        where: { userId: interaction.user.id },
      });

      if (!user || !user.favoriteSongs || JSON.parse(user.favoriteSongs).length === 0) {
        await interaction.reply({ content: '❌ You have no favorite songs.', ephemeral: true });
        return;
      }

      const favoriteSongs = JSON.parse(user.favoriteSongs);

      const client = interaction.client as any;
      const musicManager = client.kazagumo;

      if (!musicManager) {
        await interaction.reply({ content: '❌ Music system is not available.', ephemeral: true });
        return;
      }

      const player = client.kazagumo!.players.get(interaction.guild.id);

      if (player && player.voiceChannel !== voiceChannel.id) {
        await interaction.reply({ content: '❌ I\'m already playing in another voice channel.', ephemeral: true });
        return;
      }

      if (!player) {
        await client.kazagumo.createPlayer({ guildId: interaction.guild.id, voiceId: voiceChannel.id, textId: interaction.channel.id, volume: 80, deaf: true });
      }

      player.queue.add(favoriteSongs);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.music} Playing Favorites`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Songs', value: favoriteSongs.length.toString(), inline: true },
          { name: 'Requested by', value: interaction.user.tag, inline: true },
        ])
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ content: '❌ Failed to play favorites.', ephemeral: true });
    }
  }

  public async executePrefix(message: Message): Promise<void> {
    if (!message.member || !message.guild) return;

    const voiceChannel = (message.member as any).voice.channel;
    if (!voiceChannel) {
      await message.reply('❌ You need to be in a voice channel to play favorites.');
      return;
    }

    if (!message.guildId) return;

    try {
      const prisma = getPrismaClient();
      const user = await prisma.user.findUnique({
        where: { userId: message.author.id },
      });

      if (!user || !user.favoriteSongs || JSON.parse(user.favoriteSongs).length === 0) {
        await message.reply('❌ You have no favorite songs.');
        return;
      }

      const favoriteSongs = JSON.parse(user.favoriteSongs);

      const client = message.client as any;
      const musicManager = client.kazagumo;

      if (!musicManager) {
        await message.reply('❌ Music system is not available.');
        return;
      }

      const player = client.kazagumo!.players.get(message.guild.id);

      if (player && player.voiceChannel !== voiceChannel.id) {
        await message.reply('❌ I\'m already playing in another voice channel.');
        return;
      }

      if (!player) {
        await client.kazagumo.createPlayer({ guildId: message.guild.id, voiceId: voiceChannel.id, textId: message.channel.id, volume: 80, deaf: true });
      }

      player.queue.add(favoriteSongs);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.music} Playing Favorites`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Songs', value: favoriteSongs.length.toString(), inline: true },
          { name: 'Requested by', value: message.author.tag, inline: true },
        ])
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      await message.reply('❌ Failed to play favorites.');
    }
  }
}

export default PlayFavoritesCommand;
