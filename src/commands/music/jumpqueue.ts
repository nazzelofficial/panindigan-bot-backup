// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';

export class JumpQueueCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'jumpqueue',
      description: 'Jump to a specific position in the queue',
      category: 'music',
      cooldown: 3,
      userPermissions: [PermissionFlagsBits.Connect],
      botPermissions: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['jump', 'jumpto'],
      examples: ['/jumpqueue 5', 'p!jumpqueue 10'],
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
      await interaction.reply({ content: '❌ You need to be in a voice channel to jump in the queue.', ephemeral: true });
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

      if (player.voiceId !== voiceChannel.id) {
        await interaction.reply({ content: '❌ You need to be in the same voice channel as the bot.', ephemeral: true });
        return;
      }

      if (index > player.queue.size) {
        await interaction.reply({ content: '❌ Invalid index. Queue only has ' + player.queue.size + ' songs.', ephemeral: true });
        return;
      }

      const targetTrack = await musicManager.jumpTo(interaction.guild.id, index - 1);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.music} Jumped to Position`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Now Playing', value: targetTrack?.title || 'Unknown', inline: true },
          { name: 'Jumped by', value: interaction.user.tag, inline: true },
        ])
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ content: '❌ Failed to jump in queue.', ephemeral: true });
    }
  }

  public async executePrefix(message: Message, _args: string[]): Promise<void> {
    const index = parseInt(args[0]);

    if (isNaN(index) || index < 1) {
      await message.reply('❌ Please provide a valid index (1-based).');
      return;
    }

    if (!message.guild || !message.member) return;

    const voiceChannel = (message.member as any).voice.channel;
    if (!voiceChannel) {
      await message.reply('❌ You need to be in a voice channel to jump in the queue.');
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

      if (player.voiceId !== voiceChannel.id) {
        await message.reply('❌ You need to be in the same voice channel as the bot.');
        return;
      }

      if (index > player.queue.size) {
        await message.reply('❌ Invalid index. Queue only has ' + player.queue.size + ' songs.');
        return;
      }

      const targetTrack = await musicManager.jumpTo(message.guild.id, index - 1);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.music} Jumped to Position`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Now Playing', value: targetTrack?.title || 'Unknown', inline: true },
          { name: 'Jumped by', value: message.author.tag, inline: true },
        ])
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      await message.reply('❌ Failed to jump in queue.');
    }
  }
}

export default JumpQueueCommand;
