import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class PlayAlbumCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'playalbum',
      description: 'Play an entire album',
      category: 'music',
      cooldown: 5,
      userPermissions: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
      botPermissions: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['album'],
      examples: ['/playalbum album name artist', 'p!playalbum album name artist'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const album = interaction.options.getString('album');
    const artist = interaction.options.getString('artist');

    if (!album) {
      await interaction.reply({ content: '❌ Please provide an album name.', ephemeral: true });
      return;
    }

    if (!interaction.member || !interaction.guild) return;

    const voiceChannel = (interaction.member as any).voice.channel;
    if (!voiceChannel) {
      await interaction.reply({ content: '❌ You need to be in a voice channel to play an album.', ephemeral: true });
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

      if (player && player.voiceChannel !== voiceChannel.id) {
        await interaction.editReply({ content: '❌ I\'m already playing in another voice channel.' });
        return;
      }

      const query = artist ? `${album} ${artist}` : album;
      const tracks = await player.search(query);

      if (!tracks || tracks.length === 0) {
        await interaction.editReply({ content: '❌ No album found for that query.' });
        return;
      }

      if (!player) {
        await client.kazagumo.createPlayer({ guildId: interaction.guild.id, voiceId: voiceChannel.id, textId: interaction.channel.id, volume: 80, deaf: true });
      }

      player.queue.add(tracks);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.music} Album Added to Queue`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Album', value: album, inline: true },
          { name: 'Artist', value: artist || 'Unknown', inline: true },
          { name: 'Songs', value: tracks.length.toString(), inline: true },
          { name: 'Requested by', value: interaction.user.tag, inline: false },
        ])
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      await interaction.editReply({ content: '❌ Failed to play the album.' });
    }
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const album = args[0];
    const artist = args.slice(1).join(' ');

    if (!album) {
      await message.reply('❌ Please provide an album name.');
      return;
    }

    if (!message.member || !message.guild) return;

    const voiceChannel = (message.member as any).voice.channel;
    if (!voiceChannel) {
      await message.reply('❌ You need to be in a voice channel to play an album.');
      return;
    }

    try {
      await message.reply('🎵 Searching for album...');

      const client = message.client as any;
      const musicManager = client.kazagumo;

      if (!musicManager) {
        await message.edit('❌ Music system is not available.');
        return;
      }

      const player = client.kazagumo!.players.get(message.guild.id);

      if (player && player.voiceChannel !== voiceChannel.id) {
        await message.edit('❌ I\'m already playing in another voice channel.');
        return;
      }

      const query = artist ? `${album} ${artist}` : album;
      const tracks = await player.search(query);

      if (!tracks || tracks.length === 0) {
        await message.edit('❌ No album found for that query.');
        return;
      }

      if (!player) {
        await client.kazagumo.createPlayer({ guildId: message.guild.id, voiceId: voiceChannel.id, textId: message.channel.id, volume: 80, deaf: true });
      }

      player.queue.add(tracks);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.music} Album Added to Queue`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Album', value: album, inline: true },
          { name: 'Artist', value: artist || 'Unknown', inline: true },
          { name: 'Songs', value: tracks.length.toString(), inline: true },
          { name: 'Requested by', value: message.author.tag, inline: false },
        ])
        .setTimestamp();

      await message.edit({ embeds: [embed] });
    } catch (error) {
      await message.edit('❌ Failed to play the album.');
    }
  }
}

export default PlayAlbumCommand;
