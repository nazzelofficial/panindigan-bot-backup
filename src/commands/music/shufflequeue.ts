import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class ShuffleQueueCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'shufflequeue',
      description: 'Shuffle the entire queue',
      category: 'music',
      cooldown: 5,
      userPermissions: [PermissionFlagsBits.Connect],
      botPermissions: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['shuffleall', 'randomqueue'],
      examples: ['/shufflequeue', 'p!shufflequeue'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild || !interaction.member) return;

    const voiceChannel = (interaction.member as any).voice.channel;
    if (!voiceChannel) {
      await interaction.reply({ content: '❌ You need to be in a voice channel to shuffle the queue.', ephemeral: true });
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

      if (player.queue.length < 2) {
        await interaction.reply({ content: '❌ Need at least 2 songs in the queue to shuffle.', ephemeral: true });
        return;
      }

      await musicManager.shuffle(interaction.guild.id);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.music} Queue Shuffled`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Shuffled by', value: interaction.user.tag, inline: true },
        ])
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ content: '❌ Failed to shuffle the queue.', ephemeral: true });
    }
  }

  public async executePrefix(message: Message): Promise<void> {
    if (!message.guild || !message.member) return;

    const voiceChannel = (message.member as any).voice.channel;
    if (!voiceChannel) {
      await message.reply('❌ You need to be in a voice channel to shuffle the queue.');
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

      if (player.queue.length < 2) {
        await message.reply('❌ Need at least 2 songs in the queue to shuffle.');
        return;
      }

      await musicManager.shuffle(message.guild.id);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.music} Queue Shuffled`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Shuffled by', value: message.author.tag, inline: true },
        ])
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      await message.reply('❌ Failed to shuffle the queue.');
    }
  }
}

export default ShuffleQueueCommand;
