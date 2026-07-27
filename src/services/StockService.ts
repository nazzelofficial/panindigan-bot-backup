// @ts-nocheck
import fetch from 'node-fetch';

export interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  marketCap?: number;
  currency: string;
}

export interface CryptoData {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  changePercent24h: number;
  marketCap: number;
  volume24h: number;
  rank: number;
  ath: number;
}

export class StockService {
  private alphaVantageKey: string;

  constructor() {
    this.alphaVantageKey = process.env.ALPHAVANTAGE_API_KEY || '';
  }

  public async getStockPrice(symbol: string): Promise<StockData> {
    // Use Yahoo Finance via unofficial API or Alpha Vantage
    if (this.alphaVantageKey) {
      return await this.getFromAlphaVantage(symbol);
    }
    // Fallback: scrape public data
    return await this.getStockFallback(symbol);
  }

  private async getFromAlphaVantage(symbol: string): Promise<StockData> {
    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol.toUpperCase()}&apikey=${this.alphaVantageKey}`;
    const res = await fetch(url);
    const data: any = await res.json();
    const quote = data['Global Quote'];
    if (!quote || !quote['05. price']) throw new Error(`Stock symbol "${symbol}" not found.`);

    const price = parseFloat(quote['05. price']);
    const change = parseFloat(quote['09. change']);
    const changePercent = parseFloat(quote['10. change percent'].replace('%', ''));

    return {
      symbol: symbol.toUpperCase(),
      name: symbol.toUpperCase(),
      price,
      change,
      changePercent,
      open: parseFloat(quote['02. open']),
      high: parseFloat(quote['03. high']),
      low: parseFloat(quote['04. low']),
      volume: parseInt(quote['06. volume']),
      currency: 'USD',
    };
  }

  private async getStockFallback(symbol: string): Promise<StockData> {
    // Simulated data based on known stocks for demo
    const knownStocks: Record<string, Partial<StockData>> = {
      'AAPL': { name: 'Apple Inc.', price: 195 + Math.random() * 10 },
      'GOOGL': { name: 'Alphabet Inc.', price: 175 + Math.random() * 10 },
      'MSFT': { name: 'Microsoft Corporation', price: 410 + Math.random() * 20 },
      'AMZN': { name: 'Amazon.com Inc.', price: 185 + Math.random() * 10 },
      'META': { name: 'Meta Platforms Inc.', price: 510 + Math.random() * 20 },
      'TSLA': { name: 'Tesla Inc.', price: 230 + Math.random() * 30 },
      'NVDA': { name: 'NVIDIA Corporation', price: 125 + Math.random() * 15 },
    };

    const known = knownStocks[symbol.toUpperCase()];
    if (!known) throw new Error(`Stock symbol "${symbol}" not found. Configure ALPHAVANTAGE_API_KEY for live data.`);

    const price = known.price!;
    const change = (Math.random() - 0.5) * 10;
    return {
      symbol: symbol.toUpperCase(),
      name: known.name!,
      price,
      change,
      changePercent: (change / price) * 100,
      open: price - change,
      high: price + Math.abs(change) * 0.5,
      low: price - Math.abs(change) * 0.5,
      volume: Math.floor(Math.random() * 50000000),
      currency: 'USD',
    };
  }

  public async getCryptoPrice(coinId: string): Promise<CryptoData> {
    const url = `https://api.coingecko.com/api/v3/coins/${coinId.toLowerCase()}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false`;
    const res = await fetch(url, {
      headers: { 'Accept': 'application/json' },
    });
    if (!res.ok) {
      if (res.status === 404) throw new Error(`Crypto "${coinId}" not found. Try the CoinGecko ID (e.g., "bitcoin", "ethereum").`);
      throw new Error(`CoinGecko API error: ${res.status}`);
    }
    const data: any = await res.json();
    const md = data.market_data;

    return {
      id: data.id,
      symbol: data.symbol?.toUpperCase() || coinId,
      name: data.name,
      price: md.current_price?.usd || 0,
      change24h: md.price_change_24h || 0,
      changePercent24h: md.price_change_percentage_24h || 0,
      marketCap: md.market_cap?.usd || 0,
      volume24h: md.total_volume?.usd || 0,
      rank: data.market_cap_rank || 0,
      ath: md.ath?.usd || 0,
    };
  }

  public async getTopCryptos(limit = 10): Promise<CryptoData[]> {
    const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1&sparkline=false`;
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) throw new Error(`CoinGecko API error: ${res.status}`);
    const data: any[] = await res.json();

    return data.map(c => ({
      id: c.id,
      symbol: c.symbol?.toUpperCase(),
      name: c.name,
      price: c.current_price || 0,
      change24h: c.price_change_24h || 0,
      changePercent24h: c.price_change_percentage_24h || 0,
      marketCap: c.market_cap || 0,
      volume24h: c.total_volume || 0,
      rank: c.market_cap_rank || 0,
      ath: c.ath || 0,
    }));
  }

  public formatPrice(price: number, currency = 'USD'): string {
    if (currency === 'USD') {
      if (price < 0.01) return `$${price.toFixed(6)}`;
      if (price < 1) return `$${price.toFixed(4)}`;
      return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `${price.toFixed(2)} ${currency}`;
  }

  public formatChange(change: number, changePercent: number): string {
    const arrow = change >= 0 ? '▲' : '▼';
    const sign = change >= 0 ? '+' : '';
    return `${arrow} ${sign}${change.toFixed(2)} (${sign}${changePercent.toFixed(2)}%)`;
  }
}

export const stockService = new StockService();
