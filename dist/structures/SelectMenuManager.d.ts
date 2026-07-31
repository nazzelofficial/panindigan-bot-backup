/**
 * ═══════════════════════════════════════════════════
 *  Panindigan Premium Select Menu Manager
 *  Professional select menu system with improved UX
 * ═══════════════════════════════════════════════════
 */
import { ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuInteraction, RoleSelectMenuBuilder, UserSelectMenuBuilder, ChannelSelectMenuBuilder, MentionableSelectMenuBuilder, ChannelType } from 'discord.js';
export interface SelectMenuOption {
    label: string;
    value: string;
    description?: string;
    emoji?: string;
    default?: boolean;
}
export declare function stringSelectMenu(customId: string, placeholder: string, options: SelectMenuOption[], config?: {
    minValues?: number;
    maxValues?: number;
    disabled?: boolean;
}): ActionRowBuilder<StringSelectMenuBuilder>;
export declare function roleSelectMenu(customId: string, placeholder: string, config?: {
    minValues?: number;
    maxValues?: number;
    disabled?: boolean;
    defaultRoles?: string[];
}): ActionRowBuilder<RoleSelectMenuBuilder>;
export declare function userSelectMenu(customId: string, placeholder: string, config?: {
    minValues?: number;
    maxValues?: number;
    disabled?: boolean;
    defaultUsers?: string[];
}): ActionRowBuilder<UserSelectMenuBuilder>;
export declare function channelSelectMenu(customId: string, placeholder: string, config?: {
    minValues?: number;
    maxValues?: number;
    disabled?: boolean;
    channelTypes?: ChannelType[];
    defaultChannels?: string[];
}): ActionRowBuilder<ChannelSelectMenuBuilder>;
export declare function mentionableSelectMenu(customId: string, placeholder: string, config?: {
    minValues?: number;
    maxValues?: number;
    disabled?: boolean;
    defaultUsers?: string[];
    defaultRoles?: string[];
}): ActionRowBuilder<MentionableSelectMenuBuilder>;
export declare function categorySelectMenu(customId: string, categories: {
    name: string;
    value: string;
    emoji: string;
    description: string;
}[]): ActionRowBuilder<StringSelectMenuBuilder>;
export declare function musicSourceSelectMenu(customId: string): ActionRowBuilder<StringSelectMenuBuilder>;
export declare function languageSelectMenu(customId: string): ActionRowBuilder<StringSelectMenuBuilder>;
export declare function premiumTierSelectMenu(customId: string): ActionRowBuilder<StringSelectMenuBuilder>;
export declare function timezoneSelectMenu(customId: string): ActionRowBuilder<StringSelectMenuBuilder>;
export declare function queueActionSelectMenu(customId: string): ActionRowBuilder<StringSelectMenuBuilder>;
export declare function moderationActionSelectMenu(customId: string): ActionRowBuilder<StringSelectMenuBuilder>;
export declare function aiModelSelectMenu(customId: string): ActionRowBuilder<StringSelectMenuBuilder>;
export declare function helpCategorySelectMenu(customId: string): ActionRowBuilder<StringSelectMenuBuilder>;
export declare function sortOrderSelectMenu(customId: string): ActionRowBuilder<StringSelectMenuBuilder>;
export declare function paginationSizeSelectMenu(customId: string): ActionRowBuilder<StringSelectMenuBuilder>;
export declare function exportSelectMenu(customId: string): ActionRowBuilder<StringSelectMenuBuilder>;
export declare function customSelectMenu(customId: string, placeholder: string, options: SelectMenuOption[], config?: {
    minValues?: number;
    maxValues?: number;
    disabled?: boolean;
}): ActionRowBuilder<StringSelectMenuBuilder>;
export declare function getSelectedValues(interaction: StringSelectMenuInteraction): string[];
export declare const SelectMenuManager: {
    readonly string: typeof stringSelectMenu;
    readonly role: typeof roleSelectMenu;
    readonly user: typeof userSelectMenu;
    readonly channel: typeof channelSelectMenu;
    readonly mentionable: typeof mentionableSelectMenu;
    readonly category: typeof categorySelectMenu;
    readonly musicSource: typeof musicSourceSelectMenu;
    readonly language: typeof languageSelectMenu;
    readonly premiumTier: typeof premiumTierSelectMenu;
    readonly timezone: typeof timezoneSelectMenu;
    readonly queueAction: typeof queueActionSelectMenu;
    readonly moderationAction: typeof moderationActionSelectMenu;
    readonly aiModel: typeof aiModelSelectMenu;
    readonly helpCategory: typeof helpCategorySelectMenu;
    readonly sortOrder: typeof sortOrderSelectMenu;
    readonly paginationSize: typeof paginationSizeSelectMenu;
    readonly export: typeof exportSelectMenu;
    readonly custom: typeof customSelectMenu;
    readonly getSelectedValues: typeof getSelectedValues;
};
//# sourceMappingURL=SelectMenuManager.d.ts.map