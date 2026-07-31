export interface TagDocument {
    _id: string;
    guildId: string;
    name: string;
    content: string;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
    uses: number;
}
export declare const tagsCollectionName = "server_tags";
//# sourceMappingURL=Tags.d.ts.map