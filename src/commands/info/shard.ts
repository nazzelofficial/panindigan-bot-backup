// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { Formatter } from '../../utils/Formatter.js';

export class ShardCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'shardstatus',
      description: 'Display shard information',
      category: 'info',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: [],
      examples: ['/shard', 'p!shard'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const client = interaction.client;
    const shardId = client.shard?.ids[0] || 0;
    const totalShards = client.shard?.count || 1;
    const guilds = client.guilds.cache.size;
    const members = client.users.cache.size;
    const ping = Math.round(client.ws.ping);

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} Shard Information`)
      .setColor(COLORS.info)
      .addFields([
        { name: 'Shard ID', value: shardId.toString(), inline: true },
        { name: 'Total Shards', value: totalShards.toString(), inline: true },
        { name: 'Guilds', value: Formatter.formatNumber(guilds), inline: true },
        { name: 'Members', value: Formatter.formatNumber(members), inline: true },
        { name: 'Ping', value: `${ping}ms`, inline: true },
      ])
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const client = message.client;
    const shardId = client.shard?.ids[0] || 0;
    const totalShards = client.shard?.count || 1;
    const guilds = client.guilds.cache.size;
    const members = client.users.cache.size;
    const ping = Math.round(client.ws.ping);

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} Shard Information`)
      .setColor(COLORS.info)
      .addFields([
        { name: 'Shard ID', value: shardId.toString(), inline: true },
        { name: 'Total Shards', value: totalShards.toString(), inline: true },
        { name: 'Guilds', value: Formatter.formatNumber(guilds), inline: true },
        { name: 'Members', value: Formatter.formatNumber(members), inline: true },
        { name: 'Ping', value: `${ping}ms`, inline: true },
      ])
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default ShardCommand;
