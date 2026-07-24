import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class PauseCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'pause',
      description: 'Pause the currently playing song',
      category: 'music',
      cooldown: 3,
      userPermissions: [PermissionFlagsBits.Connect],
      botPermissions: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['stopmusic'],
      examples: ['/pause', 'p!pause'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild || !interaction.member) return;

    const voiceChannel = (interaction.member as any).voice.channel;
    if (!voiceChannel) {
      await interaction.reply({ content: '❌ You need to be in a voice channel to pause music.', ephemeral: true });
      return;
    }

    try {
      const client = interaction.client as any;
      const musicManager = client.musicManager;

      if (!musicManager) {
        await interaction.reply({ content: '❌ Music system is not available.', ephemeral: true });
        return;
      }

      const player = musicManager.get(interaction.guild.id);

      if (!player) {
        await interaction.reply({ content: '❌ Nothing is currently playing.', ephemeral: true });
        return;
      }

      if (player.voiceChannel !== voiceChannel.id) {
        await interaction.reply({ content: '❌ You need to be in the same voice channel as the bot.', ephemeral: true });
        return;
      }

      if (player.paused) {
        await interaction.reply({ content: '❌ The music is already paused.', ephemeral: true });
        return;
      }

      await musicManager.pause(interaction.guild.id);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.music} Paused`)
        .setColor(COLORS.warning)
        .addFields([
          { name: 'Track', value: player.currentTrack?.title || 'Unknown', inline: true },
          { name: 'Paused by', value: interaction.user.tag, inline: true },
        ])
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ content: '❌ Failed to pause the music.', ephemeral: true });
    }
  }

  public async executePrefix(message: Message): Promise<void> {
    if (!message.guild || !message.member) return;

    const voiceChannel = (message.member as any).voice.channel;
    if (!voiceChannel) {
      await message.reply('❌ You need to be in a voice channel to pause music.');
      return;
    }

    try {
      const client = message.client as any;
      const musicManager = client.musicManager;

      if (!musicManager) {
        await message.reply('❌ Music system is not available.');
        return;
      }

      const player = musicManager.get(message.guild.id);

      if (!player) {
        await message.reply('❌ Nothing is currently playing.');
        return;
      }

      if (player.voiceChannel !== voiceChannel.id) {
        await message.reply('❌ You need to be in the same voice channel as the bot.');
        return;
      }

      if (player.paused) {
        await message.reply('❌ The music is already paused.');
        return;
      }

      await musicManager.pause(message.guild.id);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.music} Paused`)
        .setColor(COLORS.warning)
        .addFields([
          { name: 'Track', value: player.currentTrack?.title || 'Unknown', inline: true },
          { name: 'Paused by', value: message.author.tag, inline: true },
        ])
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      await message.reply('❌ Failed to pause the music.');
    }
  }
}

export default PauseCommand;
