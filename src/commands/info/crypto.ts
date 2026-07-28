// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';

export class CryptoCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'crypto',
      description: 'Get cryptocurrency price information (via CoinGecko)',
      category: 'info',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['coin', 'btc'],
      examples: ['/crypto bitcoin', '/crypto ETH', 'p!crypto solana'],
    };
    super(options);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addStringOption(o => o.setName('coin').setDescription('Cryptocurrency name or symbol (e.g., bitcoin, ETH)').setRequired(false)
        .setAutocomplete(false)) as SlashCommandBuilder;
  }

  private async fetchCrypto(coin: string): Promise<any> {
    // Map common symbols to IDs
    const symbolMap: Record<string, string> = {
      btc: 'bitcoin', eth: 'ethereum', sol: 'solana', ada: 'cardano',
      bnb: 'binancecoin', dot: 'polkadot', matic: 'matic-network', avax: 'avalanche-2',
      xrp: 'ripple', ltc: 'litecoin', link: 'chainlink', doge: 'dogecoin',
    };
    const id = symbolMap[coin.toLowerCase()] || coin.toLowerCase();
    const url = `https://api.coingecko.com/api/v3/coins/${encodeURIComponent(id)}?localization=false&tickers=false&community_data=false&developer_data=false`;
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (res.status === 404) throw new Error(`Coin "${coin}" not found. Try the full name (e.g., "bitcoin").`);
    if (!res.ok) throw new Error(`CoinGecko API error: ${res.status}`);
    return res.json();
  }

  private formatChange(pct: number | null): string {
    if (pct === null || pct === undefined) return 'N/A';
    const arrow = pct >= 0 ? '📈' : '📉';
    return `${arrow} ${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%`;
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const coin = interaction.options.getString('coin') || 'bitcoin';
    await interaction.deferReply();
    try {
      const data = await this.fetchCrypto(coin);
      const market = data.market_data;
      const priceUSD = market.current_price?.usd;
      const embed = new EmbedBuilder()
        .setTitle(`💰 ${data.name} (${data.symbol?.toUpperCase()})`)
        .setColor(market.price_change_percentage_24h >= 0 ? COLORS.success : COLORS.error)
        .setThumbnail(data.image?.small)
        .addFields(
          { name: '💵 Price (USD)', value: priceUSD ? `$${priceUSD.toLocaleString()}` : 'N/A', inline: true },
          { name: '📊 24h Change', value: this.formatChange(market.price_change_percentage_24h), inline: true },
          { name: '📅 7d Change', value: this.formatChange(market.price_change_percentage_7d), inline: true },
          { name: '🏦 Market Cap', value: market.market_cap?.usd ? `$${market.market_cap.usd.toLocaleString()}` : 'N/A', inline: true },
          { name: '🔝 24h High', value: market.high_24h?.usd ? `$${market.high_24h.usd.toLocaleString()}` : 'N/A', inline: true },
          { name: '🔻 24h Low', value: market.low_24h?.usd ? `$${market.low_24h.usd.toLocaleString()}` : 'N/A', inline: true },
          { name: '📦 Volume (24h)', value: market.total_volume?.usd ? `$${market.total_volume.usd.toLocaleString()}` : 'N/A', inline: true },
          { name: '🏅 Market Rank', value: data.market_cap_rank ? `#${data.market_cap_rank}` : 'N/A', inline: true },
        )
        .setURL(`https://www.coingecko.com/en/coins/${data.id}`)
        .setFooter({ text: 'Data from CoinGecko • Not financial advice' })
        .setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    } catch (err: any) {
      await interaction.editReply({ content: `${EMOJIS.error} ${err.message || 'Failed to fetch crypto data.'}` });
    }
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const coin = args[0] || 'bitcoin';
    const thinking = await message.reply(`${EMOJIS.info} Fetching crypto data...`);
    try {
      const data = await this.fetchCrypto(coin);
      const market = data.market_data;
      const priceUSD = market.current_price?.usd;
      const embed = new EmbedBuilder()
        .setTitle(`💰 ${data.name} (${data.symbol?.toUpperCase()})`)
        .setColor(market.price_change_percentage_24h >= 0 ? COLORS.success : COLORS.error)
        .setThumbnail(data.image?.small)
        .addFields(
          { name: '💵 Price (USD)', value: priceUSD ? `$${priceUSD.toLocaleString()}` : 'N/A', inline: true },
          { name: '📊 24h Change', value: this.formatChange(market.price_change_percentage_24h), inline: true },
          { name: '🏦 Market Cap', value: market.market_cap?.usd ? `$${market.market_cap.usd.toLocaleString()}` : 'N/A', inline: true },
        )
        .setFooter({ text: 'CoinGecko • Not financial advice' })
        .setTimestamp();
      await thinking.edit({ content: null, embeds: [embed] });
    } catch (err: any) {
      await thinking.edit(`${EMOJIS.error} ${err.message || 'Failed to fetch crypto data.'}`);
    }
  }
}

export default CryptoCommand;
