// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';

export class QueueCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'queue',
      description: 'View the current music queue',
      category: 'music',
      cooldown: 5,
      userPermissions: [PermissionFlagsBits.Connect],
      botPermissions: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['q', 'playlist'],
      examples: ['/queue', 'p!queue'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;

    try {
      const client = interaction.client as any;
      const musicManager = client.kazagumo;

      if (!musicManager) {
        await interaction.reply({ content: '❌ Music system is not available.', ephemeral: true });
        return;
      }

      const player = client.kazagumo!.players.get(interaction.guild.id);

      if (!player || (!player.queue.current && player.queue.size === 0)) {
        await interaction.reply({ content: '❌ The queue is empty.', ephemeral: true });
        return;
      }

      const queueList = [...player.queue].map((track: any, index: number) => 
        `${index + 1}. ${track.title} (${track.length ? this.formatDuration(track.length) : 'Unknown'})`
      ).join('\n');

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.music} Music Queue`)
        .setColor(COLORS.info)
        .addFields([
          { name: 'Now Playing', value: player.queue.current?.title || 'None', inline: false },
          { name: 'Queue Size', value: player.queue.size.toString(), inline: true },
          { name: 'Total Duration', value: this.calculateTotalDuration([...player.queue]), inline: true },
        ])
        .setTimestamp();

      if (queueList) {
        embed.addFields({ name: 'Up Next', value: queueList.substring(0, 1024) });
      }

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ content: '❌ Failed to fetch the queue.', ephemeral: true });
    }
  }

  public async executePrefix(message: Message): Promise<void> {
    if (!message.guild) return;

    try {
      const client = message.client as any;
      const musicManager = client.kazagumo;

      if (!musicManager) {
        await message.reply('❌ Music system is not available.');
        return;
      }

      const player = client.kazagumo!.players.get(message.guild.id);

      if (!player || (!player.queue.current && player.queue.size === 0)) {
        await message.reply('❌ The queue is empty.');
        return;
      }

      const queueList = [...player.queue].map((track: any, index: number) => 
        `${index + 1}. ${track.title} (${track.length ? this.formatDuration(track.length) : 'Unknown'})`
      ).join('\n');

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.music} Music Queue`)
        .setColor(COLORS.info)
        .addFields([
          { name: 'Now Playing', value: player.queue.current?.title || 'None', inline: false },
          { name: 'Queue Size', value: player.queue.size.toString(), inline: true },
          { name: 'Total Duration', value: this.calculateTotalDuration([...player.queue]), inline: true },
        ])
        .setTimestamp();

      if (queueList) {
        embed.addFields({ name: 'Up Next', value: queueList.substring(0, 1024) });
      }

      await message.reply({ embeds: [embed] });
    } catch (error) {
      await message.reply('❌ Failed to fetch the queue.');
    }
  }

  private formatDuration(ms: number): string {
    if (!ms) return 'Live';
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const h = Math.floor(m / 60);
    if (h > 0) return `${h}:${String(m % 60).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
    return `${m}:${String(s % 60).padStart(2, '0')}`;
  }

  private calculateTotalDuration(queue: any[]): string {
    let totalSeconds = 0;
    for (const track of queue) {
      if (track.duration) {
        const parts = track.duration.split(':').map(Number);
        if (parts.length === 2) {
          totalSeconds += parts[0] * 60 + parts[1];
        } else if (parts.length === 3) {
          totalSeconds += parts[0] * 3600 + parts[1] * 60 + parts[2];
        }
      }
    }
    
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  }
}

export default QueueCommand;
