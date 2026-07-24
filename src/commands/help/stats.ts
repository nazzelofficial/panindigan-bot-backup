import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';
import { Formatter } from '../../utils/Formatter';

export class StatsCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'stats',
      description: 'Display bot statistics and uptime',
      category: 'help',
      cooldown: 10,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['botstats', 'info'],
      examples: ['/stats', 'p!stats'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    await this.showStats(interaction);
  }

  public async executePrefix(message: Message): Promise<void> {
    await this.showStats(message);
  }

  private async showStats(interaction: ChatInputCommandInteraction | Message): Promise<void> {
    const client = interaction.client;
    const uptime = Formatter.formatDuration(Math.floor(client.uptime / 1000));
    const guildCount = client.guilds.cache.size;
    const memberCount = client.guilds.cache.reduce((acc: number, guild) => acc + guild.memberCount, 0);
    const channelCount = client.channels.cache.size;
    const commandCount = (client as any).commands?.size || 0;

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} ${client.user?.username} Statistics`)
      .setColor(COLORS.info)
      .setThumbnail(client.user?.displayAvatarURL())
      .addFields([
        { name: 'Servers', value: Formatter.formatNumber(guildCount), inline: true },
        { name: 'Members', value: Formatter.formatNumber(memberCount), inline: true },
        { name: 'Channels', value: Formatter.formatNumber(channelCount), inline: true },
        { name: 'Commands', value: commandCount.toString(), inline: true },
        { name: 'Uptime', value: uptime, inline: true },
        { name: 'Ping', value: `${client.ws.ping}ms`, inline: true },
        { name: 'Node.js', value: process.version, inline: true },
        { name: 'Discord.js', value: 'v14', inline: true },
        { name: 'Memory', value: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`, inline: true },
      ])
      .setTimestamp();

    if (interaction instanceof ChatInputCommandInteraction) {
      await interaction.reply({ embeds: [embed] });
    } else {
      await interaction.reply({ embeds: [embed] });
    }
  }
}

export default StatsCommand;
