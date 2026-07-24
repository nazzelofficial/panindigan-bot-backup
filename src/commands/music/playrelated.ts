import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class PlayRelatedCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'playrelated',
      description: 'Play songs related to the current track',
      category: 'music',
      cooldown: 5,
      userPermissions: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
      botPermissions: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['pr', 'related'],
      examples: ['/playrelated', 'p!playrelated'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.member || !interaction.guild) return;

    const voiceChannel = (interaction.member as any).voice.channel;
    if (!voiceChannel) {
      await interaction.reply({ content: '❌ You need to be in a voice channel to play related songs.', ephemeral: true });
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

      if (!player || !player.currentTrack) {
        await interaction.editReply({ content: '❌ Nothing is currently playing.' });
        return;
      }

      if (player.voiceChannel !== voiceChannel.id) {
        await interaction.editReply({ content: '❌ You need to be in the same voice channel as the bot.' });
        return;
      }

      const relatedTracks = await musicManager.getRelated(player.currentTrack);

      if (!relatedTracks || relatedTracks.length === 0) {
        await interaction.editReply({ content: '❌ No related songs found.' });
        return;
      }

      await musicManager.playRelated(interaction.guild.id, relatedTracks);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.music} Playing Related Songs`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Based on', value: player.currentTrack.title, inline: true },
          { name: 'Songs added', value: relatedTracks.length.toString(), inline: true },
          { name: 'Requested by', value: interaction.user.tag, inline: false },
        ])
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      await interaction.editReply({ content: '❌ Failed to play related songs.' });
    }
  }

  public async executePrefix(message: Message): Promise<void> {
    if (!message.member || !message.guild) return;

    const voiceChannel = (message.member as any).voice.channel;
    if (!voiceChannel) {
      await message.reply('❌ You need to be in a voice channel to play related songs.');
      return;
    }

    try {
      await message.reply('🎵 Finding related songs...');

      const client = message.client as any;
      const musicManager = client.musicManager;

      if (!musicManager) {
        await message.edit('❌ Music system is not available.');
        return;
      }

      const player = musicManager.get(message.guild.id);

      if (!player || !player.currentTrack) {
        await message.edit('❌ Nothing is currently playing.');
        return;
      }

      if (player.voiceChannel !== voiceChannel.id) {
        await message.edit('❌ You need to be in the same voice channel as the bot.');
        return;
      }

      const relatedTracks = await musicManager.getRelated(player.currentTrack);

      if (!relatedTracks || relatedTracks.length === 0) {
        await message.edit('❌ No related songs found.');
        return;
      }

      await musicManager.playRelated(message.guild.id, relatedTracks);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.music} Playing Related Songs`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Based on', value: player.currentTrack.title, inline: true },
          { name: 'Songs added', value: relatedTracks.length.toString(), inline: true },
          { name: 'Requested by', value: message.author.tag, inline: false },
        ])
        .setTimestamp();

      await message.edit({ embeds: [embed] });
    } catch (error) {
      await message.edit('❌ Failed to play related songs.');
    }
  }
}

export default PlayRelatedCommand;
