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
export declare class WeatherService {
    private apiKey;
    constructor();
    isConfigured(): boolean;
    getCurrentWeather(location: string): Promise<WeatherData>;
    getForecast(location: string, days?: number): Promise<ForecastDay[]>;
    getWeatherEmoji(description: string): string;
}
export declare const weatherService: WeatherService;
//# sourceMappingURL=WeatherService.d.ts.map