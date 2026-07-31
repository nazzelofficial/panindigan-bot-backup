import { ImageGenerator } from '../structures/ImageGenerator.js';
export interface AnimalImageResult {
    url: string;
    source?: string;
}
export declare class ImageService {
    private giphyKey;
    constructor();
    getAnimalImage(animal: string): Promise<AnimalImageResult>;
    getGif(tag: string): Promise<string>;
    generateRankCard(options: Parameters<typeof ImageGenerator.generateRankCard>[0]): Promise<Buffer>;
    generateWelcomeCard(options: Parameters<typeof ImageGenerator.generateWelcomeCard>[0]): Promise<Buffer>;
    generateWantedPoster(username: string, avatarUrl: string): Promise<Buffer>;
    generateCertificate(username: string, title: string, description?: string): Promise<Buffer>;
    generateAIImage(prompt: string, userId: string, guildId: string): Promise<string>;
    getMeme(): Promise<{
        title: string;
        url: string;
        subreddit: string;
        author: string;
        upvotes: number;
    }>;
    applyTextEffect(text: string, effect: string): string;
}
export declare const imageService: ImageService;
//# sourceMappingURL=ImageService.d.ts.map