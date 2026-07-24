import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class PlayTopCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'playtop',
      description: 'Play a song at the top of the queue',
      category: 'music',
      cooldown: 3,
      userPermissions: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
      botPermissions: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['pt', 'playfirst'],
      examples: ['/playtop song name', 'p!playtop https://youtube.com/watch?v=...'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const query = interaction.options.getString('query');

    if (!query) {
      await interaction.reply({ content: '❌ Please provide a song name or URL.', ephemeral: true });
      return;
    }

    if (!interaction.member || !interaction.guild) return;

    const voiceChannel = (interaction.member as any).voice.channel;
    if (!voiceChannel) {
      await interaction.reply({ content: '❌ You need to be in a voice channel to play music.', ephemeral: true });
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

      const track = await musicManager.search(query);

      if (!track) {
        await interaction.editReply({ content: '❌ No results found for that query.' });
        return;
      }

      if (!player) {
        await musicManager.create(interaction.guild.id, voiceChannel.id, interaction.channel.id);
      }

      await musicManager.playTop(interaction.guild.id, track);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.music} Added to Top of Queue`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Track', value: track.title, inline: true },
          { name: 'Duration', value: track.duration || 'Unknown', inline: true },
          { name: 'Requested by', value: interaction.user.tag, inline: false },
        ])
        .setThumbnail(track.thumbnail || null)
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      await interaction.editReply({ content: '❌ Failed to play the song.' });
    }
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const query = args.join(' ');

    if (!query) {
      await message.reply('❌ Please provide a song name or URL.');
      return;
    }

    if (!message.member || !message.guild) return;

    const voiceChannel = (message.member as any).voice.channel;
    if (!voiceChannel) {
      await message.reply('❌ You need to be in a voice channel to play music.');
      return;
    }

    try {
      await message.reply('🎵 Searching...');

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

      const track = await musicManager.search(query);

      if (!track) {
        await message.edit('❌ No results found for that query.');
        return;
      }

      if (!player) {
        await musicManager.create(message.guild.id, voiceChannel.id, message.channel.id);
      }

      await musicManager.playTop(message.guild.id, track);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.music} Added to Top of Queue`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Track', value: track.title, inline: true },
          { name: 'Duration', value: track.duration || 'Unknown', inline: true },
          { name: 'Requested by', value: message.author.tag, inline: false },
        ])
        .setThumbnail(track.thumbnail || null)
        .setTimestamp();

      await message.edit({ embeds: [embed] });
    } catch (error) {
      await message.edit('❌ Failed to play the song.');
    }
  }
}

export default PlayTopCommand;
