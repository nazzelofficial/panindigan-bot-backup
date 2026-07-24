import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class PlayChartCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'playchart',
      description: 'Play songs from music charts',
      category: 'music',
      cooldown: 5,
      userPermissions: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
      botPermissions: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['chart', 'top100'],
      examples: ['/playchart', 'p!playchart'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const chart = interaction.options.getString('chart') || 'top100';

    if (!interaction.member || !interaction.guild) return;

    const voiceChannel = (interaction.member as any).voice.channel;
    if (!voiceChannel) {
      await interaction.reply({ content: '❌ You need to be in a voice channel to play chart songs.', ephemeral: true });
      return;
    }

    try {
      await interaction.deferReply();

      const client = interaction.client as any;
      const musicManager = client.musicManager;

      if (!musicManager) {
        await interaction.editReply({ content: '❌ Music system is not available.' });
        return;
      }

      const player = musicManager.get(interaction.guild.id);

      if (player && player.voiceChannel !== voiceChannel.id) {
        await interaction.editReply({ content: '❌ I\'m already playing in another voice channel.' });
        return;
      }

      const tracks = await musicManager.getChart(chart);

      if (!tracks || tracks.length === 0) {
        await interaction.editReply({ content: '❌ No songs found for that chart.' });
        return;
      }

      if (!player) {
        await musicManager.create(interaction.guild.id, voiceChannel.id, interaction.channel.id);
      }

      await musicManager.loadQueue(interaction.guild.id, tracks);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.music} Chart Songs Added to Queue`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Chart', value: chart, inline: true },
          { name: 'Songs', value: tracks.length.toString(), inline: true },
          { name: 'Requested by', value: interaction.user.tag, inline: false },
        ])
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      await interaction.editReply({ content: '❌ Failed to play chart songs.' });
    }
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const chart = args[0] || 'top100';

    if (!message.member || !message.guild) return;

    const voiceChannel = (message.member as any).voice.channel;
    if (!voiceChannel) {
      await message.reply('❌ You need to be in a voice channel to play chart songs.');
      return;
    }

    try {
      await message.reply('🎵 Loading chart...');

      const client = message.client as any;
      const musicManager = client.musicManager;

      if (!musicManager) {
        await message.edit('❌ Music system is not available.');
        return;
      }

      const player = musicManager.get(message.guild.id);

      if (player && player.voiceChannel !== voiceChannel.id) {
        await message.edit('❌ I\'m already playing in another voice channel.');
        return;
      }

      const tracks = await musicManager.getChart(chart);

      if (!tracks || tracks.length === 0) {
        await message.edit('❌ No songs found for that chart.');
        return;
      }

      if (!player) {
        await musicManager.create(message.guild.id, voiceChannel.id, message.channel.id);
      }

      await musicManager.loadQueue(message.guild.id, tracks);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.music} Chart Songs Added to Queue`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Chart', value: chart, inline: true },
          { name: 'Songs', value: tracks.length.toString(), inline: true },
          { name: 'Requested by', value: message.author.tag, inline: false },
        ])
        .setTimestamp();

      await message.edit({ embeds: [embed] });
    } catch (error) {
      await message.edit('❌ Failed to play chart songs.');
    }
  }
}

export default PlayChartCommand;
