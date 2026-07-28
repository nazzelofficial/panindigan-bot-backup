// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { PALETTE, KIT, divider } from '../../utils/EmbedSystem.js';
import { Formatter } from '../../utils/Formatter.js';
import process from 'node:process';

export class ShardCommand extends BaseCommand {
  constructor() {
    super({
      name: 'shard', description: 'Display shard information for this guild', category: 'info',
      cooldown: 10, userPermissions: [], botPermissions: [], guildOnly: false,
      slashCommand: true, prefixCommand: true,
      aliases: ['shards'], examples: ['/shard', 'p!shard'],
    });
  }

  private buildEmbed(client: any, guildId?: string): EmbedBuilder {
    const shardId   = client.shardId ?? 0;
    const total     = client.totalShards ?? 1;
    const wsLatency = Math.round(client.ws.ping);
    const uptime    = Formatter.formatUptime(client.uptime ?? 0);
    const memMB     = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1);

    const guildShard = guildId
      ? Number((BigInt(guildId) >> 22n) % BigInt(total))
      : null;

    return new EmbedBuilder()
      .setColor(PALETTE.primary)
      .setTitle(`${KIT.ping} Shard Information`)
      .addFields(
        { name: `📡 Current Shard`, value: divider(), inline: false },
        { name: '🔷 Shard ID',     value: `\`${shardId}\``,                    inline: true },
        { name: '🔢 Total Shards', value: `\`${total}\``,                      inline: true },
        { name: '📶 WS Ping',      value: `\`${wsLatency}ms\``,                inline: true },
        { name: '⏱️ Uptime',       value: `\`${uptime}\``,                     inline: true },
        { name: '💾 Heap',         value: `\`${memMB} MB\``,                   inline: true },
        ...(guildShard !== null
          ? [{ name: '🏠 Guild Shard', value: `\`${guildShard}\``,             inline: true }]
          : []),
        { name: `👥 Guilds`,       value: `\`${client.guilds.cache.size}\``,   inline: true },
        { name: `👤 Users`,        value: `\`${client.users.cache.size}\``,    inline: true },
      )
      .setFooter({ text: `Shard ${shardId}/${total - 1}  •  Panindigan Bot` })
      .setTimestamp();
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.reply({ embeds: [this.buildEmbed(interaction.client, interaction.guildId ?? undefined)] });
  }

  public async executePrefix(message: Message, _args: string[]): Promise<void> {
    await message.reply({ embeds: [this.buildEmbed(message.client, message.guildId ?? undefined)] });
  }
}
export default ShardCommand;
