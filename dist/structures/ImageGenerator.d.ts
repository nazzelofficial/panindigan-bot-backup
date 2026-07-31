export interface RankCardOptions {
    username: string;
    avatar: string;
    level: number;
    xp: number;
    maxXp: number;
    rank: number;
    totalXp?: number;
    color?: string;
    backgroundUrl?: string;
}
export interface WelcomeCardOptions {
    username: string;
    avatar: string;
    guildName: string;
    memberCount: number;
    backgroundUrl?: string;
}
export declare class ImageGenerator {
    private static fetchImage;
    private static roundRect;
    static generateRankCard(options: RankCardOptions): Promise<Buffer>;
    static generateWelcomeCard(options: WelcomeCardOptions): Promise<Buffer>;
    static generateWantedPoster(username: string, avatarUrl: string): Promise<Buffer>;
    static generateCertificate(username: string, title: string, description?: string): Promise<Buffer>;
}
//# sourceMappingURL=ImageGenerator.d.ts.map