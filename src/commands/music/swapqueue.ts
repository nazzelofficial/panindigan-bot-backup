// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';

export class SwapQueueCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'swapqueue',
      description: 'Swap two songs in the queue',
      category: 'music',
      cooldown: 3,
      userPermissions: [PermissionFlagsBits.Connect],
      botPermissions: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['swap', 'exchange'],
      examples: ['/swapqueue 1 5', 'p!swapqueue 3 7'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const index1 = interaction.options.getInteger('index1');
    const index2 = interaction.options.getInteger('index2');

    if (index1 === null || index1 < 1 || index2 === null || index2 < 1) {
      await interaction.reply({ content: '❌ Please provide valid indices (1-based).', ephemeral: true });
      return;
    }

    if (!interaction.guild || !interaction.member) return;

    const voiceChannel = (interaction.member as any).voice.channel;
    if (!voiceChannel) {
      await interaction.reply({ content: '❌ You need to be in a voice channel to swap songs.', ephemeral: true });
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

      if (index1 > player.queue.length || index2 > player.queue.length) {
        await interaction.reply({ content: '❌ Invalid indices. Queue only has ' + player.queue.length + ' songs.', ephemeral: true });
        return;
      }

      await musicManager.swap(interaction.guild.id, index1 - 1, index2 - 1);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.music} Songs Swapped`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Position 1', value: index1.toString(), inline: true },
          { name: 'Position 2', value: index2.toString(), inline: true },
          { name: 'Swapped by', value: interaction.user.tag, inline: false },
        ])
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ content: '❌ Failed to swap songs.', ephemeral: true });
    }
  }

  public async executePrefix(message: Message, _args: string[]): Promise<void> {
    const index1 = parseInt(args[0]);
    const index2 = parseInt(args[1]);

    if (isNaN(index1) || index1 < 1 || isNaN(index2) || index2 < 1) {
      await message.reply('❌ Please provide valid indices (1-based).');
      return;
    }

    if (!message.guild || !message.member) return;

    const voiceChannel = (message.member as any).voice.channel;
    if (!voiceChannel) {
      await message.reply('❌ You need to be in a voice channel to swap songs.');
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

      if (index1 > player.queue.length || index2 > player.queue.length) {
        await message.reply('❌ Invalid indices. Queue only has ' + player.queue.length + ' songs.');
        return;
      }

      await musicManager.swap(message.guild.id, index1 - 1, index2 - 1);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.music} Songs Swapped`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Position 1', value: index1.toString(), inline: true },
          { name: 'Position 2', value: index2.toString(), inline: true },
          { name: 'Swapped by', value: message.author.tag, inline: false },
        ])
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      await message.reply('❌ Failed to swap songs.');
    }
  }
}

export default SwapQueueCommand;
