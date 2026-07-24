import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class ClearHistoryCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'clearhistory',
      description: 'Clear the song history for this session',
      category: 'music',
      cooldown: 5,
      userPermissions: [PermissionFlagsBits.Connect],
      botPermissions: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['clearsonghistory', 'clearplayed'],
      examples: ['/clearhistory', 'p!clearhistory'],
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

      if (!player) {
        await interaction.reply({ content: '❌ Nothing is currently playing.', ephemeral: true });
        return;
      }

      if (!player.history || player.history.length === 0) {
        await interaction.reply({ content: '❌ No song history to clear.', ephemeral: true });
        return;
      }

      const clearedCount = player.history.length;
      player.history = [];

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.success} History Cleared`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Cleared', value: `${clearedCount} songs`, inline: true },
          { name: 'Cleared by', value: interaction.user.tag, inline: true },
        ])
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ content: '❌ Failed to clear history.', ephemeral: true });
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

      if (!player) {
        await message.reply('❌ Nothing is currently playing.');
        return;
      }

      if (!player.history || player.history.length === 0) {
        await message.reply('❌ No song history to clear.');
        return;
      }

      const clearedCount = player.history.length;
      player.history = [];

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.success} History Cleared`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Cleared', value: `${clearedCount} songs`, inline: true },
          { name: 'Cleared by', value: message.author.tag, inline: true },
        ])
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      await message.reply('❌ Failed to clear history.');
    }
  }
}

export default ClearHistoryCommand;
