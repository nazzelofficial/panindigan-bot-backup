import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class HistoryCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'history',
      description: 'View the song history for this session',
      category: 'music',
      cooldown: 5,
      userPermissions: [PermissionFlagsBits.Connect],
      botPermissions: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['songhistory', 'played'],
      examples: ['/history', 'p!history'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guildId) return;

    try {
      const client = interaction.client as any;
      const musicManager = client.musicManager;

      if (!musicManager) {
        await interaction.reply({ content: '❌ Music system is not available.', ephemeral: true });
        return;
      }

      const player = musicManager.get(interaction.guildId);

      if (!player || !player.history || player.history.length === 0) {
        await interaction.reply({ content: '❌ No song history available.', ephemeral: true });
        return;
      }

      const historyList = player.history.slice(0, 10).map((song: any, index: number) => 
        `${index + 1}. ${song.title} (${song.duration || 'Unknown'})`
      ).join('\n');

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.music} Song History`)
        .setColor(COLORS.info)
        .addFields([
          { name: 'Total Played', value: player.history.length.toString(), inline: true },
          { name: 'Recent Songs (Last 10)', value: historyList, inline: false },
        ])
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ content: '❌ Failed to fetch history.', ephemeral: true });
    }
  }

  public async executePrefix(message: Message): Promise<void> {
    if (!message.guildId) return;

    try {
      const client = message.client as any;
      const musicManager = client.musicManager;

      if (!musicManager) {
        await message.reply('❌ Music system is not available.');
        return;
      }

      const player = musicManager.get(message.guildId);

      if (!player || !player.history || player.history.length === 0) {
        await message.reply('❌ No song history available.');
        return;
      }

      const historyList = player.history.slice(0, 10).map((song: any, index: number) => 
        `${index + 1}. ${song.title} (${song.duration || 'Unknown'})`
      ).join('\n');

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.music} Song History`)
        .setColor(COLORS.info)
        .addFields([
          { name: 'Total Played', value: player.history.length.toString(), inline: true },
          { name: 'Recent Songs (Last 10)', value: historyList, inline: false },
        ])
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      await message.reply('❌ Failed to fetch history.');
    }
  }
}

export default HistoryCommand;
