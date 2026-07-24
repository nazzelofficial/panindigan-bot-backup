import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class PlayArtistCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'playartist',
      description: 'Play top songs by an artist',
      category: 'music',
      cooldown: 5,
      userPermissions: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
      botPermissions: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['artist', 'artisttop'],
      examples: ['/playartist artist name', 'p!playartist artist name'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const artist = interaction.options.getString('artist');

    if (!artist) {
      await interaction.reply({ content: '❌ Please provide an artist name.', ephemeral: true });
      return;
    }

    if (!interaction.member || !interaction.guild) return;

    const voiceChannel = (interaction.member as any).voice.channel;
    if (!voiceChannel) {
      await interaction.reply({ content: '❌ You need to be in a voice channel to play artist songs.', ephemeral: true });
      return;
    }

    try {
      await interaction.deferReply();

      const client = interaction.client as any;
      const musicManager = client.musicManager;

      if (!musicManager) {
        await interaction.editReply({ content: '❌ Music system is not available.' });
        return;
      }

      const player = musicManager.get(interaction.guild.id);

      if (player && player.voiceChannel !== voiceChannel.id) {
        await interaction.editReply({ content: '❌ I\'m already playing in another voice channel.' });
        return;
      }

      const tracks = await musicManager.searchArtist(artist);

      if (!tracks || tracks.length === 0) {
        await interaction.editReply({ content: '❌ No songs found for that artist.' });
        return;
      }

      if (!player) {
        await musicManager.create(interaction.guild.id, voiceChannel.id, interaction.channel.id);
      }

      await musicManager.loadQueue(interaction.guild.id, tracks);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.music} Artist Songs Added to Queue`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Artist', value: artist, inline: true },
          { name: 'Songs', value: tracks.length.toString(), inline: true },
          { name: 'Requested by', value: interaction.user.tag, inline: false },
        ])
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      await interaction.editReply({ content: '❌ Failed to play artist songs.' });
    }
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const artist = args.join(' ');

    if (!artist) {
      await message.reply('❌ Please provide an artist name.');
      return;
    }

    if (!message.member || !message.guild) return;

    const voiceChannel = (message.member as any).voice.channel;
    if (!voiceChannel) {
      await message.reply('❌ You need to be in a voice channel to play artist songs.');
      return;
    }

    try {
      await message.reply('🎵 Searching for artist...');

      const client = message.client as any;
      const musicManager = client.musicManager;

      if (!musicManager) {
        await message.edit('❌ Music system is not available.');
        return;
      }

      const player = musicManager.get(message.guild.id);

      if (player && player.voiceChannel !== voiceChannel.id) {
        await message.edit('❌ I\'m already playing in another voice channel.');
        return;
      }

      const tracks = await musicManager.searchArtist(artist);

      if (!tracks || tracks.length === 0) {
        await message.edit('❌ No songs found for that artist.');
        return;
      }

      if (!player) {
        await musicManager.create(message.guild.id, voiceChannel.id, message.channel.id);
      }

      await musicManager.loadQueue(message.guild.id, tracks);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.music} Artist Songs Added to Queue`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Artist', value: artist, inline: true },
          { name: 'Songs', value: tracks.length.toString(), inline: true },
          { name: 'Requested by', value: message.author.tag, inline: false },
        ])
        .setTimestamp();

      await message.edit({ embeds: [embed] });
    } catch (error) {
      await message.edit('❌ Failed to play artist songs.');
    }
  }
}

export default PlayArtistCommand;
