// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import {
  ChatInputCommandInteraction,
  Message,
  EmbedBuilder,
  PermissionFlagsBits,
  SlashCommandBuilder,
  GuildMember,
} from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { PanindiganClient } from '../../structures/PanindiganClient.js';

export class PlayCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'play',
      description: 'Play a song or add it to the queue',
      category: 'music',
      cooldown: 2,
      userPermissions: [],
      botPermissions: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['p', 'music', 'pl'],
      examples: ['/play Never Gonna Give You Up', 'p!play https://youtube.com/watch?v=...'],
    };
    super(options);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addStringOption(opt =>
        opt.setName('query').setDescription('Song name, URL, or search query').setRequired(true)
      )
      .setDMPermission(false)) as SlashCommandBuilder;
  }

  private async getVoiceChannel(member: GuildMember | null) {
    return (member as any)?.voice?.channel ?? null;
  }

  private formatDuration(ms: number): string {
    if (!ms) return 'Live';
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const h = Math.floor(m / 60);
    if (h > 0) return `${h}:${String(m % 60).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
    return `${m}:${String(s % 60).padStart(2, '0')}`;
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const client = interaction.client as PanindiganClient;
    const query = interaction.options.getString('query', true);

    if (!client.kazagumo) {
      await interaction.reply({ content: '❌ Music system is not available.', ephemeral: true });
      return;
    }

    const member = interaction.member as GuildMember;
    const voiceChannel = await this.getVoiceChannel(member);

    if (!voiceChannel) {
      await interaction.reply({ content: '❌ You need to be in a voice channel to play music.', ephemeral: true });
      return;
    }

    const guild = interaction.guild!;
    const textChannel = interaction.channel!;

    await interaction.deferReply();

    try {
      let player = client.kazagumo.players.get(guild.id);

      if (player && player.voiceId && player.voiceId !== voiceChannel.id) {
        await interaction.editReply({ content: '❌ I\'m already playing in another voice channel.' });
        return;
      }

      if (!player) {
        player = await client.kazagumo.createPlayer({
          guildId: guild.id,
          voiceId: voiceChannel.id,
          textId: textChannel.id,
          volume: 80,
          deaf: true,
        });
      }

      const result = await player.search(query, { requester: interaction.user });

      if (!result || !result.tracks.length || result.type === 'ERROR') {
        await interaction.editReply({ content: '❌ No results found. Try a different query.' });
        return;
      }

      const isPlaylist = result.type === 'PLAYLIST';
      const tracks = isPlaylist ? result.tracks : [result.tracks[0]];
      player.queue.add(tracks);

      const track = tracks[0];
      const queueSize = player.queue.size + (player.queue.current ? 1 : 0);
      const position = isPlaylist ? 'Added playlist' : queueSize;

      const embed = new EmbedBuilder()
        .setColor(COLORS.default)
        .setTimestamp();

      if (isPlaylist) {
        embed
          .setTitle(`${EMOJIS.music} Playlist Added`)
          .addFields(
            { name: 'Playlist', value: result.playlistName || 'Unknown', inline: true },
            { name: 'Tracks', value: `${tracks.length}`, inline: true },
            { name: 'Requested by', value: interaction.user.toString(), inline: false },
          );
      } else {
        embed
          .setTitle(`${EMOJIS.music} ${player.playing || player.queue.current ? 'Added to Queue' : 'Now Playing'}`)
          .addFields(
            { name: 'Track', value: `[${track.title}](${track.uri})`, inline: false },
            { name: 'Artist', value: track.author || 'Unknown', inline: true },
            { name: 'Duration', value: this.formatDuration(track.length ?? 0), inline: true },
            { name: 'Requested by', value: interaction.user.toString(), inline: false },
          );
        if (track.thumbnail) embed.setThumbnail(track.thumbnail);
        if (player.playing || player.queue.current) {
          embed.addFields({ name: 'Position in Queue', value: `#${position}`, inline: true });
        }
      }

      if (!player.playing && !player.paused) await player.play();

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('Play command error:', error);
      await interaction.editReply({ content: '❌ Failed to play the song. Please try again.' });
    }
  }

  public async executePrefix(message: Message, _args: string[]): Promise<void> {
    const client = message.client as PanindiganClient;
    const query = _args.join(' ');

    if (!query) {
      await message.reply('❌ Please provide a song name or URL. Example: `p!play Never Gonna Give You Up`');
      return;
    }

    if (!client.kazagumo) {
      await message.reply('❌ Music system is not available.');
      return;
    }

    const member = message.member as GuildMember;
    const voiceChannel = await this.getVoiceChannel(member);

    if (!voiceChannel) {
      await message.reply('❌ You need to be in a voice channel to play music.');
      return;
    }

    const guild = message.guild!;
    const searching = await message.reply('🎵 Searching...');

    try {
      let player = client.kazagumo.players.get(guild.id);

      if (player && player.voiceId && player.voiceId !== voiceChannel.id) {
        await searching.edit('❌ I\'m already playing in another voice channel.');
        return;
      }

      if (!player) {
        player = await client.kazagumo.createPlayer({
          guildId: guild.id,
          voiceId: voiceChannel.id,
          textId: message.channel.id,
          volume: 80,
          deaf: true,
        });
      }

      const result = await player.search(query, { requester: message.author });

      if (!result || !result.tracks.length || result.type === 'ERROR') {
        await searching.edit('❌ No results found. Try a different query.');
        return;
      }

      const isPlaylist = result.type === 'PLAYLIST';
      const tracks = isPlaylist ? result.tracks : [result.tracks[0]];
      player.queue.add(tracks);

      const track = tracks[0];
      const queueSize = player.queue.size + (player.queue.current ? 1 : 0);

      const embed = new EmbedBuilder()
        .setColor(COLORS.default)
        .setTimestamp();

      if (isPlaylist) {
        embed
          .setTitle(`${EMOJIS.music} Playlist Added`)
          .addFields(
            { name: 'Playlist', value: result.playlistName || 'Unknown', inline: true },
            { name: 'Tracks', value: `${tracks.length}`, inline: true },
            { name: 'Requested by', value: message.author.toString(), inline: false },
          );
      } else {
        embed
          .setTitle(`${EMOJIS.music} ${player.playing || player.queue.current ? 'Added to Queue' : 'Now Playing'}`)
          .addFields(
            { name: 'Track', value: `[${track.title}](${track.uri})`, inline: false },
            { name: 'Artist', value: track.author || 'Unknown', inline: true },
            { name: 'Duration', value: this.formatDuration(track.length ?? 0), inline: true },
            { name: 'Requested by', value: message.author.toString(), inline: false },
          );
        if (track.thumbnail) embed.setThumbnail(track.thumbnail);
        if (player.playing || player.queue.current) {
          embed.addFields({ name: 'Position in Queue', value: `#${queueSize}`, inline: true });
        }
      }

      if (!player.playing && !player.paused) await player.play();

      await searching.edit({ content: null, embeds: [embed] });
    } catch (error) {
      console.error('Play command error:', error);
      await searching.edit('❌ Failed to play the song. Please try again.');
    }
  }
}

export default PlayCommand;
