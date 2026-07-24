import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';
import { Formatter } from '../../utils/Formatter';

export class BotInfoCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'botinfo',
      description: 'Display information about the bot',
      category: 'utility',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['info', 'about'],
      examples: ['/botinfo', 'p!botinfo'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const client = interaction.client;
    const guilds = client.guilds.cache.size;
    const users = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
    const uptime = this.formatUptime(client.uptime || 0);

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} 🤖 Panindigan Bot Information`)
      .setColor(COLORS.info)
      .setThumbnail(client.user?.displayAvatarURL())
      .addFields([
        { name: 'Servers', value: Formatter.formatNumber(guilds), inline: true },
        { name: 'Users', value: Formatter.formatNumber(users), inline: true },
        { name: 'Uptime', value: uptime, inline: true },
        { name: 'Ping', value: `${Math.round(client.ws.ping)}ms`, inline: true },
        { name: 'Commands', value: '900', inline: true },
        { name: 'Version', value: 'v0.1', inline: true },
      ])
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const client = message.client;
    const guilds = client.guilds.cache.size;
    const users = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
    const uptime = this.formatUptime(client.uptime || 0);

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} 🤖 Panindigan Bot Information`)
      .setColor(COLORS.info)
      .setThumbnail(client.user?.displayAvatarURL())
      .addFields([
        { name: 'Servers', value: Formatter.formatNumber(guilds), inline: true },
        { name: 'Users', value: Formatter.formatNumber(users), inline: true },
        { name: 'Uptime', value: uptime, inline: true },
        { name: 'Ping', value: `${Math.round(client.ws.ping)}ms`, inline: true },
        { name: 'Commands', value: '900', inline: true },
        { name: 'Version', value: 'v0.1', inline: true },
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

export default BotInfoCommand;
