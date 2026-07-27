// @ts-nocheck
import fetch from 'node-fetch';

export interface NewsArticle {
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
  imageUrl?: string;
  author?: string;
}

export class NewsService {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.NEWS_API_KEY || '';
  }

  public isConfigured(): boolean {
    return !!this.apiKey;
  }

  public async getTopHeadlines(country = 'us', category?: string, limit = 5): Promise<NewsArticle[]> {
    if (!this.apiKey) throw new Error('NEWS_API_KEY is not configured.');

    let url = `https://newsapi.org/v2/top-headlines?country=${country}&pageSize=${limit}&apiKey=${this.apiKey}`;
    if (category) url += `&category=${category}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`News API error: ${res.status}`);
    const data: any = await res.json();

    return (data.articles || []).slice(0, limit).map(this.mapArticle);
  }

  public async searchNews(query: string, limit = 5): Promise<NewsArticle[]> {
    if (!this.apiKey) throw new Error('NEWS_API_KEY is not configured.');

    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&sortBy=publishedAt&pageSize=${limit}&language=en&apiKey=${this.apiKey}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`News API error: ${res.status}`);
    const data: any = await res.json();

    return (data.articles || []).slice(0, limit).map(this.mapArticle);
  }

  private mapArticle(article: any): NewsArticle {
    return {
      title: article.title || 'No title',
      description: article.description || 'No description',
      url: article.url || '',
      source: article.source?.name || 'Unknown',
      publishedAt: article.publishedAt || new Date().toISOString(),
      imageUrl: article.urlToImage || undefined,
      author: article.author || undefined,
    };
  }

  public formatTimeAgo(dateStr: string): string {
    const date = new Date(dateStr);
    const diffMs = Date.now() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);

    if (diffMin < 1) return 'just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    return `${diffDay}d ago`;
  }
}

export const newsService = new NewsService();
