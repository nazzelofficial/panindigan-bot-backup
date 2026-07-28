// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';

export class SaveQueueCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'savequeue',
      description: 'Save the current queue to a playlist',
      category: 'music',
      cooldown: 5,
      userPermissions: [PermissionFlagsBits.Connect],
      botPermissions: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['save', 'sq'],
      examples: ['/savequeue myplaylist', 'p!savequeue myplaylist'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const name = interaction.options.getString('name');

    if (!name) {
      await interaction.reply({ content: '❌ Please provide a playlist name.', ephemeral: true });
      return;
    }

    if (!interaction.guildId) return;

    try {
      const prisma = getPrismaClient();

      const existingPlaylist = await prisma.playlist.findFirst({
        where: { name, guildId: interaction.guildId },
      });

      if (existingPlaylist) {
        await interaction.reply({ content: '❌ A playlist with this name already exists.', ephemeral: true });
        return;
      }

      const client = interaction.client as any;
      const musicManager = client.kazagumo;

      if (!musicManager) {
        await interaction.reply({ content: '❌ Music system is not available.', ephemeral: true });
        return;
      }

      const player = client.kazagumo!.players.get(interaction.guildId);
      if (!player || player.queue.size === 0) {
        await interaction.reply({ content: '❌ No songs in the current queue to save.', ephemeral: true });
        return;
      }

      await prisma.playlist.create({
        data: {
          name,
          guildId: interaction.guildId,
          userId: interaction.user.id,
          songs: JSON.stringify(player.queue),
        },
      });

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.success} Queue Saved`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Playlist', value: name, inline: true },
          { name: 'Songs', value: player.queue.size.toString(), inline: true },
          { name: 'Saved by', value: interaction.user.tag, inline: false },
        ])
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ content: '❌ Failed to save queue.', ephemeral: true });
    }
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const name = args[0];

    if (!name) {
      await message.reply('❌ Please provide a playlist name.');
      return;
    }

    if (!message.guildId) return;

    try {
      const prisma = getPrismaClient();

      const existingPlaylist = await prisma.playlist.findFirst({
        where: { name, guildId: message.guildId },
      });

      if (existingPlaylist) {
        await message.reply('❌ A playlist with this name already exists.');
        return;
      }

      const client = message.client as any;
      const musicManager = client.kazagumo;

      if (!musicManager) {
        await message.reply('❌ Music system is not available.');
        return;
      }

      const player = client.kazagumo!.players.get(message.guildId);
      if (!player || player.queue.size === 0) {
        await message.reply('❌ No songs in the current queue to save.');
        return;
      }

      await prisma.playlist.create({
        data: {
          name,
          guildId: message.guildId,
          userId: message.author.id,
          songs: JSON.stringify(player.queue),
        },
      });

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.success} Queue Saved`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Playlist', value: name, inline: true },
          { name: 'Songs', value: player.queue.size.toString(), inline: true },
          { name: 'Saved by', value: message.author.tag, inline: false },
        ])
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      await message.reply('❌ Failed to save queue.');
    }
  }
}

export default SaveQueueCommand;
