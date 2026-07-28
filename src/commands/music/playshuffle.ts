// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';

export class PlayShuffleCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'playshuffle',
      description: 'Shuffle and play a playlist from YouTube',
      category: 'music',
      cooldown: 5,
      userPermissions: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
      botPermissions: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['ps', 'shuffleplay'],
      examples: ['/playshuffle playlist_url', 'p!playshuffle playlist_url'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const url = interaction.options.getString('url');

    if (!url) {
      await interaction.reply({ content: '❌ Please provide a playlist URL.', ephemeral: true });
      return;
    }

    if (!interaction.member || !interaction.guild) return;

    const voiceChannel = (interaction.member as any).voice.channel;
    if (!voiceChannel) {
      await interaction.reply({ content: '❌ You need to be in a voice channel to play music.', ephemeral: true });
      return;
    }

    try {
      await interaction.deferReply();

      const client = interaction.client as any;
      const musicManager = client.kazagumo;

      if (!musicManager) {
        await interaction.editReply({ content: '❌ Music system is not available.' });
        return;
      }

      const player = client.kazagumo!.players.get(interaction.guild.id);

      if (player && player.voiceId !== voiceChannel.id) {
        await interaction.editReply({ content: '❌ I\'m already playing in another voice channel.' });
        return;
      }

      const tracks = await musicManager.loadPlaylist(url);

      if (!tracks || tracks.length === 0) {
        await interaction.editReply({ content: '❌ No tracks found in that playlist.' });
        return;
      }

      if (!player) {
        await client.kazagumo.createPlayer({ guildId: interaction.guild.id, voiceId: voiceChannel.id, textId: interaction.channel.id, volume: 80, deaf: true });
      }

      await musicManager.playShuffle(interaction.guild.id, tracks);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.music} Playlist Shuffled & Playing`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Tracks', value: tracks.length.toString(), inline: true },
          { name: 'Requested by', value: interaction.user.tag, inline: true },
        ])
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      await interaction.editReply({ content: '❌ Failed to play the playlist.' });
    }
  }

  public async executePrefix(message: Message, _args: string[]): Promise<void> {
    const url = args[0];

    if (!url) {
      await message.reply('❌ Please provide a playlist URL.');
      return;
    }

    if (!message.member || !message.guild) return;

    const voiceChannel = (message.member as any).voice.channel;
    if (!voiceChannel) {
      await message.reply('❌ You need to be in a voice channel to play music.');
      return;
    }

    try {
      await message.reply('🎵 Loading playlist...');

      const client = message.client as any;
      const musicManager = client.kazagumo;

      if (!musicManager) {
        await message.edit('❌ Music system is not available.');
        return;
      }

      const player = client.kazagumo!.players.get(message.guild.id);

      if (player && player.voiceId !== voiceChannel.id) {
        await message.edit('❌ I\'m already playing in another voice channel.');
        return;
      }

      const tracks = await musicManager.loadPlaylist(url);

      if (!tracks || tracks.length === 0) {
        await message.edit('❌ No tracks found in that playlist.');
        return;
      }

      if (!player) {
        await client.kazagumo.createPlayer({ guildId: message.guild.id, voiceId: voiceChannel.id, textId: message.channel.id, volume: 80, deaf: true });
      }

      await musicManager.playShuffle(message.guild.id, tracks);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.music} Playlist Shuffled & Playing`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Tracks', value: tracks.length.toString(), inline: true },
          { name: 'Requested by', value: message.author.tag, inline: true },
        ])
        .setTimestamp();

      await message.edit({ embeds: [embed] });
    } catch (error) {
      await message.edit('❌ Failed to play the playlist.');
    }
  }
}

export default PlayShuffleCommand;
