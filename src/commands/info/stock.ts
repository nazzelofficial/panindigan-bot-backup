import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class StockCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'stock',
      description: 'Get stock price information',
      category: 'info',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: [],
      examples: ['/stock AAPL', '/stock TSLA', 'p!stock GOOGL'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const symbol = interaction.options.getString('symbol') || '';
    if (!symbol) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please provide a stock symbol (e.g., AAPL, TSLA, GOOGL).')
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed] });
      return;
    }

    const symbolUpper = symbol.toUpperCase();

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} 📈 Stock: ${symbolUpper}`)
      .setColor(COLORS.info)
      .setDescription('This is a placeholder. Stock prices will be implemented with a stock market API.')
      .addFields([
        { name: 'Symbol', value: symbolUpper, inline: true },
        { name: 'Price (USD)', value: 'N/A', inline: true },
        { name: '24h Change', value: 'N/A', inline: true },
        { name: 'Volume', value: 'N/A', inline: true },
      ])
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const args = message.content.split(' ').slice(1);
    const symbol = args[0] || '';

    if (!symbol) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please provide a stock symbol (e.g., AAPL, TSLA, GOOGL).')
        .setTimestamp();

      await message.reply({ embeds: [errorEmbed] });
      return;
    }

    const symbolUpper = symbol.toUpperCase();

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} 📈 Stock: ${symbolUpper}`)
      .setColor(COLORS.info)
      .setDescription('This is a placeholder. Stock prices will be implemented with a stock market API.')
      .addFields([
        { name: 'Symbol', value: symbolUpper, inline: true },
        { name: 'Price (USD)', value: 'N/A', inline: true },
        { name: '24h Change', value: 'N/A', inline: true },
        { name: 'Volume', value: 'N/A', inline: true },
      ])
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default StockCommand;
