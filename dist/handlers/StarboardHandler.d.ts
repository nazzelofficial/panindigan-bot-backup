import { MessageReaction, User } from 'discord.js';
import { PanindiganClient } from '../structures/PanindiganClient.js';
export declare class StarboardHandler {
    private static instance;
    static getInstance(): StarboardHandler;
    handleReactionAdd(reaction: MessageReaction, user: User, client: PanindiganClient): Promise<void>;
    handleReactionRemove(reaction: MessageReaction, user: User, client: PanindiganClient): Promise<void>;
    private postToStarboard;
    private updateStarCount;
    private removeFromStarboard;
    private buildStarboardEmbed;
    getStarboardEntry(messageId: string): Promise<any>;
    getTopStarred(guildId: string, limit?: number): Promise<any[]>;
    getStarboardStats(guildId: string): Promise<{
        totalPosts: number;
        totalStars: number;
        topAuthor: string | null;
    }>;
    resetStarboard(guildId: string): Promise<number>;
    getRandomStarred(guildId: string): Promise<any | null>;
}
export declare const starboardHandler: StarboardHandler;
//# sourceMappingURL=StarboardHandler.d.ts.map