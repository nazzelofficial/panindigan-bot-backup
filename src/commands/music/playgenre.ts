import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class PlayGenreCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'playgenre',
      description: 'Play songs by genre',
      category: 'music',
      cooldown: 5,
      userPermissions: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
      botPermissions: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['genre'],
      examples: ['/playgenre pop', 'p!playgenre rock'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const genre = interaction.options.getString('genre');

    if (!genre) {
      await interaction.reply({ content: '❌ Please provide a genre.', ephemeral: true });
      return;
    }

    if (!interaction.member || !interaction.guild) return;

    const voiceChannel = (interaction.member as any).voice.channel;
    if (!voiceChannel) {
      await interaction.reply({ content: '❌ You need to be in a voice channel to play genre songs.', ephemeral: true });
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

      const tracks = await musicManager.searchGenre(genre);

      if (!tracks || tracks.length === 0) {
        await interaction.editReply({ content: '❌ No songs found for that genre.' });
        return;
      }

      if (!player) {
        await musicManager.create(interaction.guild.id, voiceChannel.id, interaction.channel.id);
      }

      await musicManager.loadQueue(interaction.guild.id, tracks);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.music} Genre Songs Added to Queue`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Genre', value: genre, inline: true },
          { name: 'Songs', value: tracks.length.toString(), inline: true },
          { name: 'Requested by', value: interaction.user.tag, inline: false },
        ])
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      await interaction.editReply({ content: '❌ Failed to play genre songs.' });
    }
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const genre = args.join(' ');

    if (!genre) {
      await message.reply('❌ Please provide a genre.');
      return;
    }

    if (!message.member || !message.guild) return;

    const voiceChannel = (message.member as any).voice.channel;
    if (!voiceChannel) {
      await message.reply('❌ You need to be in a voice channel to play genre songs.');
      return;
    }

    try {
      await message.reply('🎵 Searching for genre...');

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

      const tracks = await musicManager.searchGenre(genre);

      if (!tracks || tracks.length === 0) {
        await message.edit('❌ No songs found for that genre.');
        return;
      }

      if (!player) {
        await musicManager.create(message.guild.id, voiceChannel.id, message.channel.id);
      }

      await musicManager.loadQueue(message.guild.id, tracks);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.music} Genre Songs Added to Queue`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Genre', value: genre, inline: true },
          { name: 'Songs', value: tracks.length.toString(), inline: true },
          { name: 'Requested by', value: message.author.tag, inline: false },
        ])
        .setTimestamp();

      await message.edit({ embeds: [embed] });
    } catch (error) {
      await message.edit('❌ Failed to play genre songs.');
    }
  }
}

export default PlayGenreCommand;
