// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';

export class PlayLocalCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'playlocal',
      description: 'Play local audio files',
      category: 'music',
      cooldown: 5,
      userPermissions: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
      botPermissions: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['local', 'file'],
      examples: ['/playlocal filename.mp3', 'p!playlocal filename.mp3'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const filename = interaction.options.getString('filename');

    if (!filename) {
      await interaction.reply({ content: '❌ Please provide a filename.', ephemeral: true });
      return;
    }

    if (!interaction.member || !interaction.guild) return;

    const voiceChannel = (interaction.member as any).voice.channel;
    if (!voiceChannel) {
      await interaction.reply({ content: '❌ You need to be in a voice channel to play local files.', ephemeral: true });
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

      const track = await musicManager.playLocal(interaction.guild.id, filename);

      if (!track) {
        await interaction.editReply({ content: '❌ File not found or unsupported format.' });
        return;
      }

      if (!player) {
        await client.kazagumo.createPlayer({ guildId: interaction.guild.id, voiceId: voiceChannel.id, textId: interaction.channel.id, volume: 80, deaf: true });
      }

      await musicManager.play(interaction.guild.id, track);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.music} Playing Local File`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'File', value: filename, inline: true },
          { name: 'Requested by', value: interaction.user.tag, inline: true },
        ])
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      await interaction.editReply({ content: '❌ Failed to play local file.' });
    }
  }

  public async executePrefix(message: Message, _args: string[]): Promise<void> {
    const filename = args[0];

    if (!filename) {
      await message.reply('❌ Please provide a filename.');
      return;
    }

    if (!message.member || !message.guild) return;

    const voiceChannel = (message.member as any).voice.channel;
    if (!voiceChannel) {
      await message.reply('❌ You need to be in a voice channel to play local files.');
      return;
    }

    try {
      await message.reply('🎵 Loading local file...');

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

      const track = await musicManager.playLocal(message.guild.id, filename);

      if (!track) {
        await message.edit('❌ File not found or unsupported format.');
        return;
      }

      if (!player) {
        await client.kazagumo.createPlayer({ guildId: message.guild.id, voiceId: voiceChannel.id, textId: message.channel.id, volume: 80, deaf: true });
      }

      await musicManager.play(message.guild.id, track);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.music} Playing Local File`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'File', value: filename, inline: true },
          { name: 'Requested by', value: message.author.tag, inline: true },
        ])
        .setTimestamp();

      await message.edit({ embeds: [embed] });
    } catch (error) {
      await message.edit('❌ Failed to play local file.');
    }
  }
}

export default PlayLocalCommand;
