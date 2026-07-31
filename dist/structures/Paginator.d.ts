import { EmbedBuilder, ChatInputCommandInteraction, Message, TextChannel } from 'discord.js';
export interface PaginatorOptions {
    timeout?: number;
    showPageNumbers?: boolean;
    allowAllUsers?: boolean;
    ephemeral?: boolean;
}
export declare class Paginator {
    private pages;
    private currentPage;
    private timeout;
    private showPageNumbers;
    private allowAllUsers;
    private ephemeral;
    constructor(pages: EmbedBuilder[], options?: PaginatorOptions);
    private buildRow;
    private getCurrentEmbed;
    send(target: ChatInputCommandInteraction | Message | TextChannel, authorId?: string): Promise<void>;
    static chunk<T>(array: T[], size: number): T[][];
    static fromStrings(items: string[], title: string, color?: number, perPage?: number): Paginator;
}
//# sourceMappingURL=Paginator.d.ts.map