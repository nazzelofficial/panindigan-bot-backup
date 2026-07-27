// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { Formatter } from '../../utils/Formatter.js';

export class BotInfoCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'botinfo',
      description: 'Display information about the bot',
      category: 'info',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['bi', 'about'],
      examples: ['/botinfo', 'p!botinfo'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const client = interaction.client;
    const uptime = Formatter.formatUptime(client.uptime!);

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} Bot Information`)
      .setColor(COLORS.info)
      .setThumbnail(client.user!.displayAvatarURL({ size: 256, extension: 'png' }))
      .addFields([
        { name: 'Name', value: client.user!.username, inline: true },
        { name: 'ID', value: client.user!.id, inline: true },
        { name: 'Servers', value: Formatter.formatNumber(client.guilds.cache.size), inline: true },
        { name: 'Users', value: Formatter.formatNumber(client.users.cache.size), inline: true },
        { name: 'Uptime', value: uptime, inline: true },
        { name: 'Ping', value: `${Math.round(client.ws.ping)}ms`, inline: true },
      ])
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const client = message.client;
    const uptime = Formatter.formatUptime(client.uptime!);

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} Bot Information`)
      .setColor(COLORS.info)
      .setThumbnail(client.user!.displayAvatarURL({ size: 256, extension: 'png' }))
      .addFields([
        { name: 'Name', value: client.user!.username, inline: true },
        { name: 'ID', value: client.user!.id, inline: true },
        { name: 'Servers', value: Formatter.formatNumber(client.guilds.cache.size), inline: true },
        { name: 'Users', value: Formatter.formatNumber(client.users.cache.size), inline: true },
        { name: 'Uptime', value: uptime, inline: true },
        { name: 'Ping', value: `${Math.round(client.ws.ping)}ms`, inline: true },
      ])
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default BotInfoCommand;
