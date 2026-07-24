import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';
import { Formatter } from '../../utils/Formatter';

export class PingCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'ping',
      description: 'Check the bot latency and API response time',
      category: 'help',
      cooldown: 5,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['latency', 'pong'],
      examples: ['/ping', 'p!ping'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const startTime = Date.now();
    await interaction.deferReply();
    const endTime = Date.now();
    const apiLatency = endTime - startTime;
    const websocketLatency = interaction.client.ws.ping;

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} Pong!`)
      .setColor(COLORS.success)
      .addFields([
        { name: 'API Latency', value: `${apiLatency}ms`, inline: true },
        { name: 'WebSocket Latency', value: `${websocketLatency}ms`, inline: true },
        { name: 'Total Latency', value: `${apiLatency + websocketLatency}ms`, inline: true },
      ])
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const startTime = Date.now();
    const sentMessage = await message.reply('Pinging...');
    const endTime = Date.now();
    const apiLatency = endTime - startTime;
    const websocketLatency = message.client.ws.ping;

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} Pong!`)
      .setColor(COLORS.success)
      .addFields([
        { name: 'API Latency', value: `${apiLatency}ms`, inline: true },
        { name: 'WebSocket Latency', value: `${websocketLatency}ms`, inline: true },
        { name: 'Total Latency', value: `${apiLatency + websocketLatency}ms`, inline: true },
      ])
      .setTimestamp();

    await sentMessage.edit({ embeds: [embed] });
  }
}

export default PingCommand;
