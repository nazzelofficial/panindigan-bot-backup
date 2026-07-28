// @ts-nocheck
const BASE_URL = 'https://api.openweathermap.org/data/2.5';
const GEO_URL = 'https://api.openweathermap.org/geo/1.0';
export class WeatherService {
    apiKey;
    constructor() {
        this.apiKey = process.env.WEATHER_API_KEY || '';
    }
    isConfigured() {
        return !!this.apiKey;
    }
    async getCurrentWeather(location) {
        if (!this.apiKey)
            throw new Error('WEATHER_API_KEY is not configured.');
        const url = `${BASE_URL}/weather?q=${encodeURIComponent(location)}&appid=${this.apiKey}&units=metric`;
        const res = await fetch(url);
        if (!res.ok) {
            if (res.status === 404)
                throw new Error(`Location "${location}" not found.`);
            throw new Error(`Weather API error: ${res.status}`);
        }
        const data = await res.json();
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
    async getForecast(location, days = 7) {
        if (!this.apiKey)
            throw new Error('WEATHER_API_KEY is not configured.');
        const url = `${BASE_URL}/forecast?q=${encodeURIComponent(location)}&appid=${this.apiKey}&units=metric&cnt=${days * 8}`;
        const res = await fetch(url);
        if (!res.ok)
            throw new Error(`Weather API error: ${res.status}`);
        const data = await res.json();
        // Group by date
        const byDay = {};
        for (const item of data.list) {
            const date = item.dt_txt.split(' ')[0];
            if (!byDay[date])
                byDay[date] = [];
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
    getWeatherEmoji(description) {
        const lower = description.toLowerCase();
        if (lower.includes('clear') || lower.includes('sunny'))
            return '☀️';
        if (lower.includes('cloud'))
            return '☁️';
        if (lower.includes('rain'))
            return '🌧️';
        if (lower.includes('drizzle'))
            return '🌦️';
        if (lower.includes('thunder') || lower.includes('storm'))
            return '⛈️';
        if (lower.includes('snow'))
            return '❄️';
        if (lower.includes('mist') || lower.includes('fog') || lower.includes('haze'))
            return '🌫️';
        if (lower.includes('wind'))
            return '💨';
        return '🌤️';
    }
}
export const weatherService = new WeatherService();
