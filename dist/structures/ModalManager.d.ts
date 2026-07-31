/**
 * ═══════════════════════════════════════════════════
 *  Panindigan Premium Modal Manager
 *  Professional modal system for user input
 * ═══════════════════════════════════════════════════
 */
import { ModalBuilder, TextInputStyle } from 'discord.js';
export interface ModalInput {
    customId: string;
    label: string;
    placeholder?: string;
    style?: TextInputStyle;
    value?: string;
    required?: boolean;
    minLength?: number;
    maxLength?: number;
}
export declare function aiPromptModal(customId: string, prompt?: string): ModalBuilder;
export declare function translateModal(customId: string): ModalBuilder;
export declare function rewriteModal(customId: string, text?: string): ModalBuilder;
export declare function summarizeModal(customId: string, text?: string): ModalBuilder;
export declare function announcementModal(customId: string): ModalBuilder;
export declare function warnModal(customId: string, reason?: string): ModalBuilder;
export declare function banModal(customId: string, reason?: string, deleteDays?: string): ModalBuilder;
export declare function timeoutModal(customId: string, reason?: string, duration?: string): ModalBuilder;
export declare function nicknameModal(customId: string, currentNickname?: string): ModalBuilder;
export declare function embedBuilderModal(customId: string): ModalBuilder;
export declare function musicSearchModal(customId: string, query?: string): ModalBuilder;
export declare function playlistUrlModal(customId: string): ModalBuilder;
export declare function seekModal(customId: string): ModalBuilder;
export declare function jumpModal(customId: string): ModalBuilder;
export declare function volumeModal(customId: string, currentVolume?: number): ModalBuilder;
export declare function reminderModal(customId: string): ModalBuilder;
export declare function pollModal(customId: string): ModalBuilder;
export declare function suggestionModal(customId: string): ModalBuilder;
export declare function ticketReasonModal(customId: string): ModalBuilder;
export declare function welcomeMessageModal(customId: string, currentMessage?: string): ModalBuilder;
export declare function goodbyeMessageModal(customId: string, currentMessage?: string): ModalBuilder;
export declare function verificationModal(customId: string): ModalBuilder;
export declare function reactionRoleModal(customId: string): ModalBuilder;
export declare function premiumSetupModal(customId: string): ModalBuilder;
export declare function webhookMessageModal(customId: string): ModalBuilder;
export declare function autoRoleModal(customId: string): ModalBuilder;
export declare function loggingModal(customId: string): ModalBuilder;
export declare function serverConfigModal(customId: string): ModalBuilder;
export declare function customModal(customId: string, title: string, inputs: ModalInput[]): ModalBuilder;
export declare const ModalManager: {
    readonly aiPrompt: typeof aiPromptModal;
    readonly translate: typeof translateModal;
    readonly rewrite: typeof rewriteModal;
    readonly summarize: typeof summarizeModal;
    readonly announcement: typeof announcementModal;
    readonly warn: typeof warnModal;
    readonly ban: typeof banModal;
    readonly timeout: typeof timeoutModal;
    readonly nickname: typeof nicknameModal;
    readonly embedBuilder: typeof embedBuilderModal;
    readonly musicSearch: typeof musicSearchModal;
    readonly playlistUrl: typeof playlistUrlModal;
    readonly seek: typeof seekModal;
    readonly jump: typeof jumpModal;
    readonly volume: typeof volumeModal;
    readonly reminder: typeof reminderModal;
    readonly poll: typeof pollModal;
    readonly suggestion: typeof suggestionModal;
    readonly ticketReason: typeof ticketReasonModal;
    readonly welcomeMessage: typeof welcomeMessageModal;
    readonly goodbyeMessage: typeof goodbyeMessageModal;
    readonly verification: typeof verificationModal;
    readonly reactionRole: typeof reactionRoleModal;
    readonly premiumSetup: typeof premiumSetupModal;
    readonly webhookMessage: typeof webhookMessageModal;
    readonly autoRole: typeof autoRoleModal;
    readonly logging: typeof loggingModal;
    readonly serverConfig: typeof serverConfigModal;
    readonly custom: typeof customModal;
};
//# sourceMappingURL=ModalManager.d.ts.map