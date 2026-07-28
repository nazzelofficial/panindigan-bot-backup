// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';

export class StatsCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'musicstats',
      description: 'View music statistics for the server',
      category: 'music',
      cooldown: 5,
      userPermissions: [PermissionFlagsBits.Connect],
      botPermissions: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['musicstats', 'mstats'],
      examples: ['/stats', 'p!stats'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guildId) return;

    try {
      const client = interaction.client as any;
      const musicManager = client.kazagumo;

      if (!musicManager) {
        await interaction.reply({ content: '❌ Music system is not available.', ephemeral: true });
        return;
      }

      const player = client.kazagumo!.players.get(interaction.guildId);
      const stats = await musicManager.getStats(interaction.guildId);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.music} Music Statistics`)
        .setColor(COLORS.info)
        .addFields([
          { name: 'Songs Played', value: stats?.songsPlayed?.toString() || '0', inline: true },
          { name: 'Total Playtime', value: stats?.totalPlaytime || '0:00', inline: true },
          { name: 'Current Queue', value: player?.queue.length?.toString() || '0', inline: true },
          { name: 'Currently Playing', value: player?.currentTrack?.title || 'None', inline: false },
        ])
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ content: '❌ Failed to fetch statistics.', ephemeral: true });
    }
  }

  public async executePrefix(message: Message): Promise<void> {
    if (!message.guildId) return;

    try {
      const client = message.client as any;
      const musicManager = client.kazagumo;

      if (!musicManager) {
        await message.reply('❌ Music system is not available.');
        return;
      }

      const player = client.kazagumo!.players.get(message.guildId);
      const stats = await musicManager.getStats(message.guildId);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.music} Music Statistics`)
        .setColor(COLORS.info)
        .addFields([
          { name: 'Songs Played', value: stats?.songsPlayed?.toString() || '0', inline: true },
          { name: 'Total Playtime', value: stats?.totalPlaytime || '0:00', inline: true },
          { name: 'Current Queue', value: player?.queue.length?.toString() || '0', inline: true },
          { name: 'Currently Playing', value: player?.currentTrack?.title || 'None', inline: false },
        ])
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      await message.reply('❌ Failed to fetch statistics.');
    }
  }
}

export default StatsCommand;
