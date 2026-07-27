// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';

export class SpeedCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'speed',
      description: 'Set the playback speed',
      category: 'music',
      cooldown: 3,
      userPermissions: [PermissionFlagsBits.Connect],
      botPermissions: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['playspeed'],
      examples: ['/speed 1.5', 'p!speed 0.8'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const speed = interaction.options.getNumber('speed');

    if (speed === null || speed < 0.5 || speed > 2) {
      await interaction.reply({ content: '❌ Please provide a valid speed between 0.5 and 2.', ephemeral: true });
      return;
    }

    if (!interaction.guild || !interaction.member) return;

    const voiceChannel = (interaction.member as any).voice.channel;
    if (!voiceChannel) {
      await interaction.reply({ content: '❌ You need to be in a voice channel to set speed.', ephemeral: true });
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

      await musicManager.setSpeed(interaction.guild.id, speed);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.music} Speed Set`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Speed', value: speed.toFixed(2) + 'x', inline: true },
          { name: 'Set by', value: interaction.user.tag, inline: true },
        ])
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ content: '❌ Failed to set speed.', ephemeral: true });
    }
  }

  public async executePrefix(message: Message, _args: string[]): Promise<void> {
    const speed = parseFloat(args[0]);

    if (isNaN(speed) || speed < 0.5 || speed > 2) {
      await message.reply('❌ Please provide a valid speed between 0.5 and 2.');
      return;
    }

    if (!message.guild || !message.member) return;

    const voiceChannel = (message.member as any).voice.channel;
    if (!voiceChannel) {
      await message.reply('❌ You need to be in a voice channel to set speed.');
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

      await musicManager.setSpeed(message.guild.id, speed);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.music} Speed Set`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Speed', value: speed.toFixed(2) + 'x', inline: true },
          { name: 'Set by', value: message.author.tag, inline: true },
        ])
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      await message.reply('❌ Failed to set speed.');
    }
  }
}

export default SpeedCommand;
