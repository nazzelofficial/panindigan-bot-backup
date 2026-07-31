/**
 * ═══════════════════════════════════════════════════
 *  Panindigan Premium Pagination Manager
 *  Unified pagination system with consistent UX
 * ═══════════════════════════════════════════════════
 */
import { EmbedBuilder, Message, ChatInputCommandInteraction } from 'discord.js';
export interface PaginationOptions {
    timeout?: number;
    ephemeral?: boolean;
    editReply?: boolean;
    showFirst?: boolean;
    showLast?: boolean;
    showHome?: boolean;
    showRefresh?: boolean;
    showClose?: boolean;
    onFirst?: () => void;
    onLast?: () => void;
    onHome?: () => void;
    onRefresh?: () => void;
    onClose?: () => void;
}
export interface PaginationState {
    currentPage: number;
    totalPages: number;
    prefix: string;
}
export declare function sendPaginatedResponse(source: Message | ChatInputCommandInteraction, pages: EmbedBuilder[], prefix: string, options?: PaginationOptions): Promise<Message | null>;
export declare function sendDynamicPagination(source: Message | ChatInputCommandInteraction, pageGenerator: (page: number) => EmbedBuilder, totalPages: number, prefix: string, options?: PaginationOptions): Promise<Message | null>;
export declare function simplePagination(source: Message | ChatInputCommandInteraction, pages: EmbedBuilder[], prefix: string): Promise<Message | null>;
export declare function extendedPagination(source: Message | ChatInputCommandInteraction, pages: EmbedBuilder[], prefix: string): Promise<Message | null>;
export declare const PaginationManager: {
    readonly send: typeof sendPaginatedResponse;
    readonly sendDynamic: typeof sendDynamicPagination;
    readonly simple: typeof simplePagination;
    readonly extended: typeof extendedPagination;
};
//# sourceMappingURL=PaginationManager.d.ts.map