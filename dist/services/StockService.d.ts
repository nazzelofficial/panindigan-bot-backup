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
export declare class StockService {
    private alphaVantageKey;
    constructor();
    getStockPrice(symbol: string): Promise<StockData>;
    private getFromAlphaVantage;
    private getStockFallback;
    getCryptoPrice(coinId: string): Promise<CryptoData>;
    getTopCryptos(limit?: number): Promise<CryptoData[]>;
    formatPrice(price: number, currency?: string): string;
    formatChange(change: number, changePercent: number): string;
}
export declare const stockService: StockService;
//# sourceMappingURL=StockService.d.ts.map