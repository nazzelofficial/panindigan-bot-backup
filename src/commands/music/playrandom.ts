import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class PlayRandomCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'playrandom',
      description: 'Play random songs',
      category: 'music',
      cooldown: 5,
      userPermissions: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
      botPermissions: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['random', 'shuffleplay'],
      examples: ['/playrandom', 'p!playrandom'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.member || !interaction.guild) return;

    const voiceChannel = (interaction.member as any).voice.channel;
    if (!voiceChannel) {
      await interaction.reply({ content: '❌ You need to be in a voice channel to play random songs.', ephemeral: true });
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

      const tracks = await musicManager.getRandomSongs();

      if (!tracks || tracks.length === 0) {
        await interaction.editReply({ content: '❌ No random songs available.' });
        return;
      }

      if (!player) {
        await musicManager.create(interaction.guild.id, voiceChannel.id, interaction.channel.id);
      }

      await musicManager.loadQueue(interaction.guild.id, tracks);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.music} Random Songs Added to Queue`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Songs', value: tracks.length.toString(), inline: true },
          { name: 'Requested by', value: interaction.user.tag, inline: false },
        ])
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      await interaction.editReply({ content: '❌ Failed to play random songs.' });
    }
  }

  public async executePrefix(message: Message): Promise<void> {
    if (!message.member || !message.guild) return;

    const voiceChannel = (message.member as any).voice.channel;
    if (!voiceChannel) {
      await message.reply('❌ You need to be in a voice channel to play random songs.');
      return;
    }

    try {
      await message.reply('🎵 Loading random songs...');

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

      const tracks = await musicManager.getRandomSongs();

      if (!tracks || tracks.length === 0) {
        await message.edit('❌ No random songs available.');
        return;
      }

      if (!player) {
        await musicManager.create(message.guild.id, voiceChannel.id, message.channel.id);
      }

      await musicManager.loadQueue(message.guild.id, tracks);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.music} Random Songs Added to Queue`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Songs', value: tracks.length.toString(), inline: true },
          { name: 'Requested by', value: message.author.tag, inline: false },
        ])
        .setTimestamp();

      await message.edit({ embeds: [embed] });
    } catch (error) {
      await message.edit('❌ Failed to play random songs.');
    }
  }
}

export default PlayRandomCommand;
