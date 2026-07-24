import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';
import { Formatter } from '../../utils/Formatter';

export class StatsCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'stats',
      description: 'Display bot statistics',
      category: 'utility',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: [],
      examples: ['/stats', 'p!stats'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const client = interaction.client;
    
    const guilds = client.guilds.cache.size;
    const users = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
    const channels = client.channels.cache.size;
    const emojis = client.guilds.cache.reduce((acc, guild) => acc + guild.emojis.cache.size, 0);
    const ping = Math.round(client.ws.ping);
    const uptime = this.formatUptime(client.uptime || 0);

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} 📊 Bot Statistics`)
      .setColor(COLORS.info)
      .addFields([
        { name: 'Servers', value: Formatter.formatNumber(guilds), inline: true },
        { name: 'Users', value: Formatter.formatNumber(users), inline: true },
        { name: 'Channels', value: Formatter.formatNumber(channels), inline: true },
        { name: 'Emojis', value: Formatter.formatNumber(emojis), inline: true },
        { name: 'Ping', value: `${ping}ms`, inline: true },
        { name: 'Uptime', value: uptime, inline: true },
      ])
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const client = message.client;
    
    const guilds = client.guilds.cache.size;
    const users = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
    const channels = client.channels.cache.size;
    const emojis = client.guilds.cache.reduce((acc, guild) => acc + guild.emojis.cache.size, 0);
    const ping = Math.round(client.ws.ping);
    const uptime = this.formatUptime(client.uptime || 0);

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} 📊 Bot Statistics`)
      .setColor(COLORS.info)
      .addFields([
        { name: 'Servers', value: Formatter.formatNumber(guilds), inline: true },
        { name: 'Users', value: Formatter.formatNumber(users), inline: true },
        { name: 'Channels', value: Formatter.formatNumber(channels), inline: true },
        { name: 'Emojis', value: Formatter.formatNumber(emojis), inline: true },
        { name: 'Ping', value: `${ping}ms`, inline: true },
        { name: 'Uptime', value: uptime, inline: true },
      ])
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }

  private formatUptime(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${days}d ${hours}h ${minutes}m ${secs}s`;
  }
}

export default StatsCommand;
