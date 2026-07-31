/**
 * ═══════════════════════════════════════════════════
 *  Panindigan Premium Component Factory
 *  Centralized component generation system
 * ═══════════════════════════════════════════════════
 */
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, EmbedBuilder } from 'discord.js';
import { SelectMenuOption } from './SelectMenuManager.js';
export declare class ComponentFactory {
    static success(title: string, description?: string): EmbedBuilder;
    static error(title: string, description?: string): EmbedBuilder;
    static warning(title: string, description?: string): EmbedBuilder;
    static info(title: string, description?: string): EmbedBuilder;
    static loading(action: string, description?: string): EmbedBuilder;
    static confirmation(title: string, description: string): EmbedBuilder;
    static music(title: string, description?: string): EmbedBuilder;
    static economy(title: string, description?: string): EmbedBuilder;
    static moderation(title: string, description?: string): EmbedBuilder;
    static ai(title: string, description?: string): EmbedBuilder;
    static premium(title: string, description?: string, tier?: 'free' | 'bronze' | 'silver' | 'gold' | 'diamond'): EmbedBuilder;
    static utility(title: string, description?: string): EmbedBuilder;
    static leveling(title: string, description?: string): EmbedBuilder;
    static queue(title: string, description?: string): EmbedBuilder;
    static dashboard(title: string, description?: string): EmbedBuilder;
    static confirmRow(prefix: string): ActionRowBuilder<ButtonBuilder>;
    static yesNoRow(prefix: string): ActionRowBuilder<ButtonBuilder>;
    static closeRow(prefix: string): ActionRowBuilder<ButtonBuilder>;
    static actionRow(prefix: string, options?: {
        showSave?: boolean;
        showEdit?: boolean;
        showDelete?: boolean;
        showClose?: boolean;
    }): ActionRowBuilder<ButtonBuilder>;
    static navigationRow(prefix: string, currentPage: number, totalPages: number, options?: {
        showFirst?: boolean;
        showLast?: boolean;
        showHome?: boolean;
        showRefresh?: boolean;
        showClose?: boolean;
    }): ActionRowBuilder<ButtonBuilder>;
    static dashboardRow(prefix: string, options?: {
        showSettings?: boolean;
        showStatistics?: boolean;
        showRefresh?: boolean;
        showClose?: boolean;
    }): ActionRowBuilder<ButtonBuilder>;
    static musicControlRow(guildId: string, state: {
        paused: boolean;
        loop: 'none' | 'track' | 'queue';
        shuffle: boolean;
    }): ActionRowBuilder<ButtonBuilder>;
    static musicSecondaryRow(guildId: string, state: {
        shuffle: boolean;
        volume: number;
    }): ActionRowBuilder<ButtonBuilder>;
    static musicFilterRow(guildId: string): ActionRowBuilder<ButtonBuilder>;
    static categorySelect(customId: string, categories: {
        name: string;
        value: string;
        emoji: string;
        description: string;
    }[]): ActionRowBuilder<StringSelectMenuBuilder>;
    static musicSourceSelect(customId: string): ActionRowBuilder<StringSelectMenuBuilder>;
    static languageSelect(customId: string): ActionRowBuilder<StringSelectMenuBuilder>;
    static premiumTierSelect(customId: string): ActionRowBuilder<StringSelectMenuBuilder>;
    static timezoneSelect(customId: string): ActionRowBuilder<StringSelectMenuBuilder>;
    static helpCategorySelect(customId: string): ActionRowBuilder<StringSelectMenuBuilder>;
    static moderationActionSelect(customId: string): ActionRowBuilder<StringSelectMenuBuilder>;
    static aiModelSelect(customId: string): ActionRowBuilder<StringSelectMenuBuilder>;
    static customSelect(customId: string, placeholder: string, options: SelectMenuOption[], config?: {
        minValues?: number;
        maxValues?: number;
        disabled?: boolean;
    }): ActionRowBuilder<StringSelectMenuBuilder>;
    static aiPromptModal(customId: string, prompt?: string): import("discord.js").ModalBuilder;
    static translateModal(customId: string): import("discord.js").ModalBuilder;
    static rewriteModal(customId: string, text?: string): import("discord.js").ModalBuilder;
    static summarizeModal(customId: string, text?: string): import("discord.js").ModalBuilder;
    static announcementModal(customId: string): import("discord.js").ModalBuilder;
    static warnModal(customId: string, reason?: string): import("discord.js").ModalBuilder;
    static banModal(customId: string, reason?: string, deleteDays?: string): import("discord.js").ModalBuilder;
    static timeoutModal(customId: string, reason?: string, duration?: string): import("discord.js").ModalBuilder;
    static nicknameModal(customId: string, currentNickname?: string): import("discord.js").ModalBuilder;
    static musicSearchModal(customId: string, query?: string): import("discord.js").ModalBuilder;
    static volumeModal(customId: string, currentVolume?: number): import("discord.js").ModalBuilder;
    static reminderModal(customId: string): import("discord.js").ModalBuilder;
    static pollModal(customId: string): import("discord.js").ModalBuilder;
    static ticketReasonModal(customId: string): import("discord.js").ModalBuilder;
    static welcomeMessageModal(customId: string, currentMessage?: string): import("discord.js").ModalBuilder;
    static goodbyeMessageModal(customId: string, currentMessage?: string): import("discord.js").ModalBuilder;
    static premiumSetupModal(customId: string): import("discord.js").ModalBuilder;
    static serverConfigModal(customId: string): import("discord.js").ModalBuilder;
    static successWithAction(title: string, description: string, actionLabel: string, actionCustomId: string): {
        embed: EmbedBuilder;
        components: ActionRowBuilder<ButtonBuilder>[];
    };
    static errorWithRetry(title: string, description: string, retryCustomId: string): {
        embed: EmbedBuilder;
        components: ActionRowBuilder<ButtonBuilder>[];
    };
    static confirmationWithButtons(title: string, description: string, confirmCustomId: string, cancelCustomId: string): {
        embed: EmbedBuilder;
        components: ActionRowBuilder<ButtonBuilder>[];
    };
    static loadingWithCancel(action: string, description: string, cancelCustomId: string): {
        embed: EmbedBuilder;
        components: ActionRowBuilder<ButtonBuilder>[];
    };
    static dashboardResponse(title: string, sections: {
        name: string;
        value: string;
        inline?: boolean;
    }[], prefix: string, options?: {
        thumbnail?: string;
        image?: string;
        showSettings?: boolean;
        showStatistics?: boolean;
        showRefresh?: boolean;
        showClose?: boolean;
    }): {
        embed: EmbedBuilder;
        components: ActionRowBuilder<ButtonBuilder>[];
    };
    static musicPlayerResponse(title: string, description: string, guildId: string, state: {
        paused: boolean;
        loop: 'none' | 'track' | 'queue';
        shuffle: boolean;
        volume: number;
    }, thumbnail?: string): {
        embed: EmbedBuilder;
        components: ActionRowBuilder<ButtonBuilder>[];
    };
    static queueResponse(title: string, description: string, guildId: string, state: {
        shuffle: boolean;
        volume: number;
    }): {
        embed: EmbedBuilder;
        components: ActionRowBuilder<ButtonBuilder>[];
    };
    static singleButton(customId: string, label?: string, emoji?: string, style?: ButtonStyle, disabled?: boolean): ButtonBuilder;
    static linkButton(label: string, url: string, emoji?: string): ButtonBuilder;
    static premiumButton(customId: string, label?: string): ButtonBuilder;
    static favoriteButton(customId: string, isFavorite: boolean): ButtonBuilder;
}
export default ComponentFactory;
//# sourceMappingURL=ComponentFactory.d.ts.map