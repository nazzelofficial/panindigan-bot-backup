import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class MoveCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'move',
      description: 'Move a song in the queue to a new position',
      category: 'music',
      cooldown: 3,
      userPermissions: [PermissionFlagsBits.Connect],
      botPermissions: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['mv', 'reorder'],
      examples: ['/move 3 5', 'p!move 1 10'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const fromIndex = interaction.options.getInteger('from');
    const toIndex = interaction.options.getInteger('to');

    if (fromIndex === null || fromIndex < 1 || toIndex === null || toIndex < 1) {
      await interaction.reply({ content: '❌ Please provide valid indices (1-based).', ephemeral: true });
      return;
    }

    if (!interaction.guild || !interaction.member) return;

    const voiceChannel = (interaction.member as any).voice.channel;
    if (!voiceChannel) {
      await interaction.reply({ content: '❌ You need to be in a voice channel to move songs.', ephemeral: true });
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

      if (fromIndex > player.queue.length || toIndex > player.queue.length) {
        await interaction.reply({ content: '❌ Invalid indices. Queue only has ' + player.queue.length + ' songs.', ephemeral: true });
        return;
      }

      const movedTrack = await musicManager.move(interaction.guild.id, fromIndex - 1, toIndex - 1);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.music} Song Moved`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Track', value: movedTrack?.title || 'Unknown', inline: true },
          { name: 'New Position', value: toIndex.toString(), inline: true },
          { name: 'Moved by', value: interaction.user.tag, inline: true },
        ])
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ content: '❌ Failed to move song.', ephemeral: true });
    }
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const fromIndex = parseInt(args[0]);
    const toIndex = parseInt(args[1]);

    if (isNaN(fromIndex) || fromIndex < 1 || isNaN(toIndex) || toIndex < 1) {
      await message.reply('❌ Please provide valid indices (1-based).');
      return;
    }

    if (!message.guild || !message.member) return;

    const voiceChannel = (message.member as any).voice.channel;
    if (!voiceChannel) {
      await message.reply('❌ You need to be in a voice channel to move songs.');
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

      if (fromIndex > player.queue.length || toIndex > player.queue.length) {
        await message.reply('❌ Invalid indices. Queue only has ' + player.queue.length + ' songs.');
        return;
      }

      const movedTrack = await musicManager.move(message.guild.id, fromIndex - 1, toIndex - 1);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.music} Song Moved`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Track', value: movedTrack?.title || 'Unknown', inline: true },
          { name: 'New Position', value: toIndex.toString(), inline: true },
          { name: 'Moved by', value: message.author.tag, inline: true },
        ])
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      await message.reply('❌ Failed to move song.');
    }
  }
}

export default MoveCommand;
