import { ActionRowBuilder, ButtonBuilder, StringSelectMenuBuilder } from 'discord.js';
export declare class ComponentBuilder {
    static confirmRow(confirmId: string, cancelId: string, confirmLabel?: string, cancelLabel?: string): ActionRowBuilder<ButtonBuilder>;
    static yesNoRow(yesId: string, noId: string): ActionRowBuilder<ButtonBuilder>;
    /** Single button that a user presses to dismiss/delete an ephemeral-style response. */
    static dismissRow(id: string, label?: string): ActionRowBuilder<ButtonBuilder>;
    static closeRow(id: string, label?: string): ActionRowBuilder<ButtonBuilder>;
    /** Single external-link button. */
    static linkRow(label: string, url: string, emoji?: string): ActionRowBuilder<ButtonBuilder>;
    /** Error recovery row — links to support server and optionally invite. */
    static errorActionRow(supportUrl?: string, inviteUrl?: string): ActionRowBuilder<ButtonBuilder>;
    static paginationRow(prevId: string, nextId: string, current: number, total: number, disabled?: boolean): ActionRowBuilder<ButtonBuilder>;
    static fullPaginationRow(firstId: string, prevId: string, nextId: string, lastId: string, current: number, total: number, disabled?: boolean): ActionRowBuilder<ButtonBuilder>;
    static musicControlRow(guildId: string, paused?: boolean, loop?: 'none' | 'track' | 'queue'): ActionRowBuilder<ButtonBuilder>;
    static musicVolumeRow(guildId: string): ActionRowBuilder<ButtonBuilder>;
    static selectMenu(customId: string, placeholder: string, options: {
        label: string;
        value: string;
        description?: string;
        emoji?: string;
        default?: boolean;
    }[], minValues?: number, maxValues?: number): ActionRowBuilder<StringSelectMenuBuilder>;
    static disabledRow(row: ActionRowBuilder<ButtonBuilder>): ActionRowBuilder<ButtonBuilder>;
}
//# sourceMappingURL=ComponentBuilder.d.ts.map