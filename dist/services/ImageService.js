// @ts-nocheck
import { ImageGenerator } from '../structures/ImageGenerator.js';
import { aiEngine } from '../structures/AIEngine.js';
const ANIMAL_APIS = {
    cat: 'https://api.thecatapi.com/v1/images/search',
    dog: 'https://dog.ceo/api/breeds/image/random',
    fox: 'https://randomfox.ca/floof/',
    duck: 'https://random-d.uk/api/random',
    panda: 'https://some-random-api.com/animal/panda',
    shiba: 'https://shibe.online/api/shibes',
    koala: 'https://some-random-api.com/animal/koala',
    bird: 'https://some-random-api.com/animal/birb',
    otter: 'https://otter.brander.com.ua/random',
    bunny: 'https://api.bunnies.io/v2/loop/random/?media=gif,png',
};
const GIPHY_BASE = 'https://api.giphy.com/v1/gifs/random';
export class ImageService {
    giphyKey;
    constructor() {
        this.giphyKey = process.env.GIPHY_API_KEY || '';
    }
    async getAnimalImage(animal) {
        const apiUrl = ANIMAL_APIS[animal.toLowerCase()];
        if (!apiUrl)
            throw new Error(`Unknown animal: ${animal}`);
        const res = await fetch(apiUrl, { headers: { 'Accept': 'application/json' } });
        if (!res.ok)
            throw new Error(`Failed to fetch ${animal} image.`);
        const data = await res.json();
        // Different APIs return differently structured data
        let url = '';
        if (animal === 'cat')
            url = data[0]?.url;
        else if (animal === 'dog')
            url = data.message;
        else if (animal === 'fox')
            url = data.image;
        else if (animal === 'duck')
            url = data.url;
        else if (animal === 'shiba')
            url = data[0];
        else if (animal === 'bunny')
            url = data.media?.gif?.url || data.media?.png?.url;
        else
            url = data.link || data.image || data.url;
        if (!url)
            throw new Error(`No image found for ${animal}.`);
        return { url };
    }
    async getGif(tag) {
        // Try Giphy if key is available
        if (this.giphyKey) {
            try {
                const res = await fetch(`${GIPHY_BASE}?api_key=${this.giphyKey}&tag=${encodeURIComponent(tag)}&rating=pg-13`);
                if (res.ok) {
                    const data = await res.json();
                    const url = data.data?.images?.original?.url || '';
                    if (url)
                        return url;
                }
            }
            catch { /* fall through to nekos.best */ }
        }
        // Fallback: nekos.best GIF API (free, no key required)
        // Maps generic tags to supported nekos.best endpoints
        const nekoEndpointMap = {
            hug: 'hug', pat: 'pat', kiss: 'kiss', slap: 'slap', wave: 'wave',
            cry: 'cry', punch: 'punch', poke: 'poke', cuddle: 'cuddle',
            dance: 'dance', laugh: 'laugh', bite: 'bite', blush: 'blush',
            boop: 'boop', highfive: 'highfive', lick: 'lick', stare: 'stare',
            nom: 'nom', smile: 'smile', celebrate: 'celebrate',
        };
        const endpoint = nekoEndpointMap[tag.toLowerCase()] || 'nod';
        try {
            const res = await fetch(`https://nekos.best/api/v2/${endpoint}`);
            if (res.ok) {
                const data = await res.json();
                const url = data.results?.[0]?.url || '';
                if (url)
                    return url;
            }
        }
        catch { /* fall through */ }
        // Final fallback: tenorapi search via public endpoint
        throw new Error(`No GIF found for tag: ${tag}. Please set GIPHY_API_KEY for full GIF support.`);
    }
    async generateRankCard(options) {
        return await ImageGenerator.generateRankCard(options);
    }
    async generateWelcomeCard(options) {
        return await ImageGenerator.generateWelcomeCard(options);
    }
    async generateWantedPoster(username, avatarUrl) {
        return await ImageGenerator.generateWantedPoster(username, avatarUrl);
    }
    async generateCertificate(username, title, description) {
        return await ImageGenerator.generateCertificate(username, title, description);
    }
    async generateAIImage(prompt, userId, guildId) {
        const result = await aiEngine.generateImage(prompt, { size: '1024x1024', quality: 'standard' });
        if (!result.imageUrl)
            throw new Error('No image URL returned from AI.');
        return result.imageUrl;
    }
    async getMeme() {
        const subreddits = ['memes', 'dankmemes', 'me_irl', 'funny', 'AdviceAnimals'];
        const sub = subreddits[Math.floor(Math.random() * subreddits.length)];
        const res = await fetch(`https://www.reddit.com/r/${sub}/random.json?limit=1`, {
            headers: { 'User-Agent': 'Panindigan-Bot/0.1' },
        });
        if (!res.ok)
            throw new Error('Failed to fetch meme from Reddit.');
        const data = await res.json();
        const post = Array.isArray(data) ? data[0]?.data?.children?.[0]?.data : data?.data?.children?.[0]?.data;
        if (!post || post.is_video || !post.url?.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
            return this.getMeme(); // retry
        }
        return {
            title: post.title,
            url: post.url,
            subreddit: post.subreddit,
            author: post.author,
            upvotes: post.ups,
        };
    }
    applyTextEffect(text, effect) {
        switch (effect) {
            case 'mock': return text.split('').map((c, i) => i % 2 === 0 ? c.toLowerCase() : c.toUpperCase()).join('');
            case 'uwu': return text.replace(/r|l/g, 'w').replace(/R|L/g, 'W').replace(/n([aeiou])/g, 'ny$1').replace(/N([AEIOU])/g, 'Ny$1').replace(/ove/g, 'uv');
            case 'reverse': return text.split('').reverse().join('');
            case 'zalgo': {
                const combining = ['̈', '̄', '̀', '́', '̃', '̂', '̌'];
                return text.split('').map(c => c + combining[Math.floor(Math.random() * combining.length)].repeat(Math.floor(Math.random() * 3))).join('');
            }
            case 'clap': return text.split(' ').join(' 👏 ');
            case 'vaporwave': return text.split('').map(c => c === ' ' ? '　' : String.fromCharCode(c.charCodeAt(0) + (c.charCodeAt(0) >= 33 && c.charCodeAt(0) <= 126 ? 65248 : 0))).join('');
            case 'emojify': {
                const map = { a: '🅰️', b: '🅱️', c: '🆒', d: '📪', e: '📧', f: '🎏', g: '⛽', h: '♓', i: 'ℹ️', j: '🎷', k: '🎋', l: '🕒', m: '〽️', n: '📉', o: '🅾️', p: '🅿️', q: '🎯', r: '®️', s: '💲', t: '✝️', u: '⛎', v: '✅', w: '〰️', x: '❌', y: '💛', z: '💤' };
                return text.toLowerCase().split('').map(c => map[c] || c).join('');
            }
            default: return text;
        }
    }
}
export const imageService = new ImageService();
