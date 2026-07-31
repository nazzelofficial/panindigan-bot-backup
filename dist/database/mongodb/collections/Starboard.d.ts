export interface StarboardDocument {
    _id: string;
    guildId: string;
    channelId: string;
    messageId: string;
    originalMessageId: string;
    originalChannelId: string;
    authorId: string;
    starCount: number;
    emoji: string;
    createdAt: Date;
}
export declare const starboardCollectionName = "starboard";
//# sourceMappingURL=Starboard.d.ts.map