import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class NpCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'np',
      description: 'Show the currently playing song',
      category: 'music',
      cooldown: 3,
      userPermissions: [PermissionFlagsBits.Connect],
      botPermissions: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['nowplaying', 'current', 'playing'],
      examples: ['/np', 'p!np'],
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

      if (!player || !player.currentTrack) {
        await interaction.reply({ content: '❌ Nothing is currently playing.', ephemeral: true });
        return;
      }

      const progressBar = this.createProgressBar(player.position, player.currentTrack.duration);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.music} Now Playing`)
        .setColor(COLORS.info)
        .addFields([
          { name: 'Title', value: player.currentTrack.title, inline: false },
          { name: 'Duration', value: player.currentTrack.duration || 'Unknown', inline: true },
          { name: 'Requested by', value: `<@${player.currentTrack.requestedBy}>`, inline: true },
          { name: 'Progress', value: progressBar, inline: false },
        ])
        .setThumbnail(player.currentTrack.thumbnail || null)
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ content: '❌ Failed to fetch now playing.', ephemeral: true });
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

      if (!player || !player.currentTrack) {
        await message.reply('❌ Nothing is currently playing.');
        return;
      }

      const progressBar = this.createProgressBar(player.position, player.currentTrack.duration);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.music} Now Playing`)
        .setColor(COLORS.info)
        .addFields([
          { name: 'Title', value: player.currentTrack.title, inline: false },
          { name: 'Duration', value: player.currentTrack.duration || 'Unknown', inline: true },
          { name: 'Requested by', value: `<@${player.currentTrack.requestedBy}>`, inline: true },
          { name: 'Progress', value: progressBar, inline: false },
        ])
        .setThumbnail(player.currentTrack.thumbnail || null)
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      await message.reply('❌ Failed to fetch now playing.');
    }
  }

  private createProgressBar(current: number, total: number): string {
    const duration = this.parseDuration(total);
    const position = this.parseDuration(current);
    const percentage = current / total;
    const filled = Math.round(percentage * 20);
    const empty = 20 - filled;
    return `${'▰'.repeat(filled)}${'▱'.repeat(empty)} ${position}/${duration}`;
  }

  private parseDuration(duration: string | number): string {
    if (typeof duration === 'number') {
      const mins = Math.floor(duration / 60);
      const secs = duration % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    return duration;
  }
}

export default NpCommand;
