import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class PingCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'ping',
      description: 'Check the bot\'s latency',
      category: 'utility',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['latency'],
      examples: ['/ping', 'p!ping'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const sent = await interaction.reply({ content: 'Pinging...', fetchReply: true });
    const apiLatency = sent.createdTimestamp - interaction.createdTimestamp;
    const wsLatency = interaction.client.ws.ping;

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} 🏓 Pong!`)
      .setColor(COLORS.info)
      .addFields([
        { name: 'API Latency', value: `${apiLatency}ms`, inline: true },
        { name: 'WebSocket Latency', value: `${Math.round(wsLatency)}ms`, inline: true },
      ])
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const sent = await message.reply('Pinging...');
    const apiLatency = sent.createdTimestamp - message.createdTimestamp;
    const wsLatency = message.client.ws.ping;

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} 🏓 Pong!`)
      .setColor(COLORS.info)
      .addFields([
        { name: 'API Latency', value: `${apiLatency}ms`, inline: true },
        { name: 'WebSocket Latency', value: `${Math.round(wsLatency)}ms`, inline: true },
      ])
      .setTimestamp();

    await sent.edit({ embeds: [embed] });
  }
}

export default PingCommand;
