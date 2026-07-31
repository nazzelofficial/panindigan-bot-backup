import { EmbedBuilder } from 'discord.js';
export declare class EmbedTemplates {
    static success(title: string, description?: string): EmbedBuilder;
    static error(title: string, description?: string): EmbedBuilder;
    static warning(title: string, description?: string): EmbedBuilder;
    static info(title: string, description?: string): EmbedBuilder;
    static premium(tier: string): EmbedBuilder;
    static modAction(action: string, target: {
        tag: string;
        id: string;
    }, moderator: {
        tag: string;
        id: string;
    }, reason: string, caseId?: number): EmbedBuilder;
    static economy(title: string, description?: string, amount?: bigint | number, symbol?: string): EmbedBuilder;
    static music(title: string, description?: string): EmbedBuilder;
    static loading(title: string, description?: string): EmbedBuilder;
    static custom(color: number, title: string, description?: string): EmbedBuilder;
}
//# sourceMappingURL=EmbedTemplates.d.ts.map