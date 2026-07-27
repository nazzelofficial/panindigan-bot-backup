// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { Formatter } from '../../utils/Formatter.js';

export class StatsCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'stats',
      description: 'Display bot statistics',
      category: 'info',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['statistics', 'botstats'],
      examples: ['/stats', 'p!stats'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const client = interaction.client;

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} 📊 Bot Statistics`)
      .setColor(COLORS.info)
      .addFields([
        { name: 'Servers', value: Formatter.formatNumber(client.guilds.cache.size), inline: true },
        { name: 'Users', value: Formatter.formatNumber(client.users.cache.size), inline: true },
        { name: 'Channels', value: Formatter.formatNumber(client.channels.cache.size), inline: true },
        { name: 'Emojis', value: Formatter.formatNumber(client.emojis.cache.size), inline: true },
        { name: 'Commands', value: Formatter.formatNumber(client.commands?.size || 0), inline: true },
        { name: 'Ping', value: `${Math.round(client.ws.ping)}ms`, inline: true },
      ])
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const client = message.client;

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} 📊 Bot Statistics`)
      .setColor(COLORS.info)
      .addFields([
        { name: 'Servers', value: Formatter.formatNumber(client.guilds.cache.size), inline: true },
        { name: 'Users', value: Formatter.formatNumber(client.users.cache.size), inline: true },
        { name: 'Channels', value: Formatter.formatNumber(client.channels.cache.size), inline: true },
        { name: 'Emojis', value: Formatter.formatNumber(client.emojis.cache.size), inline: true },
        { name: 'Commands', value: Formatter.formatNumber(client.commands?.size || 0), inline: true },
        { name: 'Ping', value: `${Math.round(client.ws.ping)}ms`, inline: true },
      ])
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default StatsCommand;
