/**
 * ═══════════════════════════════════════════════════
 *  Panindigan Premium Interaction Manager
 *  Professional interaction handling system
 * ═══════════════════════════════════════════════════
 */
import { Message, ChatInputCommandInteraction, MessageComponentInteraction, ModalSubmitInteraction, Interaction } from 'discord.js';
export interface InteractionHandlerOptions {
    timeout?: number;
    ephemeral?: boolean;
    onTimeout?: () => void;
    onError?: (error: Error) => void;
}
export interface ButtonHandler {
    customId: string | RegExp;
    handler: (interaction: MessageComponentInteraction) => Promise<void> | void;
}
export interface SelectMenuHandler {
    customId: string | RegExp;
    handler: (interaction: MessageComponentInteraction) => Promise<void> | void;
}
export interface ModalHandler {
    customId: string | RegExp;
    handler: (interaction: ModalSubmitInteraction) => Promise<void> | void;
}
export declare class InteractionManager {
    private buttonHandlers;
    private selectMenuHandlers;
    private modalHandlers;
    private regexButtonHandlers;
    private regexSelectMenuHandlers;
    private regexModalHandlers;
    registerButton(handler: ButtonHandler): void;
    registerSelectMenu(handler: SelectMenuHandler): void;
    registerModal(handler: ModalHandler): void;
    handleInteraction(interaction: Interaction): Promise<void>;
    private handleButton;
    private handleSelectMenu;
    private handleModal;
    clearAll(): void;
    clearButtons(): void;
    clearSelectMenus(): void;
    clearModals(): void;
}
export declare function createButtonCollector(message: Message, userId: string, timeout: number | undefined, onCollect: (interaction: MessageComponentInteraction) => Promise<void> | void, onEnd?: (reason: string) => void): Promise<void>;
export declare function createSelectMenuCollector(message: Message, userId: string, timeout: number | undefined, onCollect: (interaction: MessageComponentInteraction) => Promise<void> | void, onEnd?: (reason: string) => void): Promise<void>;
export declare function disableComponents(message: Message): Promise<void>;
export declare function enableComponents(message: Message): Promise<void>;
export declare function deferWithLoading(interaction: ChatInputCommandInteraction | MessageComponentInteraction, ephemeral?: boolean): Promise<void>;
export declare function editWithLoading(interaction: ChatInputCommandInteraction | MessageComponentInteraction, message: string): Promise<void>;
export declare function followUpSuccess(interaction: ChatInputCommandInteraction | MessageComponentInteraction, message: string): Promise<void>;
export declare function followUpError(interaction: ChatInputCommandInteraction | MessageComponentInteraction, message: string): Promise<void>;
export declare const interactionManager: InteractionManager;
export declare const InteractionUtils: {
    readonly createButtonCollector: typeof createButtonCollector;
    readonly createSelectMenuCollector: typeof createSelectMenuCollector;
    readonly disableComponents: typeof disableComponents;
    readonly enableComponents: typeof enableComponents;
    readonly deferWithLoading: typeof deferWithLoading;
    readonly editWithLoading: typeof editWithLoading;
    readonly followUpSuccess: typeof followUpSuccess;
    readonly followUpError: typeof followUpError;
};
//# sourceMappingURL=InteractionManager.d.ts.map