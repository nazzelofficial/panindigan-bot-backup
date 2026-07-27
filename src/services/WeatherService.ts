// @ts-nocheck

export interface WeatherData {
  city: string;
  country: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  description: string;
  icon: string;
  iconUrl: string;
  uvIndex?: number;
  visibility?: number;
  pressure?: number;
  sunrise?: number;
  sunset?: number;
}

export interface ForecastDay {
  date: string;
  high: number;
  low: number;
  description: string;
  icon: string;
  iconUrl: string;
  humidity: number;
  windSpeed: number;
}

const BASE_URL = 'https://api.openweathermap.org/data/2.5';
const GEO_URL = 'https://api.openweathermap.org/geo/1.0';

export class WeatherService {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.WEATHER_API_KEY || '';
  }

  public isConfigured(): boolean {
    return !!this.apiKey;
  }

  public async getCurrentWeather(location: string): Promise<WeatherData> {
    if (!this.apiKey) throw new Error('WEATHER_API_KEY is not configured.');

    const url = `${BASE_URL}/weather?q=${encodeURIComponent(location)}&appid=${this.apiKey}&units=metric`;
    const res = await fetch(url);
    if (!res.ok) {
      if (res.status === 404) throw new Error(`Location "${location}" not found.`);
      throw new Error(`Weather API error: ${res.status}`);
    }
    const data: any = await res.json();

    return {
      city: data.name,
      country: data.sys?.country || '',
      temperature: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      windSpeed: Math.round(data.wind.speed * 3.6), // m/s to km/h
      description: data.weather[0]?.description || '',
      icon: data.weather[0]?.icon || '',
      iconUrl: `https://openweathermap.org/img/wn/${data.weather[0]?.icon}@2x.png`,
      visibility: data.visibility ? Math.round(data.visibility / 1000) : undefined,
      pressure: data.main.pressure,
      sunrise: data.sys?.sunrise,
      sunset: data.sys?.sunset,
    };
  }

  public async getForecast(location: string, days = 7): Promise<ForecastDay[]> {
    if (!this.apiKey) throw new Error('WEATHER_API_KEY is not configured.');

    const url = `${BASE_URL}/forecast?q=${encodeURIComponent(location)}&appid=${this.apiKey}&units=metric&cnt=${days * 8}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Weather API error: ${res.status}`);
    const data: any = await res.json();

    // Group by date
    const byDay: Record<string, any[]> = {};
    for (const item of data.list) {
      const date = item.dt_txt.split(' ')[0];
      if (!byDay[date]) byDay[date] = [];
      byDay[date].push(item);
    }

    return Object.entries(byDay).slice(0, days).map(([date, items]) => {
      const temps = items.map(i => i.main.temp);
      const noon = items.find(i => i.dt_txt.includes('12:00')) || items[0];
      return {
        date,
        high: Math.round(Math.max(...temps)),
        low: Math.round(Math.min(...temps)),
        description: noon.weather[0]?.description || '',
        icon: noon.weather[0]?.icon || '',
        iconUrl: `https://openweathermap.org/img/wn/${noon.weather[0]?.icon}@2x.png`,
        humidity: noon.main.humidity,
        windSpeed: Math.round(noon.wind.speed * 3.6),
      };
    });
  }

  public getWeatherEmoji(description: string): string {
    const lower = description.toLowerCase();
    if (lower.includes('clear') || lower.includes('sunny')) return '☀️';
    if (lower.includes('cloud')) return '☁️';
    if (lower.includes('rain')) return '🌧️';
    if (lower.includes('drizzle')) return '🌦️';
    if (lower.includes('thunder') || lower.includes('storm')) return '⛈️';
    if (lower.includes('snow')) return '❄️';
    if (lower.includes('mist') || lower.includes('fog') || lower.includes('haze')) return '🌫️';
    if (lower.includes('wind')) return '💨';
    return '🌤️';
  }
}

export const weatherService = new WeatherService();
