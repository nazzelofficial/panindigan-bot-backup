// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { Formatter } from '../../utils/Formatter.js';

export class ShardCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'shard',
      description: 'Display shard information for the current server',
      category: 'help',
      cooldown: 10,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['shardinfo'],
      examples: ['/shard', 'p!shard'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    await this.showShardInfo(interaction);
  }

  public async executePrefix(message: Message): Promise<void> {
    await this.showShardInfo(message);
  }

  private async showShardInfo(interaction: ChatInputCommandInteraction | Message): Promise<void> {
    const client = interaction.client;
    const guild = interaction.guild;
    
    if (!guild) {
      if (interaction instanceof ChatInputCommandInteraction) {
        await interaction.reply({ content: '❌ This command can only be used in a server.', ephemeral: true });
      } else {
        await interaction.reply('❌ This command can only be used in a server.');
      }
      return;
    }

    const shardId = guild.shardId;
    const totalShards = client.ws.shards.size;
    const guildCount = client.guilds.cache.size;
    const memberCount = client.guilds.cache.reduce((acc: number, guild) => acc + guild.memberCount, 0);
    const avgGuildsPerShard = Math.floor(guildCount / totalShards);
    const avgMembersPerShard = Math.floor(memberCount / totalShards);

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} Shard Information`)
      .setColor(COLORS.info)
      .addFields([
        { name: 'Current Shard', value: `#${shardId}`, inline: true },
        { name: 'Total Shards', value: totalShards.toString(), inline: true },
        { name: 'Shard Status', value: '🟢 Connected', inline: true },
        { name: 'Guilds on Shard', value: Formatter.formatNumber(guildCount), inline: true },
        { name: 'Members on Shard', value: Formatter.formatNumber(memberCount), inline: true },
        { name: 'Avg Guilds/Shard', value: Formatter.formatNumber(avgGuildsPerShard), inline: true },
        { name: 'Avg Members/Shard', value: Formatter.formatNumber(avgMembersPerShard), inline: true },
        { name: 'Shard Ping', value: `${client.ws.ping}ms`, inline: true },
      ])
      .setFooter({ text: `Shard ${shardId} of ${totalShards}` })
      .setTimestamp();

    if (interaction instanceof ChatInputCommandInteraction) {
      await interaction.reply({ embeds: [embed] });
    } else {
      await interaction.reply({ embeds: [embed] });
    }
  }
}

export default ShardCommand;
