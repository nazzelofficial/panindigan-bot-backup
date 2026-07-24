import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class PlayRecommendationsCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'playrecommendations',
      description: 'Play recommended songs based on your taste',
      category: 'music',
      cooldown: 5,
      userPermissions: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
      botPermissions: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['recommend', 'foryou'],
      examples: ['/playrecommendations', 'p!playrecommendations'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.member || !interaction.guild) return;

    const voiceChannel = (interaction.member as any).voice.channel;
    if (!voiceChannel) {
      await interaction.reply({ content: '❌ You need to be in a voice channel to play recommendations.', ephemeral: true });
      return;
    }

    try {
      await interaction.deferReply();

      const client = interaction.client as any;
      const musicManager = client.kazagumo;

      if (!musicManager) {
        await interaction.editReply({ content: '❌ Music system is not available.' });
        return;
      }

      const player = client.kazagumo!.players.get(interaction.guild.id);

      if (player && player.voiceChannel !== voiceChannel.id) {
        await interaction.editReply({ content: '❌ I\'m already playing in another voice channel.' });
        return;
      }

      const tracks = await musicManager.getRecommendations(interaction.user.id);

      if (!tracks || tracks.length === 0) {
        await interaction.editReply({ content: '❌ No recommendations available. Play some songs first!' });
        return;
      }

      if (!player) {
        await client.kazagumo.createPlayer({ guildId: interaction.guild.id, voiceId: voiceChannel.id, textId: interaction.channel.id, volume: 80, deaf: true });
      }

      player.queue.add(tracks);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.music} Recommendations Added to Queue`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Songs', value: tracks.length.toString(), inline: true },
          { name: 'Based on your taste', value: interaction.user.tag, inline: false },
        ])
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      await interaction.editReply({ content: '❌ Failed to play recommendations.' });
    }
  }

  public async executePrefix(message: Message): Promise<void> {
    if (!message.member || !message.guild) return;

    const voiceChannel = (message.member as any).voice.channel;
    if (!voiceChannel) {
      await message.reply('❌ You need to be in a voice channel to play recommendations.');
      return;
    }

    try {
      await message.reply('🎵 Loading recommendations...');

      const client = message.client as any;
      const musicManager = client.kazagumo;

      if (!musicManager) {
        await message.edit('❌ Music system is not available.');
        return;
      }

      const player = client.kazagumo!.players.get(message.guild.id);

      if (player && player.voiceChannel !== voiceChannel.id) {
        await message.edit('❌ I\'m already playing in another voice channel.');
        return;
      }

      const tracks = await musicManager.getRecommendations(message.author.id);

      if (!tracks || tracks.length === 0) {
        await message.edit('❌ No recommendations available. Play some songs first!');
        return;
      }

      if (!player) {
        await client.kazagumo.createPlayer({ guildId: message.guild.id, voiceId: voiceChannel.id, textId: message.channel.id, volume: 80, deaf: true });
      }

      player.queue.add(tracks);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.music} Recommendations Added to Queue`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Songs', value: tracks.length.toString(), inline: true },
          { name: 'Based on your taste', value: message.author.tag, inline: false },
        ])
        .setTimestamp();

      await message.edit({ embeds: [embed] });
    } catch (error) {
      await message.edit('❌ Failed to play recommendations.');
    }
  }
}

export default PlayRecommendationsCommand;
