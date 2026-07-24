import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';
import { getPrismaClient } from '../../database/postgresql/client';

export class LoadQueueCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'loadqueue',
      description: 'Load a saved playlist into the queue',
      category: 'music',
      cooldown: 5,
      userPermissions: [PermissionFlagsBits.Connect],
      botPermissions: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['load', 'lq'],
      examples: ['/loadqueue myplaylist', 'p!loadqueue myplaylist'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const name = interaction.options.getString('name');

    if (!name) {
      await interaction.reply({ content: '❌ Please provide a playlist name.', ephemeral: true });
      return;
    }

    if (!interaction.guild || !interaction.member) return;

    const voiceChannel = (interaction.member as any).voice.channel;
    if (!voiceChannel) {
      await interaction.reply({ content: '❌ You need to be in a voice channel to load a playlist.', ephemeral: true });
      return;
    }

    if (!interaction.guildId) return;

    try {
      const prisma = getPrismaClient();

      const playlist = await prisma.playlist.findFirst({
        where: { name, guildId: interaction.guildId },
      });

      if (!playlist) {
        await interaction.reply({ content: '❌ Playlist not found.', ephemeral: true });
        return;
      }

      const songs = JSON.parse(playlist.songs);

      const client = interaction.client as any;
      const musicManager = client.musicManager;

      if (!musicManager) {
        await interaction.reply({ content: '❌ Music system is not available.', ephemeral: true });
        return;
      }

      const player = musicManager.get(interaction.guild.id);
      if (!player) {
        await musicManager.create(interaction.guild.id, voiceChannel.id, interaction.channel.id);
      }

      await musicManager.loadQueue(interaction.guild.id, songs);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.success} Playlist Loaded`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Playlist', value: playlist.name, inline: true },
          { name: 'Songs', value: songs.length.toString(), inline: true },
          { name: 'Loaded by', value: interaction.user.tag, inline: false },
        ])
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ content: '❌ Failed to load queue.', ephemeral: true });
    }
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const name = args[0];

    if (!name) {
      await message.reply('❌ Please provide a playlist name.');
      return;
    }

    if (!message.guild || !message.member) return;

    const voiceChannel = (message.member as any).voice.channel;
    if (!voiceChannel) {
      await message.reply('❌ You need to be in a voice channel to load a playlist.');
      return;
    }

    if (!message.guildId) return;

    try {
      const prisma = getPrismaClient();

      const playlist = await prisma.playlist.findFirst({
        where: { name, guildId: message.guildId },
      });

      if (!playlist) {
        await message.reply('❌ Playlist not found.');
        return;
      }

      const songs = JSON.parse(playlist.songs);

      const client = message.client as any;
      const musicManager = client.musicManager;

      if (!musicManager) {
        await message.reply('❌ Music system is not available.');
        return;
      }

      const player = musicManager.get(message.guild.id);
      if (!player) {
        await musicManager.create(message.guild.id, voiceChannel.id, message.channel.id);
      }

      await musicManager.loadQueue(message.guild.id, songs);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.success} Playlist Loaded`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Playlist', value: playlist.name, inline: true },
          { name: 'Songs', value: songs.length.toString(), inline: true },
          { name: 'Loaded by', value: message.author.tag, inline: false },
        ])
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      await message.reply('❌ Failed to load queue.');
    }
  }
}

export default LoadQueueCommand;
