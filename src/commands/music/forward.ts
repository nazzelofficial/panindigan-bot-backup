import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class ForwardCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'forward',
      description: 'Forward the current song by a specified time',
      category: 'music',
      cooldown: 3,
      userPermissions: [PermissionFlagsBits.Connect],
      botPermissions: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['ff', 'fwd'],
      examples: ['/forward 10', 'p!forward 30'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const seconds = interaction.options.getInteger('seconds');

    if (seconds === null || seconds < 0) {
      await interaction.reply({ content: '❌ Please provide a valid number of seconds.', ephemeral: true });
      return;
    }

    if (!interaction.guild || !interaction.member) return;

    const voiceChannel = (interaction.member as any).voice.channel;
    if (!voiceChannel) {
      await interaction.reply({ content: '❌ You need to be in a voice channel to forward.', ephemeral: true });
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

      if (!player || !player.currentTrack) {
        await interaction.reply({ content: '❌ Nothing is currently playing.', ephemeral: true });
        return;
      }

      if (player.voiceChannel !== voiceChannel.id) {
        await interaction.reply({ content: '❌ You need to be in the same voice channel as the bot.', ephemeral: true });
        return;
      }

      const newPosition = Math.max(0, player.position + seconds);
      await player.seek(newPosition);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.music} Forwarded`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Forwarded by', value: `${seconds} seconds`, inline: true },
          { name: 'Requested by', value: interaction.user.tag, inline: true },
        ])
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ content: '❌ Failed to forward.', ephemeral: true });
    }
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const seconds = parseInt(args[0]);

    if (isNaN(seconds) || seconds < 0) {
      await message.reply('❌ Please provide a valid number of seconds.');
      return;
    }

    if (!message.guild || !message.member) return;

    const voiceChannel = (message.member as any).voice.channel;
    if (!voiceChannel) {
      await message.reply('❌ You need to be in a voice channel to forward.');
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

      if (!player || !player.currentTrack) {
        await message.reply('❌ Nothing is currently playing.');
        return;
      }

      if (player.voiceChannel !== voiceChannel.id) {
        await message.reply('❌ You need to be in the same voice channel as the bot.');
        return;
      }

      const newPosition = Math.max(0, player.position + seconds);
      await player.seek(newPosition);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.music} Forwarded`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Forwarded by', value: `${seconds} seconds`, inline: true },
          { name: 'Requested by', value: message.author.tag, inline: true },
        ])
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      await message.reply('❌ Failed to forward.');
    }
  }
}

export default ForwardCommand;
