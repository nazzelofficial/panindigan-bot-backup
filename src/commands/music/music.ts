import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import {
  ChatInputCommandInteraction, Message, SlashCommandBuilder, EmbedBuilder,
  ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType,
  ModalBuilder, TextInputBuilder, TextInputStyle, StringSelectMenuBuilder,
  GuildMember,
} from 'discord.js';
import { ErrorHandler } from '../../handlers/ErrorHandler.js';
import { SuccessHandler } from '../../handlers/SuccessHandler.js';
import { EmbedManager } from '../../structures/EmbedManager.js';
import { ComponentBuilder } from '../../structures/ComponentBuilder.js';
import { getPrismaClient } from '../../database/postgresql/client.js';
import { COLORS } from '../../constants/DesignSystem.js';
import { MusicUI, Track } from '../../structures/MusicUI.js';
import { QueueUI } from '../../structures/QueueUI.js';
import { PanindiganClient } from '../../structures/PanindiganClient.js';
import { LyricsService } from '../../services/LyricsService.js';

export class MusicCommand extends BaseCommand {
  constructor() {
    super({
      name: 'music',
      description: 'Control music playback and manage queues',
      category: 'music',
      premiumTier: 'free',
      cooldown: 2,
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['m', 'player'],
      examples: ['/music play Never Gonna Give You Up', '/music queue', '/music pause'],
    } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder()
      .setName(this.name).setDescription(this.description)
      
      // Player Controls Subcommand Group
      .addSubcommandGroup(g => g.setName('player').setDescription('Control music playback')
        .addSubcommand(s => s.setName('play').setDescription('Play a song or add to queue')
          .addStringOption(o => o.setName('query').setDescription('Song name, URL, or search query').setRequired(true)))
        .addSubcommand(s => s.setName('pause').setDescription('Pause the current track'))
        .addSubcommand(s => s.setName('resume').setDescription('Resume playback'))
        .addSubcommand(s => s.setName('stop').setDescription('Stop playback and clear queue'))
        .addSubcommand(s => s.setName('skip').setDescription('Skip the current track'))
        .addSubcommand(s => s.setName('previous').setDescription('Play the previous track'))
        .addSubcommand(s => s.setName('seek').setDescription('Seek to a position')
          .addIntegerOption(o => o.setName('seconds').setDescription('Position in seconds').setRequired(true)))
        .addSubcommand(s => s.setName('replay').setDescription('Replay the current track'))
        .addSubcommand(s => s.setName('shuffle').setDescription('Shuffle the queue'))
        .addSubcommand(s => s.setName('loop').setDescription('Toggle loop mode')
          .addStringOption(o => o.setName('mode').setDescription('Loop mode').setRequired(true)
            .addChoices({ name: 'Off', value: 'off' }, { name: 'Track', value: 'track' }, { name: 'Queue', value: 'queue' })))
        .addSubcommand(s => s.setName('volume').setDescription('Set volume')
          .addIntegerOption(o => o.setName('level').setDescription('Volume level (0-100)').setRequired(true).setMinValue(0).setMaxValue(100)))
        .addSubcommand(s => s.setName('nowplaying').setDescription('Show currently playing track')))
      
      // Queue Management Subcommand Group
      .addSubcommandGroup(g => g.setName('queue').setDescription('Manage the music queue')
        .addSubcommand(s => s.setName('show').setDescription('Show the current queue'))
        .addSubcommand(s => s.setName('clear').setDescription('Clear the queue'))
        .addSubcommand(s => s.setName('remove').setDescription('Remove a track from queue')
          .addIntegerOption(o => o.setName('position').setDescription('Track position to remove').setRequired(true)))
        .addSubcommand(s => s.setName('move').setDescription('Move a track in queue')
          .addIntegerOption(o => o.setName('from').setDescription('Current position').setRequired(true))
          .addIntegerOption(o => o.setName('to').setDescription('New position').setRequired(true))))
      
      // Playlist Subcommand Group
      .addSubcommandGroup(g => g.setName('playlist').setDescription('Manage playlists')
        .addSubcommand(s => s.setName('create').setDescription('Create a new playlist'))
        .addSubcommand(s => s.setName('list').setDescription('List your playlists'))
        .addSubcommand(s => s.setName('show').setDescription('Show playlist details')
          .addStringOption(o => o.setName('name').setDescription('Playlist name').setRequired(true)))
        .addSubcommand(s => s.setName('add').setDescription('Add current track to playlist')
          .addStringOption(o => o.setName('name').setDescription('Playlist name').setRequired(true)))
        .addSubcommand(s => s.setName('remove').setDescription('Remove track from playlist')
          .addStringOption(o => o.setName('name').setDescription('Playlist name').setRequired(true))
          .addIntegerOption(o => o.setName('position').setDescription('Track position').setRequired(true)))
        .addSubcommand(s => s.setName('delete').setDescription('Delete a playlist')
          .addStringOption(o => o.setName('name').setDescription('Playlist name').setRequired(true))))
      
      // Audio Filters Subcommand Group
      .addSubcommandGroup(g => g.setName('filter').setDescription('Apply audio filters')
        .addSubcommand(s => s.setName('bassboost').setDescription('Toggle bass boost'))
        .addSubcommand(s => s.setName('nightcore').setDescription('Toggle nightcore effect'))
        .addSubcommand(s => s.setName('vaporwave').setDescription('Toggle vaporwave effect'))
        .addSubcommand(s => s.setName('8d').setDescription('Toggle 8D audio effect'))
        .addSubcommand(s => s.setName('reset').setDescription('Reset all filters')))
      
      // Voice Subcommand Group
      .addSubcommandGroup(g => g.setName('voice').setDescription('Voice channel management')
        .addSubcommand(s => s.setName('join').setDescription('Join your voice channel'))
        .addSubcommand(s => s.setName('leave').setDescription('Leave the voice channel'))
        .addSubcommand(s => s.setName('disconnect').setDescription('Disconnect from voice channel')))
      
      // Search Subcommand
      .addSubcommand(s => s.setName('search').setDescription('Search for songs')
        .addStringOption(o => o.setName('query').setDescription('Search query').setRequired(true)))
      
      // Lyrics Subcommand
      .addSubcommand(s => s.setName('lyrics').setDescription('Get lyrics for current track'))
      
      // Stats Subcommand
      .addSubcommand(s => s.setName('stats').setDescription('Show music statistics'))
      
      .setDMPermission(false)) as SlashCommandBuilder;
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    const subcommandGroup = i.options.getSubcommandGroup();
    const subcommand = i.options.getSubcommand();

    if (subcommandGroup === 'player') {
      switch (subcommand) {
        case 'play': await this.handlePlay(i); break;
        case 'pause': await this.handlePause(i); break;
        case 'resume': await this.handleResume(i); break;
        case 'stop': await this.handleStop(i); break;
        case 'skip': await this.handleSkip(i); break;
        case 'previous': await this.handlePrevious(i); break;
        case 'seek': await this.handleSeek(i); break;
        case 'replay': await this.handleReplay(i); break;
        case 'shuffle': await this.handleShuffle(i); break;
        case 'loop': await this.handleLoop(i); break;
        case 'volume': await this.handleVolume(i); break;
        case 'nowplaying': await this.handleNowPlaying(i); break;
      }
    } else if (subcommandGroup === 'queue') {
      switch (subcommand) {
        case 'show': await this.handleQueueShow(i); break;
        case 'clear': await this.handleQueueClear(i); break;
        case 'remove': await this.handleQueueRemove(i); break;
        case 'move': await this.handleQueueMove(i); break;
      }
    } else if (subcommandGroup === 'playlist') {
      switch (subcommand) {
        case 'create': await this.handlePlaylistCreate(i); break;
        case 'list': await this.handlePlaylistList(i); break;
        case 'show': await this.handlePlaylistShow(i); break;
        case 'add': await this.handlePlaylistAdd(i); break;
        case 'remove': await this.handlePlaylistRemove(i); break;
        case 'delete': await this.handlePlaylistDelete(i); break;
      }
    } else if (subcommandGroup === 'filter') {
      switch (subcommand) {
        case 'bassboost': await this.handleFilterBassboost(i); break;
        case 'nightcore': await this.handleFilterNightcore(i); break;
        case 'vaporwave': await this.handleFilterVaporwave(i); break;
        case '8d': await this.handleFilter8D(i); break;
        case 'reset': await this.handleFilterReset(i); break;
      }
    } else if (subcommandGroup === 'voice') {
      switch (subcommand) {
        case 'join': await this.handleVoiceJoin(i); break;
        case 'leave': await this.handleVoiceLeave(i); break;
        case 'disconnect': await this.handleVoiceDisconnect(i); break;
      }
    } else {
      switch (subcommand) {
        case 'search': await this.handleSearch(i); break;
        case 'lyrics': await this.handleLyrics(i); break;
        case 'stats': await this.handleStats(i); break;
      }
    }
  }

