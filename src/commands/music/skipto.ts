import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class SkipToCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'skipto',
      description: 'Skip to a specific song in the queue',
      category: 'music',
      cooldown: 3,
      userPermissions: [PermissionFlagsBits.Connect],
      botPermissions: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['jump', 'goto'],
      examples: ['/skipto 5', 'p!skipto 10'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const index = interaction.options.getInteger('index');

    if (index === null || index < 1) {
      await interaction.reply({ content: '❌ Please provide a valid index (1-based).', ephemeral: true });
      return;
    }

    if (!interaction.guild || !interaction.member) return;

    const voiceChannel = (interaction.member as any).voice.channel;
    if (!voiceChannel) {
      await interaction.reply({ content: '❌ You need to be in a voice channel to skip.', ephemeral: true });
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

      if (index > player.queue.length) {
        await interaction.reply({ content: '❌ Invalid index. Queue only has ' + player.queue.length + ' songs.', ephemeral: true });
        return;
      }

      const targetTrack = await musicManager.skipTo(interaction.guild.id, index - 1);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.music} Skipped To`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Now Playing', value: targetTrack?.title || 'Unknown', inline: true },
          { name: 'Skipped by', value: interaction.user.tag, inline: true },
        ])
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ content: '❌ Failed to skip to song.', ephemeral: true });
    }
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const index = parseInt(args[0]);

    if (isNaN(index) || index < 1) {
      await message.reply('❌ Please provide a valid index (1-based).');
      return;
    }

    if (!message.guild || !message.member) return;

    const voiceChannel = (message.member as any).voice.channel;
    if (!voiceChannel) {
      await message.reply('❌ You need to be in a voice channel to skip.');
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

      if (index > player.queue.length) {
        await message.reply('❌ Invalid index. Queue only has ' + player.queue.length + ' songs.');
        return;
      }

      const targetTrack = await musicManager.skipTo(message.guild.id, index - 1);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.music} Skipped To`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Now Playing', value: targetTrack?.title || 'Unknown', inline: true },
          { name: 'Skipped by', value: message.author.tag, inline: true },
        ])
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      await message.reply('❌ Failed to skip to song.');
    }
  }
}

export default SkipToCommand;
