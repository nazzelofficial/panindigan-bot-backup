import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class VolumeCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'volume',
      description: 'Set the music volume',
      category: 'music',
      cooldown: 3,
      userPermissions: [PermissionFlagsBits.Connect],
      botPermissions: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['vol', 'v'],
      examples: ['/volume 75', 'p!volume 50'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const volume = interaction.options.getInteger('volume');

    if (volume === null || volume < 0 || volume > 100) {
      await interaction.reply({ content: '❌ Volume must be between 0 and 100.', ephemeral: true });
      return;
    }

    if (!interaction.guild || !interaction.member) return;

    const voiceChannel = (interaction.member as any).voice.channel;
    if (!voiceChannel) {
      await interaction.reply({ content: '❌ You need to be in a voice channel to change volume.', ephemeral: true });
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

      await musicManager.setVolume(interaction.guild.id, volume);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.music} Volume Changed`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Volume', value: `${volume}%`, inline: true },
          { name: 'Changed by', value: interaction.user.tag, inline: true },
        ])
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ content: '❌ Failed to change volume.', ephemeral: true });
    }
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const volume = parseInt(args[0]);

    if (isNaN(volume) || volume < 0 || volume > 100) {
      await message.reply('❌ Volume must be between 0 and 100.');
      return;
    }

    if (!message.guild || !message.member) return;

    const voiceChannel = (message.member as any).voice.channel;
    if (!voiceChannel) {
      await message.reply('❌ You need to be in a voice channel to change volume.');
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

      await musicManager.setVolume(message.guild.id, volume);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.music} Volume Changed`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Volume', value: `${volume}%`, inline: true },
          { name: 'Changed by', value: message.author.tag, inline: true },
        ])
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      await message.reply('❌ Failed to change volume.');
    }
  }
}

export default VolumeCommand;
