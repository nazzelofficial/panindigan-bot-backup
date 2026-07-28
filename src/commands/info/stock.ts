// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';

export class StockCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'stock',
      description: 'Get stock price information (via Yahoo Finance / Alpha Vantage)',
      category: 'info',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['shares', 'stonks'],
      examples: ['/stock AAPL', '/stock TSLA', 'p!stock GOOGL'],
    };
    super(options);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addStringOption(o => o.setName('symbol').setDescription('Stock ticker symbol (e.g., AAPL, TSLA)').setRequired(true)) as SlashCommandBuilder;
  }

  private async fetchStock(symbol: string): Promise<EmbedBuilder> {
    const apiKey = process.env.ALPHA_VANTAGE_KEY;
    if (!apiKey) {
      // Fallback: use Yahoo Finance unofficial endpoint
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`;
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (!res.ok) throw new Error(`Stock data unavailable. Configure ALPHA_VANTAGE_KEY for better results.`);
      const data: any = await res.json();
      const meta = data?.chart?.result?.[0]?.meta;
      if (!meta) throw new Error(`No data found for symbol "${symbol}".`);
      const price = meta.regularMarketPrice;
      const prevClose = meta.previousClose || meta.chartPreviousClose;
      const change = price - prevClose;
      const changePct = (change / prevClose) * 100;
      const isPositive = change >= 0;
      return new EmbedBuilder()
        .setTitle(`📈 ${symbol.toUpperCase()} — ${meta.longName || meta.symbol}`)
        .setColor(isPositive ? COLORS.success : COLORS.error)
        .addFields(
          { name: '💵 Price', value: `$${price?.toFixed(2) || 'N/A'}`, inline: true },
          { name: `${isPositive ? '📈' : '📉'} Change`, value: `${isPositive ? '+' : ''}${change?.toFixed(2)} (${changePct?.toFixed(2)}%)`, inline: true },
          { name: '📊 Prev Close', value: `$${prevClose?.toFixed(2) || 'N/A'}`, inline: true },
          { name: '💹 52W High', value: `$${meta.fiftyTwoWeekHigh?.toFixed(2) || 'N/A'}`, inline: true },
          { name: '💹 52W Low', value: `$${meta.fiftyTwoWeekLow?.toFixed(2) || 'N/A'}`, inline: true },
          { name: '🏦 Exchange', value: meta.exchangeName || 'N/A', inline: true },
          { name: '💱 Currency', value: meta.currency || 'USD', inline: true },
        )
        .setURL(`https://finance.yahoo.com/quote/${symbol.toUpperCase()}`)
        .setFooter({ text: 'Yahoo Finance • Not financial advice' })
        .setTimestamp();
    }
    // Alpha Vantage
    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${encodeURIComponent(symbol)}&apikey=${apiKey}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Alpha Vantage API error: ${res.status}`);
    const data: any = await res.json();
    const quote = data['Global Quote'];
    if (!quote || !quote['05. price']) throw new Error(`No data for "${symbol}". Check the ticker symbol.`);
    const price = parseFloat(quote['05. price']);
    const change = parseFloat(quote['09. change']);
    const changePct = parseFloat(quote['10. change percent']);
    const isPositive = change >= 0;
    return new EmbedBuilder()
      .setTitle(`📈 ${symbol.toUpperCase()}`)
      .setColor(isPositive ? COLORS.success : COLORS.error)
      .addFields(
        { name: '💵 Price', value: `$${price.toFixed(2)}`, inline: true },
        { name: `${isPositive ? '📈' : '📉'} Change`, value: `${isPositive ? '+' : ''}${change.toFixed(2)} (${changePct.toFixed(2)}%)`, inline: true },
        { name: '📊 Prev Close', value: `$${parseFloat(quote['08. previous close']).toFixed(2)}`, inline: true },
        { name: '🔝 Day High', value: `$${parseFloat(quote['03. high']).toFixed(2)}`, inline: true },
        { name: '🔻 Day Low', value: `$${parseFloat(quote['04. low']).toFixed(2)}`, inline: true },
        { name: '📦 Volume', value: parseInt(quote['06. volume']).toLocaleString(), inline: true },
      )
      .setURL(`https://finance.yahoo.com/quote/${symbol.toUpperCase()}`)
      .setFooter({ text: 'Alpha Vantage • Not financial advice' })
      .setTimestamp();
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const symbol = interaction.options.getString('symbol', true).toUpperCase().trim();
    await interaction.deferReply();
    try {
      const embed = await this.fetchStock(symbol);
      await interaction.editReply({ embeds: [embed] });
    } catch (err: any) {
      await interaction.editReply({ content: `${EMOJIS.error} ${err.message || 'Failed to fetch stock data.'}` });
    }
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const symbol = args[0]?.toUpperCase();
    if (!symbol) return void message.reply(`${EMOJIS.error} Please provide a stock symbol (e.g., \`AAPL\`).`);
    const thinking = await message.reply(`${EMOJIS.info} Fetching stock data...`);
    try {
      const embed = await this.fetchStock(symbol);
      await thinking.edit({ content: null, embeds: [embed] });
    } catch (err: any) {
      await thinking.edit(`${EMOJIS.error} ${err.message || 'Failed to fetch stock data.'}`);
    }
  }
}

export default StockCommand;
