import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class SnapshotCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'snapshot',
      description: 'Show a state snapshot of the bot (Owner only)',
      category: 'owner',
      premiumTier: 'free',
      cooldown: 0,
      userPermissions: [],
      botPermissions: [],
      ownerOnly: true,
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['state', 'stats-raw'],
      examples: ['/snapshot', 'p!snapshot'],
    };
    super(options);
  }

  private formatUptime(seconds: number): string {
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${d}d ${h}h ${m}m ${s}s`;
  }

  private formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  private buildEmbed(interaction: ChatInputCommandInteraction | null, message: Message | null): EmbedBuilder {
    const client = interaction ? interaction.client : message!.client;
    const uptimeSeconds = process.uptime();
    const mem = process.memoryUsage();
    const guildCount = client.guilds.cache.size;
    const shardCount = client.shard?.count ?? 1;
    const shardId = client.shard?.ids?.[0] ?? 0;

    return new EmbedBuilder()
      .setColor(COLORS.default)
      .setTitle(`${EMOJIS.owner} Bot State Snapshot`)
      .addFields(
        { name: '⏱️ Uptime', value: this.formatUptime(uptimeSeconds), inline: true },
        { name: '🏠 Guilds', value: `\`${guildCount}\``, inline: true },
        { name: '🔀 Shards', value: `\`${shardCount}\` (current: #${shardId})`, inline: true },
        { name: '🧠 Heap Used', value: this.formatBytes(mem.heapUsed), inline: true },
        { name: '📦 Heap Total', value: this.formatBytes(mem.heapTotal), inline: true },
        { name: '💾 RSS', value: this.formatBytes(mem.rss), inline: true },
        { name: '🔗 External', value: this.formatBytes(mem.external), inline: true },
        { name: '📐 Array Buffers', value: this.formatBytes(mem.arrayBuffers), inline: true },
        { name: '🖥️ Platform', value: `\`${process.platform} ${process.arch}\``, inline: true },
        { name: '🟢 Node.js', value: `\`${process.version}\``, inline: true },
        { name: '🔢 PID', value: `\`${process.pid}\``, inline: true },
      )
      .setTimestamp();
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const embed = this.buildEmbed(interaction, null)
      .setFooter({ text: `Requested by ${interaction.user.tag}` });

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }

  public async executePrefix(message: Message, _args: string[]): Promise<void> {
    const embed = this.buildEmbed(null, message)
      .setFooter({ text: `Requested by ${message.author.tag}` });

    await message.reply({ embeds: [embed] });
  }
}

export default SnapshotCommand;
