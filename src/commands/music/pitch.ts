// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';

export class PitchCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'pitch',
      description: 'Set the pitch of the audio',
      category: 'music',
      cooldown: 3,
      userPermissions: [PermissionFlagsBits.Connect],
      botPermissions: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['speedpitch'],
      examples: ['/pitch 1.5', 'p!pitch 0.8'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const pitch = interaction.options.getNumber('pitch');

    if (pitch === null || pitch < 0.5 || pitch > 2) {
      await interaction.reply({ content: '❌ Please provide a valid pitch between 0.5 and 2.', ephemeral: true });
      return;
    }

    if (!interaction.guild || !interaction.member) return;

    const voiceChannel = (interaction.member as any).voice.channel;
    if (!voiceChannel) {
      await interaction.reply({ content: '❌ You need to be in a voice channel to set pitch.', ephemeral: true });
      return;
    }

    try {
      const client = interaction.client as any;
      const musicManager = client.kazagumo;

      if (!musicManager) {
        await interaction.reply({ content: '❌ Music system is not available.', ephemeral: true });
        return;
      }

      const player = client.kazagumo!.players.get(interaction.guild.id);

      if (!player) {
        await interaction.reply({ content: '❌ Nothing is currently playing.', ephemeral: true });
        return;
      }

      if (player.voiceChannel !== voiceChannel.id) {
        await interaction.reply({ content: '❌ You need to be in the same voice channel as the bot.', ephemeral: true });
        return;
      }

      await player.setFilters({ timescale: { pitch: pitch } });

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.music} Pitch Set`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Pitch', value: pitch.toFixed(2) + 'x', inline: true },
          { name: 'Set by', value: interaction.user.tag, inline: true },
        ])
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ content: '❌ Failed to set pitch.', ephemeral: true });
    }
  }

  public async executePrefix(message: Message, _args: string[]): Promise<void> {
    const pitch = parseFloat(args[0]);

    if (isNaN(pitch) || pitch < 0.5 || pitch > 2) {
      await message.reply('❌ Please provide a valid pitch between 0.5 and 2.');
      return;
    }

    if (!message.guild || !message.member) return;

    const voiceChannel = (message.member as any).voice.channel;
    if (!voiceChannel) {
      await message.reply('❌ You need to be in a voice channel to set pitch.');
      return;
    }

    try {
      const client = message.client as any;
      const musicManager = client.kazagumo;

      if (!musicManager) {
        await message.reply('❌ Music system is not available.');
        return;
      }

      const player = client.kazagumo!.players.get(message.guild.id);

      if (!player) {
        await message.reply('❌ Nothing is currently playing.');
        return;
      }

      if (player.voiceChannel !== voiceChannel.id) {
        await message.reply('❌ You need to be in the same voice channel as the bot.');
        return;
      }

      await player.setFilters({ timescale: { pitch: pitch } });

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.music} Pitch Set`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Pitch', value: pitch.toFixed(2) + 'x', inline: true },
          { name: 'Set by', value: message.author.tag, inline: true },
        ])
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      await message.reply('❌ Failed to set pitch.');
    }
  }
}

export default PitchCommand;
