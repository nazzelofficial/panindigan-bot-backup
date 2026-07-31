export interface NewsArticle {
    title: string;
    description: string;
    url: string;
    source: string;
    publishedAt: string;
    imageUrl?: string;
    author?: string;
}
export declare class NewsService {
    private apiKey;
    constructor();
    isConfigured(): boolean;
    getTopHeadlines(country?: string, category?: string, limit?: number): Promise<NewsArticle[]>;
    searchNews(query: string, limit?: number): Promise<NewsArticle[]>;
    private mapArticle;
    formatTimeAgo(dateStr: string): string;
}
export declare const newsService: NewsService;
//# sourceMappingURL=NewsService.d.ts.map