  // Player Control Handlers
  private async handlePlay(i: ChatInputCommandInteraction): Promise<void> {
    const client = i.client as PanindiganClient;
    const query = i.options.getString('query', true);

    if (!client.kazagumo) {
      await ErrorHandler.music(i, 'not_in_voice');
      return;
    }

    const member = i.member as GuildMember;
    const voiceChannel = member?.voice?.channel;

    if (!voiceChannel) {
      await ErrorHandler.music(i, 'not_in_voice');
      return;
    }

    const guild = i.guild!;
    const textChannel = i.channel!;

    await i.deferReply();

    try {
      let player = client.kazagumo.players.get(guild.id);

      if (player && player.voiceId && player.voiceId !== voiceChannel.id) {
        await i.editReply({ embeds: [EmbedManager.error('Already in a Channel', 'I\'m already playing music in another voice channel.\n\n> 💡 Join that channel or wait until I finish there.')] });
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

      const result = await player.search(query, { requester: i.user });

      if (!result || !result.tracks.length || result.type === 'ERROR') {
        await i.editReply({ embeds: [MusicUI.createNoResultsEmbed(query)] });
        return;
      }

      const isPlaylist = result.type === 'PLAYLIST';
      const tracks = isPlaylist ? result.tracks : [result.tracks[0]];
      player.queue.add(tracks);

      const track = tracks[0];
      const queueSize = player.queue.size + (player.queue.current ? 1 : 0);

      if (isPlaylist) {
        await i.editReply({ embeds: [QueueUI.createAddedEmbed(track, queueSize, queueSize)] });
      } else {
        const trackData: Track = {
          title: track.title,
          artist: track.author || 'Unknown',
          duration: track.length || 0,
          position: 0,
          thumbnail: track.thumbnail,
          url: track.uri,
          requester: i.user.id,
          source: 'unknown',
        };
        
        if (player.playing || player.queue.current) {
          await i.editReply({ embeds: [QueueUI.createAddedEmbed(trackData, queueSize, queueSize)] });
        } else {
          await i.editReply({ embeds: [MusicUI.createTrackStartedEmbed(trackData)] });
        }
      }

      if (!player.playing && !player.paused) await player.play();
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handlePause(i: ChatInputCommandInteraction): Promise<void> {
    if (!i.guild || !i.member) return;

    const voiceChannel = (i.member as GuildMember).voice.channel;
    if (!voiceChannel) {
      await ErrorHandler.music(i, 'not_in_voice');
      return;
    }

    try {
      const client = i.client as PanindiganClient;

      if (!client.kazagumo) {
        await ErrorHandler.send(i, { title: 'Music Unavailable', description: 'The music system is currently offline. Please try again later.', howToFix: 'Contact server admins if the issue persists.' });
        return;
      }

      const player = client.kazagumo.players.get(i.guild.id);

      if (!player) {
        await ErrorHandler.music(i, 'no_track');
        return;
      }

      if (player.voiceId !== voiceChannel.id) {
        await ErrorHandler.send(i, { title: 'Wrong Voice Channel', description: 'You must be in the **same voice channel** as me to control playback.', howToFix: `Join <#${player.voiceId}> and try again.` });
        return;
      }

      if (player.paused) {
        await ErrorHandler.send(i, { title: 'Already Paused', description: 'The music is already paused.\n\n> Use `/music player resume` to continue playback.' });
        return;
      }

      await player.pause(true);

      const currentTrack = player.queue.current;
      const pos = player.position || 0;
      const dur = currentTrack.length || 0;

      const embed = EmbedManager.music('Paused',
        `⏸️ **${currentTrack.title}** has been paused.`,
        {
          fields: [
            { name: '🎤 Artist', value: currentTrack.author || 'Unknown', inline: true },
            { name: '⏱️ Position', value: `${this.formatDuration(pos)} / ${this.formatDuration(dur)}`, inline: true },
            { name: '👤 Paused by', value: `<@${i.user.id}>`, inline: true },
          ],
          thumbnail: currentTrack.thumbnail ?? undefined,
        }
      );
      const controls = ComponentBuilder.musicControlRow(i.guild.id, true);
      await i.reply({ embeds: [embed], components: [controls] });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleStop(i: ChatInputCommandInteraction): Promise<void> {
    if (!i.guild || !i.member) return;

    const voiceChannel = (i.member as GuildMember).voice.channel;
    if (!voiceChannel) {
      await ErrorHandler.music(i, 'not_in_voice');
      return;
    }

    try {
      const client = i.client as PanindiganClient;

      if (!client.kazagumo) {
        await ErrorHandler.send(i, { title: 'Music Unavailable', description: 'The music system is currently offline. Please try again later.' });
        return;
      }

      const player = client.kazagumo.players.get(i.guild.id);

      if (!player) {
        await ErrorHandler.music(i, 'no_track');
        return;
      }

      if (player.voiceId !== voiceChannel.id) {
        await ErrorHandler.send(i, { title: 'Wrong Voice Channel', description: `You must be in <#${player.voiceId}> to control playback.` });
        return;
      }

      const currentTrack = player.queue.current;
      const trackTitle = currentTrack ? currentTrack.title : 'Unknown';
      const queueSize = player.queue.size;
      
      player.destroy();

      const embed = EmbedManager.music('Playback Stopped',
        `⏹️ Stopped **${trackTitle}** and cleared the queue.`,
        {
          fields: [
            { name: '🎵 Last Track', value: trackTitle, inline: true },
            { name: '📋 Tracks Removed', value: `${queueSize}`, inline: true },
            { name: '👤 Stopped by', value: `<@${i.user.id}>`, inline: true },
            { name: '💡 Tip', value: 'Use `/music player play` to start a new session anytime!', inline: false },
          ],
        }
      );
      await i.reply({ embeds: [embed] });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleSkip(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    
    if (!i.guild || !i.member) {
      await ErrorHandler.send(i, { title: 'Server Only', description: 'This command can only be used in a **server**. DMs are not supported.' });
      return;
    }

    const voiceChannel = (i.member as GuildMember).voice.channel;
    if (!voiceChannel) {
      await ErrorHandler.music(i, 'not_in_voice');
      return;
    }

    try {
      const client = i.client as PanindiganClient;

      if (!client.kazagumo) {
        await ErrorHandler.send(i, { title: 'Music Unavailable', description: 'The music system is currently offline. Please try again later.' });
        return;
      }

      const player = client.kazagumo.players.get(i.guild.id);

      if (!player) {
        await ErrorHandler.music(i, 'no_track');
        return;
      }

      if (player.voiceId !== voiceChannel.id) {
        await ErrorHandler.send(i, { title: 'Wrong Voice Channel', description: 'You must be in the **same voice channel** as the bot to control playback.' });
        return;
      }

      if (player.queue.size === 0) {
        await ErrorHandler.music(i, 'queue_empty');
        return;
      }

      const skippedTrack = player.queue.current;
      await player.skip();

      const nextTrack = player.queue.current;
      const embed = EmbedManager.music('Track Skipped',
        `⏭️ Skipped **${skippedTrack.title}**`,
        {
          fields: [
            { name: '⏭️ Skipped', value: skippedTrack.title, inline: true },
            { name: '🎵 Up Next', value: nextTrack ? nextTrack.title : '*(end of queue)*', inline: true },
            { name: '👤 Skipped by', value: `<@${i.user.id}>`, inline: true },
          ],
          thumbnail: skippedTrack.thumbnail ?? undefined,
        }
      );
      const controls = ComponentBuilder.musicControlRow(i.guild!.id, false);
      await i.editReply({ embeds: [embed], components: [controls] });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handlePrevious(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    
    if (!i.guild || !i.member) {
      await ErrorHandler.send(i, { title: 'Server Only', description: 'This command can only be used in a **server**. DMs are not supported.' });
      return;
    }

    const voiceChannel = (i.member as GuildMember).voice.channel;
    if (!voiceChannel) {
      await ErrorHandler.music(i, 'not_in_voice');
      return;
    }

    try {
      const client = i.client as PanindiganClient;

      if (!client.kazagumo) {
        await ErrorHandler.send(i, { title: 'Music Unavailable', description: 'The music system is currently offline. Please try again later.' });
        return;
      }

      const player = client.kazagumo.players.get(i.guild.id);

      if (!player) {
        await ErrorHandler.music(i, 'no_track');
        return;
      }

      if (player.voiceId !== voiceChannel.id) {
        await ErrorHandler.send(i, { title: 'Wrong Voice Channel', description: 'You must be in the **same voice channel** as the bot to control playback.' });
        return;
      }

      // Kazagumo doesn't have built-in previous, so we need to implement queue history
      // For now, we'll replay the current track from the beginning
      const currentTrack = player.queue.current;
      if (!currentTrack) {
        await ErrorHandler.music(i, 'no_track');
        return;
      }

      await player.seek(0);

      const embed = EmbedManager.music('Replaying from Start',
        `⏮️ Replaying **${currentTrack.title}** from the beginning`,
        {
          fields: [
            { name: '🎵 Track', value: currentTrack.title, inline: true },
            { name: '🎤 Artist', value: currentTrack.author || 'Unknown', inline: true },
            { name: '👤 Requested by', value: `<@${i.user.id}>`, inline: true },
          ],
          thumbnail: currentTrack.thumbnail ?? undefined,
        }
      );
      const controls = ComponentBuilder.musicControlRow(i.guild!.id, false);
      await i.editReply({ embeds: [embed], components: [controls] });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleSeek(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    const seconds = i.options.getInteger('seconds', true);
    
    if (!i.guild || !i.member) {
      await ErrorHandler.send(i, { title: 'Server Only', description: 'This command can only be used in a **server**. DMs are not supported.' });
      return;
    }

    const voiceChannel = (i.member as GuildMember).voice.channel;
    if (!voiceChannel) {
      await ErrorHandler.music(i, 'not_in_voice');
      return;
    }

    if (seconds < 0) {
      await ErrorHandler.send(i, { title: 'Invalid Seek Time', description: 'Seek time cannot be **negative**. Please provide a position between `0` and the track duration.' });
      return;
    }

    try {
      const client = i.client as PanindiganClient;

      if (!client.kazagumo) {
        await ErrorHandler.send(i, { title: 'Music Unavailable', description: 'The music system is currently offline. Please try again later.' });
        return;
      }

      const player = client.kazagumo.players.get(i.guild.id);

      if (!player) {
        await ErrorHandler.music(i, 'no_track');
        return;
      }

      if (player.voiceId !== voiceChannel.id) {
        await ErrorHandler.send(i, { title: 'Wrong Voice Channel', description: 'You must be in the **same voice channel** as the bot to control playback.' });
        return;
      }

      const currentTrack = player.queue.current;
      if (!currentTrack) {
        await ErrorHandler.music(i, 'no_track');
        return;
      }

      const trackDuration = currentTrack.length || 0;
      if (seconds > trackDuration) {
        await ErrorHandler.send(i, { title: 'Seek Out of Range', description: `Seek time cannot exceed the track duration (**${this.formatDuration(trackDuration)}**). Please provide a valid position.` });
        return;
      }

      await player.seek(seconds * 1000); // Kazagumo uses milliseconds

      const progressBar = this.createProgressBar(seconds * 1000, trackDuration);
      const embed = EmbedManager.music('Seeked',
        `⏩ Jumped to **${this.formatDuration(seconds)}** in the track`,
        {
          fields: [
            { name: '🎵 Track', value: currentTrack.title, inline: true },
            { name: '⏱️ Position', value: `${this.formatDuration(seconds)} / ${this.formatDuration(trackDuration)}`, inline: true },
            { name: '👤 Seeked by', value: `<@${i.user.id}>`, inline: true },
            { name: '📊 Progress', value: progressBar, inline: false },
          ],
          thumbnail: currentTrack.thumbnail ?? undefined,
        }
      );
      const controls = ComponentBuilder.musicControlRow(i.guild!.id, false);
      await i.editReply({ embeds: [embed], components: [controls] });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleReplay(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    
    if (!i.guild || !i.member) {
      await ErrorHandler.send(i, { title: 'Server Only', description: 'This command can only be used in a **server**. DMs are not supported.' });
      return;
    }

    const voiceChannel = (i.member as GuildMember).voice.channel;
    if (!voiceChannel) {
      await ErrorHandler.music(i, 'not_in_voice');
      return;
    }

    try {
      const client = i.client as PanindiganClient;

      if (!client.kazagumo) {
        await ErrorHandler.send(i, { title: 'Music Unavailable', description: 'The music system is currently offline. Please try again later.' });
        return;
      }

      const player = client.kazagumo.players.get(i.guild.id);

      if (!player) {
        await ErrorHandler.music(i, 'no_track');
        return;
      }

      if (player.voiceId !== voiceChannel.id) {
        await ErrorHandler.send(i, { title: 'Wrong Voice Channel', description: 'You must be in the **same voice channel** as the bot to control playback.' });
        return;
      }

      const currentTrack = player.queue.current;
      if (!currentTrack) {
        await ErrorHandler.music(i, 'no_track');
        return;
      }

      await player.seek(0);

      const embed = EmbedManager.music('Replaying Track',
        `🔄 Replaying **${currentTrack.title}** from the beginning`,
        {
          fields: [
            { name: '🎵 Track', value: currentTrack.title, inline: true },
            { name: '🎤 Artist', value: currentTrack.author || 'Unknown', inline: true },
            { name: '👤 Requested by', value: `<@${i.user.id}>`, inline: true },
          ],
          thumbnail: currentTrack.thumbnail ?? undefined,
        }
      );
      const controls = ComponentBuilder.musicControlRow(i.guild!.id, false);
      await i.editReply({ embeds: [embed], components: [controls] });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleShuffle(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    
    if (!i.guild || !i.member) {
      await ErrorHandler.send(i, { title: 'Server Only', description: 'This command can only be used in a **server**. DMs are not supported.' });
      return;
    }

    const voiceChannel = (i.member as GuildMember).voice.channel;
    if (!voiceChannel) {
      await ErrorHandler.music(i, 'not_in_voice');
      return;
    }

    try {
      const client = i.client as PanindiganClient;

      if (!client.kazagumo) {
        await ErrorHandler.send(i, { title: 'Music Unavailable', description: 'The music system is currently offline. Please try again later.' });
        return;
      }

      const player = client.kazagumo.players.get(i.guild.id);

      if (!player) {
        await ErrorHandler.music(i, 'no_track');
        return;
      }

      if (player.voiceId !== voiceChannel.id) {
        await ErrorHandler.send(i, { title: 'Wrong Voice Channel', description: 'You must be in the **same voice channel** as the bot to control playback.' });
        return;
      }

      if (player.queue.size < 2) {
        await ErrorHandler.send(i, { title: 'Not Enough Tracks', description: 'You need **at least 2 tracks** in the queue to shuffle.\n\n> Use `/music player play` to add more songs!' });
        return;
      }

      player.queue.shuffle();

      const embed = EmbedManager.music('Queue Shuffled',
        `🔀 Shuffled **${player.queue.size}** tracks in the queue`,
        {
          fields: [
            { name: '📋 Queue Size', value: `${player.queue.size} tracks`, inline: true },
            { name: '👤 Shuffled by', value: `<@${i.user.id}>`, inline: true },
            { name: '💡 Tip', value: 'Use `/music queue show` to see the new track order.', inline: false },
          ],
        }
      );
      const controls = ComponentBuilder.musicControlRow(i.guild!.id, false);
      await i.editReply({ embeds: [embed], components: [controls] });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleLoop(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    const mode = i.options.getString('mode', true);
    
    if (!i.guild || !i.member) {
      await ErrorHandler.send(i, { title: 'Server Only', description: 'This command can only be used in a **server**. DMs are not supported.' });
      return;
    }

    const voiceChannel = (i.member as GuildMember).voice.channel;
    if (!voiceChannel) {
      await ErrorHandler.music(i, 'not_in_voice');
      return;
    }

    try {
      const client = i.client as PanindiganClient;

      if (!client.kazagumo) {
        await ErrorHandler.send(i, { title: 'Music Unavailable', description: 'The music system is currently offline. Please try again later.' });
        return;
      }

      const player = client.kazagumo.players.get(i.guild.id);

      if (!player) {
        await ErrorHandler.music(i, 'no_track');
        return;
      }

      if (player.voiceId !== voiceChannel.id) {
        await ErrorHandler.send(i, { title: 'Wrong Voice Channel', description: 'You must be in the **same voice channel** as the bot to control playback.' });
        return;
      }

      let loopMode: 'none' | 'track' | 'queue' = 'none';
      switch (mode) {
        case 'off':
          loopMode = 'none';
          break;
        case 'track':
          loopMode = 'track';
          break;
        case 'queue':
          loopMode = 'queue';
          break;
      }

      player.setLoop(loopMode);

      const modeEmoji = loopMode === 'none' ? '➡️' : loopMode === 'track' ? '🔂' : '🔁';
      const modeDesc = loopMode === 'none' ? 'Loop **disabled** — playing through queue normally.'
        : loopMode === 'track' ? '🔂 **Track loop** — current track will repeat indefinitely.'
        : '🔁 **Queue loop** — entire queue will loop after finishing.';

      const embed = EmbedManager.music('Loop Mode Updated', `${modeEmoji} ${modeDesc}`, {
        fields: [
          { name: '🔁 Mode', value: `\`${mode}\``, inline: true },
          { name: '👤 Set by', value: `<@${i.user.id}>`, inline: true },
        ],
      });
      const controls = ComponentBuilder.musicControlRow(i.guild!.id, false, loopMode);
      await i.editReply({ embeds: [embed], components: [controls] });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleVolume(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    const level = i.options.getInteger('level', true);
    
    if (!i.guild || !i.member) {
      await ErrorHandler.send(i, { title: 'Server Only', description: 'This command can only be used in a **server**. DMs are not supported.' });
      return;
    }

    const voiceChannel = (i.member as GuildMember).voice.channel;
    if (!voiceChannel) {
      await ErrorHandler.music(i, 'not_in_voice');
      return;
    }

    try {
      const client = i.client as PanindiganClient;

      if (!client.kazagumo) {
        await ErrorHandler.send(i, { title: 'Music Unavailable', description: 'The music system is currently offline. Please try again later.' });
        return;
      }

      const player = client.kazagumo.players.get(i.guild.id);

      if (!player) {
        await ErrorHandler.music(i, 'no_track');
        return;
      }

      if (player.voiceId !== voiceChannel.id) {
        await ErrorHandler.send(i, { title: 'Wrong Voice Channel', description: 'You must be in the **same voice channel** as the bot to control playback.' });
        return;
      }

      await player.setVolume(level);

      const volEmoji = level === 0 ? '🔇' : level < 33 ? '🔈' : level < 66 ? '🔉' : '🔊';
      const volBar = EmbedManager.progressBar(level, 100, 10);
      const embed = EmbedManager.music('Volume Changed',
        `${volEmoji} Volume set to **${level}%**`,
        {
          fields: [
            { name: `${volEmoji} Level`, value: `${level}%`, inline: true },
            { name: '👤 Set by', value: `<@${i.user.id}>`, inline: true },
            { name: '📊 Volume', value: volBar, inline: false },
          ],
        }
      );
      const controls = ComponentBuilder.musicControlRow(i.guild!.id, false);
      const volRow = ComponentBuilder.musicVolumeRow(i.guild!.id);
      await i.editReply({ embeds: [embed], components: [controls, volRow] });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleNowPlaying(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    
    if (!i.guild) {
      await ErrorHandler.send(i, { title: 'Server Only', description: 'This command can only be used in a **server**. DMs are not supported.' });
      return;
    }

    try {
      const client = i.client as PanindiganClient;

      if (!client.kazagumo) {
        await ErrorHandler.send(i, { title: 'Music Unavailable', description: 'The music system is currently offline. Please try again later.' });
        return;
      }

      const player = client.kazagumo.players.get(i.guild.id);

      if (!player || !player.queue.current) {
        const embed = EmbedManager.music('Nothing Playing',
          '🎵 No track is currently playing.\n\n> Use `/music player play` to start listening!',
          {
            fields: [
              { name: '📋 Queue', value: 'Empty', inline: true },
              { name: '💡 Tip', value: 'Try `/music search` to find songs to add!', inline: false },
            ],
          }
        );
        await i.editReply({ embeds: [embed] });
        return;
      }

      const currentTrack = player.queue.current;
      const position = player.position || 0;
      const duration = currentTrack.length || 0;
      const progressBar = this.createProgressBar(position, duration);
      const requesterId = currentTrack.requester || i.user.id;
      const loopLabel = player.loop === 'none' ? '➡️ Off' : player.loop === 'track' ? '🔂 Track' : '🔁 Queue';
      const volEmoji = player.volume === 0 ? '🔇' : player.volume < 33 ? '🔈' : player.volume < 66 ? '🔉' : '🔊';
      
      const embed = EmbedManager.nowPlaying({
        title: currentTrack.title,
        author: currentTrack.author || 'Unknown',
        uri: currentTrack.uri,
        thumbnail: currentTrack.thumbnail,
        duration,
        position,
        requester: requesterId,
        loop: player.loop,
        volume: player.volume,
      });

      // Add extra context fields
      embed.addFields(
        { name: '📋 Queue', value: `${player.queue.size} track${player.queue.size !== 1 ? 's' : ''} remaining`, inline: true },
        { name: `${volEmoji} Volume`, value: `${player.volume}%`, inline: true },
        { name: '🔁 Loop', value: loopLabel, inline: true },
      );

      const controls = ComponentBuilder.musicControlRow(i.guild!.id, player.paused, player.loop as any);
      const volRow = ComponentBuilder.musicVolumeRow(i.guild!.id);
      await i.editReply({ embeds: [embed], components: [controls, volRow] });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  // Queue Management Handlers
  private async handleQueueShow(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    
    if (!i.guild) {
      await ErrorHandler.send(i, { title: 'Server Only', description: 'This command can only be used in a **server**. DMs are not supported.' });
      return;
    }

    try {
      const client = i.client as PanindiganClient;

      if (!client.kazagumo) {
        await ErrorHandler.send(i, { title: 'Music Unavailable', description: 'The music system is currently offline. Please try again later.' });
        return;
      }

      const player = client.kazagumo.players.get(i.guild.id);

      if (!player) {
        const embed = EmbedManager.music('Queue Empty',
          '📋 No active music session found.\n\n> Use `/music player play` to start listening!',
          { fields: [{ name: '💡 Tip', value: 'Try `/music search` to browse songs.', inline: false }] }
        );
        await i.editReply({ embeds: [embed] });
        return;
      }

      const currentTrack = player.queue.current;
      const queue = player.queue;
      const queueSize = queue.size;

      if (queueSize === 0 && !currentTrack) {
        const embed = EmbedManager.music('Queue is Empty',
          '📋 The music queue is currently empty.\n\n> Add songs with `/music player play`!',
          {
            fields: [
              { name: '🎵 Tracks', value: '0', inline: true },
              { name: '💡 Tip', value: 'Try `/music search` to find songs to add.', inline: false },
            ],
          }
        );
        await i.editReply({ embeds: [embed] });
        return;
      }

      // Calculate total duration
      let totalDuration = 0;
      const queueList: string[] = [];

      if (currentTrack) {
        queueList.push(`**Now Playing:** ${currentTrack.title} - ${this.formatDuration(currentTrack.length || 0)}`);
        totalDuration += currentTrack.length || 0;
      }

      queue.forEach((track, index) => {
        queueList.push(`${index + 1}. ${track.title} - ${this.formatDuration(track.length || 0)}`);
        totalDuration += track.length || 0;
      });

      // Paginate if too many tracks
      const pageSize = 10;
      const totalPages = Math.ceil(queueList.length / pageSize);
      let currentPage = 0;

      const getQueuePage = (page: number): string => {
        const start = page * pageSize;
        const end = start + pageSize;
        return queueList.slice(start, end).join('\n');
      };

      const createEmbed = (page: number) => {
        const loopLabel = player.loop === 'none' ? '➡️ Off' : player.loop === 'track' ? '🔂 Track' : '🔁 Queue';
        return EmbedManager.music('📜 Music Queue',
          getQueuePage(page) || '*No tracks in queue*',
          {
            fields: [
              { name: '🎵 Total Tracks', value: (currentTrack ? queueSize + 1 : queueSize).toString(), inline: true },
              { name: '⏱️ Total Duration', value: this.formatDuration(totalDuration), inline: true },
              { name: '🔊 Volume', value: `${player.volume}%`, inline: true },
              { name: '🔁 Loop', value: loopLabel, inline: true },
            ],
            footer: `Page ${page + 1}/${totalPages}`,
          }
        );
      };

      if (totalPages <= 1) {
        await i.editReply({ embeds: [createEmbed(0)] });
        return;
      }

      // Create pagination buttons
      const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('queue_first')
            .setLabel('⏮️')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(currentPage === 0),
          new ButtonBuilder()
            .setCustomId('queue_prev')
            .setLabel('◀️')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(currentPage === 0),
          new ButtonBuilder()
            .setCustomId('queue_next')
            .setLabel('▶️')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(currentPage === totalPages - 1),
          new ButtonBuilder()
            .setCustomId('queue_last')
            .setLabel('⏭️')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(currentPage === totalPages - 1),
        );

      await i.editReply({ embeds: [createEmbed(currentPage)], components: [row] });

      // Handle pagination
      const collector = i.channel!.createMessageComponentCollector({ 
        componentType: ComponentType.Button, 
        time: 120000,
        filter: (m) => m.user.id === i.user.id,
      });

      collector.on('collect', async (interaction) => {
        try {
          switch (interaction.customId) {
            case 'queue_first':
              currentPage = 0;
              break;
            case 'queue_prev':
              currentPage = Math.max(0, currentPage - 1);
              break;
            case 'queue_next':
              currentPage = Math.min(totalPages - 1, currentPage + 1);
              break;
            case 'queue_last':
              currentPage = totalPages - 1;
              break;
          }

          const newRow = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
              new ButtonBuilder()
                .setCustomId('queue_first')
                .setLabel('⏮️')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(currentPage === 0),
              new ButtonBuilder()
                .setCustomId('queue_prev')
                .setLabel('◀️')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(currentPage === 0),
              new ButtonBuilder()
                .setCustomId('queue_next')
                .setLabel('▶️')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(currentPage === totalPages - 1),
              new ButtonBuilder()
                .setCustomId('queue_last')
                .setLabel('⏭️')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(currentPage === totalPages - 1),
            );

          await interaction.update({ embeds: [createEmbed(currentPage)], components: [newRow] });
        } catch (error) {
          await ErrorHandler.generic(interaction, error as Error);
        }
      });

      collector.on('end', async () => {
        try {
          await i.editReply({ components: [] });
        } catch (error) {
          // Message might have been deleted
        }
      });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleQueueClear(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    
    if (!i.guild || !i.member) {
      await ErrorHandler.send(i, { title: 'Server Only', description: 'This command can only be used in a **server**. DMs are not supported.' });
      return;
    }

    const voiceChannel = (i.member as GuildMember).voice.channel;
    if (!voiceChannel) {
      await ErrorHandler.music(i, 'not_in_voice');
      return;
    }

    try {
      const client = i.client as PanindiganClient;

      if (!client.kazagumo) {
        await ErrorHandler.send(i, { title: 'Music Unavailable', description: 'The music system is currently offline. Please try again later.' });
        return;
      }

      const player = client.kazagumo.players.get(i.guild.id);

      if (!player) {
        await ErrorHandler.music(i, 'no_track');
        return;
      }

      if (player.voiceId !== voiceChannel.id) {
        await ErrorHandler.send(i, { title: 'Wrong Voice Channel', description: 'You must be in the **same voice channel** as the bot to control playback.' });
        return;
      }

      if (player.queue.size === 0) {
        await ErrorHandler.music(i, 'queue_empty');
        return;
      }

      const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('confirm_clear')
            .setLabel('⚠️ Confirm Clear')
            .setStyle(ButtonStyle.Danger),
          new ButtonBuilder()
            .setCustomId('cancel_clear')
            .setLabel('Cancel')
            .setStyle(ButtonStyle.Secondary),
        );

      const warnEmbed = EmbedManager.error('Confirm Queue Clear',
        `⚠️ This will remove **${player.queue.size} tracks** from the queue. This action cannot be undone.`
      );
      await i.editReply({ embeds: [warnEmbed], components: [row] });

      const collector = i.channel!.createMessageComponentCollector({ 
        componentType: ComponentType.Button, 
        time: 30000,
        filter: (m) => m.user.id === i.user.id,
      });

      collector.on('collect', async (interaction) => {
        if (interaction.customId === 'confirm_clear') {
          try {
            player.queue.clear();

            const embed = new EmbedBuilder()
              .setTitle('🧹 Queue Cleared')
              .setColor(COLORS.success)
              .setDescription('All tracks have been removed from the queue')
              .addFields(
                { name: '👤 Cleared by', value: i.user.tag, inline: true },
                { name: '🖥️ Server', value: i.guild.name, inline: true },
              )
              .setTimestamp();
            await interaction.update({ embeds: [embed], components: [] });
          } catch (error) {
            await ErrorHandler.generic(interaction, error as Error);
          }
        } else {
          await interaction.update({ embeds: [EmbedManager.info('Cancelled', 'Action cancelled.')], components: [] });
        }
        collector.stop();
      });

      collector.on('end', async () => {
        try {
          await i.editReply({ components: [] });
        } catch (error) {
          // Message might have been deleted
        }
      });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleQueueRemove(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    const position = i.options.getInteger('position', true);
    
    if (!i.guild || !i.member) {
      await ErrorHandler.send(i, { title: 'Server Only', description: 'This command can only be used in a **server**. DMs are not supported.' });
      return;
    }

    const voiceChannel = (i.member as GuildMember).voice.channel;
    if (!voiceChannel) {
      await ErrorHandler.music(i, 'not_in_voice');
      return;
    }

    if (position < 1) {
      await ErrorHandler.send(i, { title: 'Invalid Position', description: 'Track position must be **at least 1**. Please provide a valid queue position.' });
      return;
    }

    try {
      const client = i.client as PanindiganClient;

      if (!client.kazagumo) {
        await ErrorHandler.send(i, { title: 'Music Unavailable', description: 'The music system is currently offline. Please try again later.' });
        return;
      }

      const player = client.kazagumo.players.get(i.guild.id);

      if (!player) {
        await ErrorHandler.music(i, 'no_track');
        return;
      }

      if (player.voiceId !== voiceChannel.id) {
        await ErrorHandler.send(i, { title: 'Wrong Voice Channel', description: 'You must be in the **same voice channel** as the bot to control playback.' });
        return;
      }

      if (player.queue.size === 0) {
        await ErrorHandler.music(i, 'queue_empty');
        return;
      }

      if (position > player.queue.size) {
        await ErrorHandler.send(i, { title: 'Position Out of Range', description: `Position **#${position}** is out of range. The queue has **${player.queue.size}** tracks.\n\n> Use \`/music queue show\` to view valid positions.` });
        return;
      }

      // Kazagumo uses 0-based indexing, user input is 1-based
      const removedTrack = player.queue.remove(position - 1);

      if (!removedTrack) {
        await ErrorHandler.send(i, { title: 'Remove Failed', description: 'Failed to remove the track. The position may be out of range.', howToFix: 'Use `/music queue show` to check the current queue positions.' });
        return;
      }

      const embed = EmbedManager.music('Track Removed',
        `🗑️ Removed **${removedTrack.title}** from position **#${position}**`,
        {
          fields: [
            { name: '🎵 Track', value: removedTrack.title, inline: true },
            { name: '📍 Position', value: `#${position}`, inline: true },
            { name: '👤 Removed by', value: `<@${i.user.id}>`, inline: true },
            { name: '📊 Remaining', value: `${player.queue.size} tracks`, inline: true },
          ],
          thumbnail: removedTrack.thumbnail ?? undefined,
        }
      );
      await i.editReply({ embeds: [embed] });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleQueueMove(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    const from = i.options.getInteger('from', true);
    const to = i.options.getInteger('to', true);
    
    if (!i.guild || !i.member) {
      await ErrorHandler.send(i, { title: 'Server Only', description: 'This command can only be used in a **server**. DMs are not supported.' });
      return;
    }

    const voiceChannel = (i.member as GuildMember).voice.channel;
    if (!voiceChannel) {
      await ErrorHandler.music(i, 'not_in_voice');
      return;
    }

    if (from < 1 || to < 1) {
      await ErrorHandler.send(i, { title: 'Invalid Positions', description: 'Queue positions must be **at least 1**.' });
      return;
    }

    if (from === to) {
      await ErrorHandler.send(i, { title: 'Same Position', description: 'Source and destination positions cannot be the **same**. Choose different positions to move a track.' });
      return;
    }

    try {
      const client = i.client as PanindiganClient;

      if (!client.kazagumo) {
        await ErrorHandler.send(i, { title: 'Music Unavailable', description: 'The music system is currently offline. Please try again later.' });
        return;
      }

      const player = client.kazagumo.players.get(i.guild.id);

      if (!player) {
        await ErrorHandler.music(i, 'no_track');
        return;
      }

      if (player.voiceId !== voiceChannel.id) {
        await ErrorHandler.send(i, { title: 'Wrong Voice Channel', description: 'You must be in the **same voice channel** as the bot to control playback.' });
        return;
      }

      if (player.queue.size === 0) {
        await ErrorHandler.music(i, 'queue_empty');
        return;
      }

      if (from > player.queue.size || to > player.queue.size) {
        await ErrorHandler.send(i, { title: 'Position Out of Range', description: `One or both positions are out of range. The queue has **${player.queue.size}** tracks.` });
        return;
      }

      // Convert to 0-based indexing
      const fromIndex = from - 1;
      const toIndex = to - 1;

      // Get the track to move
      const trackToMove = player.queue[fromIndex];
      if (!trackToMove) {
        await ErrorHandler.send(i, { title: 'Track Not Found', description: 'No track found at that position. Use `/music queue show` to check available positions.' });
        return;
      }

      // Remove from old position and insert at new position
      player.queue.remove(fromIndex);
      player.queue.add(trackToMove, toIndex);

      const embed = EmbedManager.music('Track Moved',
        `🔄 Moved **${trackToMove.title}** from position **#${from}** → **#${to}**`,
        {
          fields: [
            { name: '🎵 Track', value: trackToMove.title, inline: true },
            { name: '📍 From → To', value: `#${from} → #${to}`, inline: true },
            { name: '👤 Moved by', value: `<@${i.user.id}>`, inline: true },
          ],
          thumbnail: trackToMove.thumbnail ?? undefined,
        }
      );
      await i.editReply({ embeds: [embed] });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  // Playlist Handlers
  private async handlePlaylistCreate(i: ChatInputCommandInteraction): Promise<void> {
    const modal = new ModalBuilder()
      .setCustomId('playlist_create_modal')
      .setTitle('Create Playlist')
      .addComponents(
        new ActionRowBuilder<TextInputBuilder>().addComponents(
          new TextInputBuilder()
            .setCustomId('playlist_name')
            .setLabel('Playlist Name')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Enter playlist name...')
            .setRequired(true)
            .setMaxLength(50),
        ),
        new ActionRowBuilder<TextInputBuilder>().addComponents(
          new TextInputBuilder()
            .setCustomId('playlist_description')
            .setLabel('Description (optional)')
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder('Enter playlist description...')
            .setRequired(false)
            .setMaxLength(200),
        ),
      );

    await i.showModal(modal);
    
    const modalSubmit = await i.awaitModalSubmit({
      time: 300000,
      filter: (m) => m.customId === 'playlist_create_modal' && m.user.id === i.user.id,
    });

    const name = modalSubmit.fields.getTextInputValue('playlist_name').trim();
    const description = modalSubmit.fields.getTextInputValue('playlist_description').trim();
    
    // Validate name
    if (name.length < 2 || name.length > 50) {
      await modalSubmit.reply({ embeds: [EmbedManager.error('Invalid Name', 'Playlist name must be between **2-50 characters** long.')], ephemeral: true });
      return;
    }
    
    try {
      const prisma = getPrismaClient();
      
      // Check if playlist already exists
      const existing = await prisma.playlist.findFirst({
        where: { userId: i.user.id, name },
      });
      
      if (existing) {
        await modalSubmit.reply({ embeds: [EmbedManager.error('Name Taken', 'You already have a playlist with this name. Choose a different name.')], ephemeral: true });
        return;
      }

      await prisma.playlist.create({
        data: {
          userId: i.user.id,
          name,
          description: description || null,
          tracks: [], // Initialize empty tracks array
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      const embed = EmbedManager.music('Playlist Created',
        `📁 Created playlist **${name}**!`,
        {
          fields: [
            { name: '📝 Name', value: name, inline: true },
            { name: '📄 Description', value: description || '*No description*', inline: false },
            { name: '🎵 Tracks', value: '0', inline: true },
            { name: '👤 Created by', value: `<@${modalSubmit.user.id}>`, inline: true },
            { name: '💡 Next step', value: 'Add tracks with `/music playlist add`!', inline: false },
          ],
        }
      );
      await modalSubmit.reply({ embeds: [embed], ephemeral: true });
    } catch (error) {
      await modalSubmit.reply({ embeds: [EmbedManager.error('Create Failed', 'Failed to create the playlist. The name might already be taken — try a different name.')], ephemeral: true });
    }
  }

  private async handlePlaylistList(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    const prisma = getPrismaClient();
    
    try {
      const playlists = await prisma.playlist.findMany({
        where: { userId: i.user.id },
        orderBy: { updatedAt: 'desc' },
      });

      if (playlists.length === 0) {
        const embed = EmbedManager.music('Your Playlists',
          '📁 You have no playlists yet.',
          {
            fields: [
              { name: '💡 Get started', value: 'Use `/music playlist create` to create your first playlist!', inline: false },
            ],
          }
        );
        await i.editReply({ embeds: [embed] });
        return;
      }

      const playlistList = playlists.map((p, i) => {
        const trackCount = Array.isArray(p.tracks) ? p.tracks.length : 0;
        return `${i + 1}. **${p.name}** - ${trackCount} tracks${p.description ? `\n   ${p.description}` : ''}`;
      }).join('\n\n');

      const embed = EmbedManager.music('Your Playlists', playlistList, {
        fields: [
          { name: '📊 Total', value: `${playlists.length} playlists`, inline: true },
          { name: '👤 Owner', value: `<@${i.user.id}>`, inline: true },
          { name: '💡 Tip', value: 'Use `/music playlist play <name>` to queue a playlist!', inline: false },
        ],
        footer: `Total: ${playlists.length} playlists`,
      });
      await i.editReply({ embeds: [embed] });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handlePlaylistShow(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    const name = i.options.getString('name', true);
    const prisma = getPrismaClient();
    
    try {
      const playlist = await prisma.playlist.findFirst({
        where: { userId: i.user.id, name },
      });

      if (!playlist) {
        await ErrorHandler.send(i, { title: 'Playlist Not Found', description: `No playlist named **"${name}"** was found.\n\n> Use \`/music playlist list\` to see your playlists.` });
        return;
      }

      const tracks = Array.isArray(playlist.tracks) ? playlist.tracks : [];
      const trackList = tracks.map((track: any, index: number) => 
        `${index + 1}. **${track.title}** - ${track.artist || 'Unknown'} (${this.formatDuration(track.duration || 0)})`
      ).join('\n');

      const playlistFields = [
        { name: '🎵 Tracks', value: tracks.length.toString(), inline: true },
        { name: '📅 Created', value: `<t:${Math.floor(playlist.createdAt.getTime() / 1000)}:R>`, inline: true },
        { name: '🔄 Updated', value: `<t:${Math.floor(playlist.updatedAt.getTime() / 1000)}:R>`, inline: true },
        {
          name: '📋 Track List',
          value: tracks.length > 0 ? trackList.substring(0, 1024) : '*No tracks yet — use `/music playlist add` to add some!*',
          inline: false,
        },
      ];
      const embed = EmbedManager.music(`📁 ${playlist.name}`,
        playlist.description || '*No description*',
        { fields: playlistFields }
      );
      await i.editReply({ embeds: [embed] });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handlePlaylistAdd(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    const name = i.options.getString('name', true);
    
    if (!i.guild) {
      await ErrorHandler.send(i, { title: 'Server Only', description: 'This command can only be used in a **server**. DMs are not supported.' });
      return;
    }

    try {
      const client = i.client as PanindiganClient;

      if (!client.kazagumo) {
        await ErrorHandler.send(i, { title: 'Music Unavailable', description: 'The music system is currently offline. Please try again later.' });
        return;
      }

      const player = client.kazagumo.players.get(i.guild.id);

      if (!player || !player.queue.current) {
        await ErrorHandler.music(i, 'no_track');
        return;
      }

      const currentTrack = player.queue.current;
      const prisma = getPrismaClient();

      const playlist = await prisma.playlist.findFirst({
        where: { userId: i.user.id, name },
      });

      if (!playlist) {
        await ErrorHandler.send(i, { title: 'Playlist Not Found', description: `No playlist named **"${name}"** was found.\n\n> Use \`/music playlist list\` to see your playlists.` });
        return;
      }

      const tracks = Array.isArray(playlist.tracks) ? playlist.tracks : [];
      
      // Check if track already exists
      const exists = tracks.some((t: any) => t.url === currentTrack.uri);
      if (exists) {
        await ErrorHandler.send(i, { title: 'Already in Playlist', description: 'This track is **already** in that playlist.' });
        return;
      }

      // Add track
      const trackData = {
        title: currentTrack.title,
        artist: currentTrack.author || 'Unknown',
        duration: currentTrack.length || 0,
        url: currentTrack.uri,
        thumbnail: currentTrack.thumbnail,
        addedAt: new Date().toISOString(),
      };

      tracks.push(trackData);

      await prisma.playlist.update({
        where: { id: playlist.id },
        data: {
          tracks,
          updatedAt: new Date(),
        },
      });

      const embed = EmbedManager.music('Track Added to Playlist',
        `➕ Added **${currentTrack.title}** to **${name}**`,
        {
          fields: [
            { name: '🎵 Track', value: currentTrack.title, inline: true },
            { name: '📁 Playlist', value: name, inline: true },
            { name: '📊 Total Tracks', value: tracks.length.toString(), inline: true },
            { name: '👤 Added by', value: `<@${i.user.id}>`, inline: true },
          ],
          thumbnail: currentTrack.thumbnail ?? undefined,
        }
        .setTimestamp();
      await i.editReply({ embeds: [embed] });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handlePlaylistRemove(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    const name = i.options.getString('name', true);
    const position = i.options.getInteger('position', true);
    
    if (position < 1) {
      await ErrorHandler.send(i, { title: 'Invalid Position', description: 'Track position must be **at least 1**. Please provide a valid queue position.' });
      return;
    }

    try {
      const prisma = getPrismaClient();

      const playlist = await prisma.playlist.findFirst({
        where: { userId: i.user.id, name },
      });

      if (!playlist) {
        await ErrorHandler.send(i, { title: 'Playlist Not Found', description: `No playlist named **"${name}"** was found.\n\n> Use \`/music playlist list\` to see your playlists.` });
        return;
      }

      const tracks = Array.isArray(playlist.tracks) ? playlist.tracks : [];

      if (position > tracks.length) {
        await i.editReply({ content: `❌ Position ${position} is out of range. Playlist has ${tracks.length} tracks.` });
        return;
      }

      const removedTrack = tracks[position - 1];
      tracks.splice(position - 1, 1);

      await prisma.playlist.update({
        where: { id: playlist.id },
        data: {
          tracks,
          updatedAt: new Date(),
        },
      });

      const embed = EmbedManager.music('Track Removed from Playlist',
        `🗑️ Removed **${removedTrack.title}** from **${name}**`,
        {
          fields: [
            { name: '🎵 Track', value: removedTrack.title, inline: true },
            { name: '📍 Position', value: `#${position}`, inline: true },
            { name: '📁 Playlist', value: name, inline: true },
            { name: '📊 Remaining', value: `${tracks.length} tracks`, inline: true },
          ],
          thumbnail: removedTrack.thumbnail ?? undefined,
        }
      );
      await i.editReply({ embeds: [embed] });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handlePlaylistDelete(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    const name = i.options.getString('name', true);
    
    const prisma = getPrismaClient();
    
    const playlist = await prisma.playlist.findFirst({
      where: { userId: i.user.id, name },
    });

    if (!playlist) {
      await ErrorHandler.send(i, { title: 'Playlist Not Found', description: `No playlist named **"${name}"** was found.\n\n> Use \`/music playlist list\` to see your playlists.` });
      return;
    }

    const trackCount = Array.isArray(playlist.tracks) ? playlist.tracks.length : 0;
    
    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('confirm_delete')
          .setLabel('⚠️ Confirm Delete')
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId('cancel_delete')
          .setLabel('Cancel')
          .setStyle(ButtonStyle.Secondary),
      );

    const warnEmbed = EmbedManager.error('Confirm Playlist Delete',
      `⚠️ This will permanently delete **${name}** and its **${trackCount} tracks**. This cannot be undone.`
    );
    await i.editReply({ embeds: [warnEmbed], components: [row] });

    const collector = i.channel!.createMessageComponentCollector({ 
      componentType: ComponentType.Button, 
      time: 30000,
      filter: (m) => m.user.id === i.user.id,
    });

    collector.on('collect', async (interaction) => {
      if (interaction.customId === 'confirm_delete') {
        try {
          await prisma.playlist.deleteMany({
            where: { userId: i.user.id, name },
          });

          const embed = EmbedManager.music('Playlist Deleted',
            `🗑️ **${name}** has been permanently deleted.`,
            {
              fields: [
                { name: '📁 Playlist', value: name, inline: true },
                { name: '🎵 Tracks Removed', value: trackCount.toString(), inline: true },
                { name: '👤 Deleted by', value: `<@${interaction.user.id}>`, inline: true },
              ],
            }
          );
          await interaction.update({ embeds: [embed], components: [] });
        } catch (error) {
          await ErrorHandler.generic(interaction, error as Error);
        }
      } else {
        await interaction.update({ embeds: [EmbedManager.info('Cancelled', 'Action cancelled.')], components: [] });
      }
      collector.stop();
    });

    collector.on('end', async () => {
      try {
        await i.editReply({ components: [] });
      } catch (error) {
        // Message might have been deleted
      }
    });
  }

  // Filter Handlers
  private async handleFilterBassboost(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    
    if (!i.guild || !i.member) {
      await ErrorHandler.send(i, { title: 'Server Only', description: 'This command can only be used in a **server**. DMs are not supported.' });
      return;
    }

    const voiceChannel = (i.member as GuildMember).voice.channel;
    if (!voiceChannel) {
      await ErrorHandler.music(i, 'not_in_voice');
      return;
    }

    try {
      const client = i.client as PanindiganClient;

      if (!client.kazagumo) {
        await ErrorHandler.send(i, { title: 'Music Unavailable', description: 'The music system is currently offline. Please try again later.' });
        return;
      }

      const player = client.kazagumo.players.get(i.guild.id);

      if (!player) {
        await ErrorHandler.music(i, 'no_track');
        return;
      }

      if (player.voiceId !== voiceChannel.id) {
        await ErrorHandler.send(i, { title: 'Wrong Voice Channel', description: 'You must be in the **same voice channel** as the bot to control playback.' });
        return;
      }

      // Toggle bass boost filter
      const currentFilters = player.filters || {};
      const hasBassBoost = currentFilters.equalizer?.some((eq: any) => eq.band === 0 && eq.gain > 0);

      if (hasBassBoost) {
        // Remove bass boost
        await player.setFilters({});
        const embed = new EmbedBuilder()
          .setTitle('🎚️ Bass Boost Disabled')
          .setColor(COLORS.info)
          .setDescription('Bass boost filter has been disabled')
          .addFields(
            { name: '🎵 Filter', value: 'Bass Boost', inline: true },
            { name: '🔊 Status', value: 'Disabled', inline: true },
            { name: '👤 Toggled by', value: i.user.tag, inline: true },
          )
          .setTimestamp();
        await i.editReply({ embeds: [embed] });
      } else {
        // Apply bass boost
        await player.setFilters({
          equalizer: [
            { band: 0, gain: 0.2 },
            { band: 1, gain: 0.15 },
            { band: 2, gain: 0.1 },
          ],
        });
        const embed = new EmbedBuilder()
          .setTitle('🎚️ Bass Boost Enabled')
          .setColor(COLORS.success)
          .setDescription('Bass boost filter has been enabled')
          .addFields(
            { name: '🎵 Filter', value: 'Bass Boost', inline: true },
            { name: '🔊 Status', value: 'Enabled', inline: true },
            { name: '👤 Toggled by', value: i.user.tag, inline: true },
          )
          .setTimestamp();
        await i.editReply({ embeds: [embed] });
      }
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleFilterNightcore(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    
    if (!i.guild || !i.member) {
      await ErrorHandler.send(i, { title: 'Server Only', description: 'This command can only be used in a **server**. DMs are not supported.' });
      return;
    }

    const voiceChannel = (i.member as GuildMember).voice.channel;
    if (!voiceChannel) {
      await ErrorHandler.music(i, 'not_in_voice');
      return;
    }

    try {
      const client = i.client as PanindiganClient;

      if (!client.kazagumo) {
        await ErrorHandler.send(i, { title: 'Music Unavailable', description: 'The music system is currently offline. Please try again later.' });
        return;
      }

      const player = client.kazagumo.players.get(i.guild.id);

      if (!player) {
        await ErrorHandler.music(i, 'no_track');
        return;
      }

      if (player.voiceId !== voiceChannel.id) {
        await ErrorHandler.send(i, { title: 'Wrong Voice Channel', description: 'You must be in the **same voice channel** as the bot to control playback.' });
        return;
      }

      // Toggle nightcore filter
      const currentFilters = player.filters || {};
      const hasNightcore = currentFilters.timescale?.speed === 1.2;

      if (hasNightcore) {
        // Remove nightcore
        await player.setFilters({});
        const embed = EmbedManager.music('Nightcore Disabled',
        `🎚️ **Nightcore** filter has been **turned off**.`,
        {
          fields: [
            { name: '🎵 Filter', value: 'Nightcore', inline: true },
            { name: '🔊 Status', value: '❌ Off', inline: true },
            { name: '👤 Toggled by', value: `<@${i.user.id}>`, inline: true },
          ],
        }
      );
      await i.editReply({ embeds: [embed] });
      } else {
        // Apply nightcore
        await player.setFilters({
          timescale: {
            speed: 1.2,
            pitch: 1.2,
            rate: 1.0,
          },
        });
        const embed = EmbedManager.music('Nightcore Enabled',
        `🎚️ **Nightcore** filter is now **active**! Speeds up the track and raises the pitch — anime energy!`,
        {
          fields: [
            { name: '🎵 Filter', value: 'Nightcore', inline: true },
            { name: '🔊 Status', value: '✅ On', inline: true },
            { name: '👤 Toggled by', value: `<@${i.user.id}>`, inline: true },
            { name: '💡 Tip', value: 'Use `/music filter reset` to remove all filters.', inline: false },
          ],
        }
      );
      await i.editReply({ embeds: [embed] });
      }
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleFilterVaporwave(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    
    if (!i.guild || !i.member) {
      await ErrorHandler.send(i, { title: 'Server Only', description: 'This command can only be used in a **server**. DMs are not supported.' });
      return;
    }

    const voiceChannel = (i.member as GuildMember).voice.channel;
    if (!voiceChannel) {
      await ErrorHandler.music(i, 'not_in_voice');
      return;
    }

    try {
      const client = i.client as PanindiganClient;

      if (!client.kazagumo) {
        await ErrorHandler.send(i, { title: 'Music Unavailable', description: 'The music system is currently offline. Please try again later.' });
        return;
      }

      const player = client.kazagumo.players.get(i.guild.id);

      if (!player) {
        await ErrorHandler.music(i, 'no_track');
        return;
      }

      if (player.voiceId !== voiceChannel.id) {
        await ErrorHandler.send(i, { title: 'Wrong Voice Channel', description: 'You must be in the **same voice channel** as the bot to control playback.' });
        return;
      }

      // Toggle vaporwave filter
      const currentFilters = player.filters || {};
      const hasVaporwave = currentFilters.timescale?.speed === 0.8;

      if (hasVaporwave) {
        // Remove vaporwave
        await player.setFilters({});
        const embed = EmbedManager.music('Vaporwave Disabled',
        `🎚️ **Vaporwave** filter has been **turned off**.`,
        {
          fields: [
            { name: '🎵 Filter', value: 'Vaporwave', inline: true },
            { name: '🔊 Status', value: '❌ Off', inline: true },
            { name: '👤 Toggled by', value: `<@${i.user.id}>`, inline: true },
          ],
        }
      );
      await i.editReply({ embeds: [embed] });
      } else {
        // Apply vaporwave
        await player.setFilters({
          timescale: {
            speed: 0.8,
            pitch: 0.8,
            rate: 1.0,
          },
          equalizer: [
            { band: 0, gain: 0.1 },
            { band: 1, gain: 0.1 },
            { band: 2, gain: 0.05 },
          ],
        });
        const embed = EmbedManager.music('Vaporwave Enabled',
        `🎚️ **Vaporwave** filter is now **active**! Slows the track down and lowers the pitch — retro vibes.`,
        {
          fields: [
            { name: '🎵 Filter', value: 'Vaporwave', inline: true },
            { name: '🔊 Status', value: '✅ On', inline: true },
            { name: '👤 Toggled by', value: `<@${i.user.id}>`, inline: true },
            { name: '💡 Tip', value: 'Use `/music filter reset` to remove all filters.', inline: false },
          ],
        }
      );
      await i.editReply({ embeds: [embed] });
      }
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleFilter8D(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    
    if (!i.guild || !i.member) {
      await ErrorHandler.send(i, { title: 'Server Only', description: 'This command can only be used in a **server**. DMs are not supported.' });
      return;
    }

    const voiceChannel = (i.member as GuildMember).voice.channel;
    if (!voiceChannel) {
      await ErrorHandler.music(i, 'not_in_voice');
      return;
    }

    try {
      const client = i.client as PanindiganClient;

      if (!client.kazagumo) {
        await ErrorHandler.send(i, { title: 'Music Unavailable', description: 'The music system is currently offline. Please try again later.' });
        return;
      }

      const player = client.kazagumo.players.get(i.guild.id);

      if (!player) {
        await ErrorHandler.music(i, 'no_track');
        return;
      }

      if (player.voiceId !== voiceChannel.id) {
        await ErrorHandler.send(i, { title: 'Wrong Voice Channel', description: 'You must be in the **same voice channel** as the bot to control playback.' });
        return;
      }

      // Toggle 8D audio filter
      const currentFilters = player.filters || {};
      const has8D = currentFilters.rotation?.rotationHz === 0.2;

      if (has8D) {
        // Remove 8D
        await player.setFilters({});
        const embed = new EmbedBuilder()
          .setTitle('🎚️ 8D Audio Disabled')
          .setColor(COLORS.info)
          .setDescription('8D audio filter has been disabled')
          .addFields(
            { name: '🎵 Filter', value: '8D Audio', inline: true },
            { name: '🔊 Status', value: 'Disabled', inline: true },
            { name: '👤 Toggled by', value: i.user.tag, inline: true },
          )
          .setTimestamp();
        await i.editReply({ embeds: [embed] });
      } else {
        // Apply 8D
        await player.setFilters({
          rotation: {
            rotationHz: 0.2,
          },
        });
        const embed = new EmbedBuilder()
          .setTitle('🎚️ 8D Audio Enabled')
          .setColor(COLORS.success)
          .setDescription('8D audio filter has been enabled')
          .addFields(
            { name: '🎵 Filter', value: '8D Audio', inline: true },
            { name: '🔊 Status', value: 'Enabled', inline: true },
            { name: '👤 Toggled by', value: i.user.tag, inline: true },
          )
          .setTimestamp();
        await i.editReply({ embeds: [embed] });
      }
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleFilterReset(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    
    if (!i.guild || !i.member) {
      await ErrorHandler.send(i, { title: 'Server Only', description: 'This command can only be used in a **server**. DMs are not supported.' });
      return;
    }

    const voiceChannel = (i.member as GuildMember).voice.channel;
    if (!voiceChannel) {
      await ErrorHandler.music(i, 'not_in_voice');
      return;
    }

    try {
      const client = i.client as PanindiganClient;

      if (!client.kazagumo) {
        await ErrorHandler.send(i, { title: 'Music Unavailable', description: 'The music system is currently offline. Please try again later.' });
        return;
      }

      const player = client.kazagumo.players.get(i.guild.id);

      if (!player) {
        await ErrorHandler.music(i, 'no_track');
        return;
      }

      if (player.voiceId !== voiceChannel.id) {
        await ErrorHandler.send(i, { title: 'Wrong Voice Channel', description: 'You must be in the **same voice channel** as the bot to control playback.' });
        return;
      }

      // Reset all filters
      await player.setFilters({});

      const embed = EmbedManager.music('All Filters Reset',
        '🎚️ All audio filters have been removed. The track is back to its original sound.',
        {
          fields: [
            { name: '🎵 Filters', value: 'None (cleared)', inline: true },
            { name: '👤 Reset by', value: `<@${i.user.id}>`, inline: true },
          ],
        }
      );
      await i.editReply({ embeds: [embed] });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  // Voice Handlers
  private async handleVoiceJoin(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    
    if (!i.guild || !i.member) {
      await ErrorHandler.send(i, { title: 'Server Only', description: 'This command can only be used in a **server**. DMs are not supported.' });
      return;
    }

    const voiceChannel = (i.member as GuildMember).voice.channel;
    if (!voiceChannel) {
      await ErrorHandler.music(i, 'not_in_voice');
      return;
    }

    try {
      const client = i.client as PanindiganClient;

      if (!client.kazagumo) {
        await ErrorHandler.send(i, { title: 'Music Unavailable', description: 'The music system is currently offline. Please try again later.' });
        return;
      }

      const existingPlayer = client.kazagumo.players.get(i.guild.id);
      if (existingPlayer && existingPlayer.voiceId === voiceChannel.id) {
        await ErrorHandler.send(i, { title: 'Already Here', description: 'I\'m already in your voice channel!' });
        return;
      }

      if (existingPlayer && existingPlayer.voiceId !== voiceChannel.id) {
        await ErrorHandler.send(i, { title: 'Already in Channel', description: "I'm already playing in another voice channel.\n\n> Join that channel or use `/music voice disconnect` to move me." });
        return;
      }

      const player = await client.kazagumo.createPlayer({
        guildId: i.guild.id,
        voiceId: voiceChannel.id,
        textId: i.channelId,
        volume: 80,
        deaf: true,
      });

      const embed = EmbedManager.music('Joined Voice Channel',
        `🔊 Joined **${voiceChannel.name}**! Use `/music player play` to start listening.`,
        {
          fields: [
            { name: '🎤 Channel', value: voiceChannel.name, inline: true },
            { name: '👥 Members', value: voiceChannel.members.size.toString(), inline: true },
            { name: '🔊 Volume', value: '80%', inline: true },
            { name: '👤 Joined by', value: `<@${i.user.id}>`, inline: true },
          ],
        }
      );
      await i.editReply({ embeds: [embed] });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleVoiceLeave(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    
    if (!i.guild || !i.member) {
      await ErrorHandler.send(i, { title: 'Server Only', description: 'This command can only be used in a **server**. DMs are not supported.' });
      return;
    }

    const voiceChannel = (i.member as GuildMember).voice.channel;
    if (!voiceChannel) {
      await ErrorHandler.music(i, 'not_in_voice');
      return;
    }

    try {
      const client = i.client as PanindiganClient;

      if (!client.kazagumo) {
        await ErrorHandler.send(i, { title: 'Music Unavailable', description: 'The music system is currently offline. Please try again later.' });
        return;
      }

      const player = client.kazagumo.players.get(i.guild.id);

      if (!player) {
        await ErrorHandler.send(i, { title: 'Not Connected', description: "I'm not currently in any voice channel.\n\n> Use `/music player play` to start a session." });
        return;
      }

      if (player.voiceId !== voiceChannel.id) {
        await ErrorHandler.send(i, { title: 'Wrong Voice Channel', description: 'You must be in the **same voice channel** as the bot to control playback.' });
        return;
      }

      const channelName = voiceChannel.name;
      player.destroy();

      const embed = EmbedManager.music('Left Voice Channel',
        `👋 Left **${channelName}**. Use `/music voice join` to bring me back!`,
        {
          fields: [
            { name: '🎤 Channel', value: channelName, inline: true },
            { name: '👤 Left by', value: `<@${i.user.id}>`, inline: true },
          ],
        }
      );
      await i.editReply({ embeds: [embed] });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleVoiceDisconnect(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    
    if (!i.guild || !i.member) {
      await ErrorHandler.send(i, { title: 'Server Only', description: 'This command can only be used in a **server**. DMs are not supported.' });
      return;
    }

    try {
      const client = i.client as PanindiganClient;

      if (!client.kazagumo) {
        await ErrorHandler.send(i, { title: 'Music Unavailable', description: 'The music system is currently offline. Please try again later.' });
        return;
      }

      const player = client.kazagumo.players.get(i.guild.id);

      if (!player) {
        await ErrorHandler.send(i, { title: 'Not Connected', description: "I'm not currently in any voice channel.\n\n> Use `/music player play` to start a session." });
        return;
      }

      const voiceChannel = i.guild.channels.cache.get(player.voiceId);
      const channelName = voiceChannel?.name || 'Unknown';
      
      player.destroy();

      const embed = EmbedManager.music('Disconnected',
        `🔌 Disconnected from **${channelName}** and cleared the queue.`,
        {
          fields: [
            { name: '🎤 Channel', value: channelName, inline: true },
            { name: '👤 Disconnected by', value: `<@${i.user.id}>`, inline: true },
            { name: '💡 Tip', value: 'Use `/music player play` to start a new session.', inline: false },
          ],
        }
      );
      await i.editReply({ embeds: [embed] });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  // Additional Handlers
  private async handleSearch(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    const query = i.options.getString('query', true);
    
    if (!i.guild || !i.member) {
      await ErrorHandler.send(i, { title: 'Server Only', description: 'This command can only be used in a **server**. DMs are not supported.' });
      return;
    }

    const voiceChannel = (i.member as GuildMember).voice.channel;
    if (!voiceChannel) {
      await ErrorHandler.music(i, 'not_in_voice');
      return;
    }

    try {
      const client = i.client as PanindiganClient;

      if (!client.kazagumo) {
        await ErrorHandler.send(i, { title: 'Music Unavailable', description: 'The music system is currently offline. Please try again later.' });
        return;
      }

      const existingPlayer = client.kazagumo.players.get(i.guild.id);
      if (existingPlayer && existingPlayer.voiceId && existingPlayer.voiceId !== voiceChannel.id) {
        await i.editReply({ embeds: [EmbedManager.error('Already in a Channel', `I'm already playing in <#${existingPlayer.voiceId}>.\n\n> Join that channel, or wait until the session ends.`)] });
        return;
      }

      const result = await client.kazagumo.search(query, { requester: i.user });

      if (!result || !result.tracks.length || result.type === 'ERROR') {
        await i.editReply({ embeds: [MusicUI.createNoResultsEmbed(query)] });
        return;
      }

      const tracks = result.tracks.slice(0, 10); // Show top 10 results
      const isPlaylist = result.type === 'PLAYLIST';

      if (isPlaylist) {
        // For playlists, just add them directly
        let player = existingPlayer;
        if (!player) {
          player = await client.kazagumo.createPlayer({
            guildId: i.guild.id,
            voiceId: voiceChannel.id,
            textId: i.channelId,
            volume: 80,
            deaf: true,
          });
        }

        player.queue.add(result.tracks);
        const embed = EmbedManager.music('Playlist Queued',
          `📋 Added **${result.tracks.length} tracks** to the queue!`,
          {
            fields: [
              { name: '🎵 Tracks Added', value: result.tracks.length.toString(), inline: true },
              { name: '👤 Requested by', value: `<@${i.user.id}>`, inline: true },
              { name: '💡 Tip', value: 'Use `/music player nowplaying` to see what\'s on next.', inline: false },
            ],
          }
        );
        await i.editReply({ embeds: [embed] });

        if (!player.playing && !player.paused) await player.play();
        return;
      }

      // Create search result embed with select menu
      const trackList = tracks.map((track, index) => 
        `${index + 1}. **${track.title}** - ${track.author || 'Unknown'} (${this.formatDuration(track.length || 0)})`
      ).join('\n');

      const embed = EmbedManager.music('🔍 Search Results',
        `Results for **${query}**\n\n${trackList}`,
        {
          fields: [
            { name: '🔍 Query', value: query, inline: true },
            { name: '🎵 Results', value: `${tracks.length} tracks`, inline: true },
          ],
          footer: 'Select a track from the menu below to play it',
        }
      );

      // Create select menu
      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('search_select')
        .setPlaceholder('Select a track to play')
        .setMaxValues(1)
        .setOptions(
          tracks.slice(0, 25).map((track, index) => ({
            label: `${index + 1}. ${track.title.substring(0, 80)}`,
            description: track.author || 'Unknown',
            value: index.toString(),
          }))
        );

      const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);

      await i.editReply({ embeds: [embed], components: [row] });

      // Handle selection
      const collector = i.channel!.createMessageComponentCollector({ 
        componentType: ComponentType.StringSelect, 
        time: 60000,
        filter: (m) => m.user.id === i.user.id,
      });

      collector.on('collect', async (interaction) => {
        try {
          const selectedIndex = parseInt(interaction.values[0]);
          const selectedTrack = tracks[selectedIndex];

          if (!selectedTrack) {
            await interaction.update({ embeds: [EmbedManager.error('Track Error', 'Failed to get the selected track. Please try searching again.')], components: [] });
            return;
          }

          let player = client.kazagumo.players.get(i.guild.id);
          if (!player) {
            player = await client.kazagumo.createPlayer({
              guildId: i.guild.id,
              voiceId: voiceChannel.id,
              textId: i.channelId,
              volume: 80,
              deaf: true,
            });
          }

          player.queue.add(selectedTrack);
          const queueSize = player.queue.size + (player.queue.current ? 1 : 0);

          const trackData: Track = {
            title: selectedTrack.title,
            artist: selectedTrack.author || 'Unknown',
            duration: selectedTrack.length || 0,
            position: 0,
            thumbnail: selectedTrack.thumbnail,
            url: selectedTrack.uri,
            requester: i.user.id,
            source: selectedTrack.sourceName || 'unknown',
          };

          if (player.playing || player.queue.current) {
            await interaction.update({ 
              embeds: [QueueUI.createAddedEmbed(trackData, queueSize, queueSize)], 
              components: [] 
            });
          } else {
            await interaction.update({ 
              embeds: [MusicUI.createTrackStartedEmbed(trackData)], 
              components: [] 
            });
          }

          if (!player.playing && !player.paused) await player.play();
        } catch (error) {
          await ErrorHandler.generic(interaction, error as Error);
        }
      });

      collector.on('end', async () => {
        try {
          await i.editReply({ components: [] });
        } catch (error) {
          // Message might have been deleted
        }
      });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleLyrics(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    
    if (!i.guild) {
      await ErrorHandler.send(i, { title: 'Server Only', description: 'This command can only be used in a **server**. DMs are not supported.' });
      return;
    }

    try {
      const client = i.client as PanindiganClient;
      const musicManager = client.kazagumo;

      if (!musicManager) {
        await ErrorHandler.music(i, 'Music system is not available');
        return;
      }

      const player = client.kazagumo!.players.get(i.guild.id);

      if (!player || !player.queue.current) {
        await ErrorHandler.music(i, 'No track is currently playing');
        return;
      }

      const currentTrack = player.queue.current;
      const track = currentTrack.title;
      const artist = currentTrack.author || undefined;

      // Show loading embed
      await i.editReply({ embeds: [LyricsService.createLoadingEmbed(track, artist)] });

      // Search for lyrics
      const lyricsData = await LyricsService.searchLyrics(track, artist);

      if (!lyricsData) {
        await i.editReply({ embeds: [LyricsService.createErrorEmbed(track, artist)] });
        return;
      }

      // Check if instrumental
      if (lyricsData.instrumental) {
        await i.editReply({ embeds: [LyricsService.createInstrumentalEmbed(lyricsData)] });
        return;
      }

      // Get lyrics (prefer synced, fallback to plain)
      const lyrics = lyricsData.syncedLyrics || lyricsData.plainLyrics;

      if (!lyrics) {
        await i.editReply({ embeds: [LyricsService.createErrorEmbed(track, artist)] });
        return;
      }

      // Paginate lyrics
      const pages = LyricsService.paginateLyrics(lyrics);

      if (pages.length === 0) {
        await i.editReply({ embeds: [LyricsService.createErrorEmbed(track, artist)] });
        return;
      }

      // Show first page with pagination
      let currentPage = 0;
      const source = lyricsData.syncedLyrics ? 'synced' : 'plain';

      const updateEmbed = () => {
        const embed = LyricsService.createLyricsEmbed(lyricsData, pages[currentPage], source);
        return embed;
      };

      // Create pagination buttons if more than 1 page
      const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('lyrics_first')
            .setLabel('⏮️')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(currentPage === 0),
          new ButtonBuilder()
            .setCustomId('lyrics_prev')
            .setLabel('◀️')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(currentPage === 0),
          new ButtonBuilder()
            .setCustomId('lyrics_next')
            .setLabel('▶️')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(currentPage === pages.length - 1),
          new ButtonBuilder()
            .setCustomId('lyrics_last')
            .setLabel('⏭️')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(currentPage === pages.length - 1),
        );

      await i.editReply({ 
        embeds: [updateEmbed()], 
        components: pages.length > 1 ? [row] : [],
      });

      // Handle pagination if multiple pages
      if (pages.length > 1) {
        const collector = i.channel!.createMessageComponentCollector({ 
          componentType: ComponentType.Button, 
          time: 120000, // 2 minutes
          filter: (m) => m.user.id === i.user.id,
        });

        collector.on('collect', async (interaction) => {
          try {
            switch (interaction.customId) {
              case 'lyrics_first':
                currentPage = 0;
                break;
              case 'lyrics_prev':
                currentPage = Math.max(0, currentPage - 1);
                break;
              case 'lyrics_next':
                currentPage = Math.min(pages.length - 1, currentPage + 1);
                break;
              case 'lyrics_last':
                currentPage = pages.length - 1;
                break;
            }

            // Update button states
            const newRow = new ActionRowBuilder<ButtonBuilder>()
              .addComponents(
                new ButtonBuilder()
                  .setCustomId('lyrics_first')
                  .setLabel('⏮️')
                  .setStyle(ButtonStyle.Secondary)
                  .setDisabled(currentPage === 0),
                new ButtonBuilder()
                  .setCustomId('lyrics_prev')
                  .setLabel('◀️')
                  .setStyle(ButtonStyle.Secondary)
                  .setDisabled(currentPage === 0),
                new ButtonBuilder()
                  .setCustomId('lyrics_next')
                  .setLabel('▶️')
                  .setStyle(ButtonStyle.Secondary)
                  .setDisabled(currentPage === pages.length - 1),
                new ButtonBuilder()
                  .setCustomId('lyrics_last')
                  .setLabel('⏭️')
                  .setStyle(ButtonStyle.Secondary)
                  .setDisabled(currentPage === pages.length - 1),
              );

            await interaction.update({ 
              embeds: [updateEmbed()], 
              components: [newRow],
            });
          } catch (error) {
            await ErrorHandler.generic(interaction, error as Error);
          }
        });

        collector.on('end', async () => {
          try {
            await i.editReply({ components: [] });
          } catch (error) {
            // Message might have been deleted
          }
        });
      }
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleStats(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    
    if (!i.guild) {
      await ErrorHandler.send(i, { title: 'Server Only', description: 'This command can only be used in a **server**. DMs are not supported.' });
      return;
    }

    try {
      const client = i.client as PanindiganClient;

      if (!client.kazagumo) {
        await ErrorHandler.send(i, { title: 'Music Unavailable', description: 'The music system is currently offline. Please try again later.' });
        return;
      }

      const player = client.kazagumo.players.get(i.guild.id);
      const prisma = getPrismaClient();

      // Get guild stats from database
      let guildStats = null;
      try {
        guildStats = await prisma.musicStats.findUnique({
          where: { guildId: i.guild.id },
        });
      } catch (error) {
        // Stats table might not exist yet
      }

      const tracksPlayed = guildStats?.tracksPlayed || 0;
      const totalPlayTime = guildStats?.totalPlayTime || 0;
      const sessions = guildStats?.sessions || 0;
      const skips = guildStats?.skips || 0;

      // Current player info
      const currentTrack = player?.queue.current;
      const queueSize = player?.queue.size || 0;
      const isPlaying = player?.playing || false;
      const isPaused = player?.paused || false;

      const statusEmoji = isPlaying ? '▶️ Playing' : isPaused ? '⏸️ Paused' : '⏹️ Idle';
      const embed = EmbedManager.music('Music Statistics',
        `📊 Server music stats for **${i.guild.name}**`,
        {
          fields: [
            { name: '🎵 Tracks Played', value: tracksPlayed.toLocaleString(), inline: true },
            { name: '⏱️ Total Play Time', value: this.formatDuration(totalPlayTime), inline: true },
            { name: '🎧 Sessions', value: sessions.toLocaleString(), inline: true },
            { name: '⏭️ Skips', value: skips.toLocaleString(), inline: true },
            { name: '🎤 Status', value: statusEmoji, inline: true },
            { name: '📋 Queue Size', value: `${queueSize} tracks`, inline: true },
            { name: '🎵 Now Playing', value: currentTrack ? `**${currentTrack.title}**` : '*Nothing playing*', inline: false },
          ],
          footer: i.guild.name,
        }
      );
      await i.editReply({ embeds: [embed] });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  public async executePrefix(m: Message, args: string[]): Promise<void> {
    await m.reply({ content: 'Use slash command /music for full options.' });
  }

  // Helper Methods
  private formatDuration(milliseconds: number): string {
    if (!milliseconds || milliseconds < 0) return '0:00';
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
    }
    return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
  }

  private createProgressBar(position: number, duration: number): string {
    if (!duration || duration <= 0) return '▬▬▬▬▬▬▬▬▬▬ 0:00 / 0:00';
    
    const percentage = Math.min(100, Math.max(0, (position / duration) * 100));
    const filled = Math.round(percentage / 10);
    const empty = 10 - filled;
    
    const bar = '▬'.repeat(filled) + '🔘' + '▬'.repeat(empty);
    return `${bar} ${this.formatDuration(position)} / ${this.formatDuration(duration)}`;
  }
}

export default MusicCommand;
