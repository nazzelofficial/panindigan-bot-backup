// @ts-nocheck
/**
 * ═══════════════════════════════════════════════════
 *  Panindigan Premium Interaction Manager
 *  Professional interaction handling system
 * ═══════════════════════════════════════════════════
 */
import { ComponentType, ActionRowBuilder, ButtonBuilder, StringSelectMenuBuilder, } from 'discord.js';
import { loggers } from '../utils/Logger.js';
// ─── Interaction Manager Class ────────────────────────────────────────────────────
export class InteractionManager {
    buttonHandlers = new Map();
    selectMenuHandlers = new Map();
    modalHandlers = new Map();
    regexButtonHandlers = [];
    regexSelectMenuHandlers = [];
    regexModalHandlers = [];
    // ─── Register Button Handler ─────────────────────────────────────────────────────
    registerButton(handler) {
        if (handler.customId instanceof RegExp) {
            this.regexButtonHandlers.push(handler);
        }
        else {
            this.buttonHandlers.set(handler.customId, handler);
        }
    }
    // ─── Register Select Menu Handler ─────────────────────────────────────────────────
    registerSelectMenu(handler) {
        if (handler.customId instanceof RegExp) {
            this.regexSelectMenuHandlers.push(handler);
        }
        else {
            this.selectMenuHandlers.set(handler.customId, handler);
        }
    }
    // ─── Register Modal Handler ─────────────────────────────────────────────────────
    registerModal(handler) {
        if (handler.customId instanceof RegExp) {
            this.regexModalHandlers.push(handler);
        }
        else {
            this.modalHandlers.set(handler.customId, handler);
        }
    }
    // ─── Handle Interaction ────────────────────────────────────────────────────────
    async handleInteraction(interaction) {
        try {
            if (interaction.isButton()) {
                await this.handleButton(interaction);
            }
            else if (interaction.isStringSelectMenu()) {
                await this.handleSelectMenu(interaction);
            }
            else if (interaction.isModalSubmit()) {
                await this.handleModal(interaction);
            }
        }
        catch (error) {
            loggers.interactions.error('Error handling interaction', {
                type: interaction.type,
                customId: 'customId' in interaction ? interaction.customId : undefined,
                guild: interaction.guildId ?? undefined,
                user: interaction.user?.id,
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined,
            });
            if (interaction.isRepliable() && !interaction.replied) {
                await interaction.reply({
                    content: '❌ An error occurred while handling this interaction.',
                    ephemeral: true,
                });
            }
        }
    }
    // ─── Handle Button Interaction ──────────────────────────────────────────────────
    async handleButton(interaction) {
        const customId = interaction.customId;
        // Check exact match handlers
        const handler = this.buttonHandlers.get(customId);
        if (handler) {
            await handler.handler(interaction);
            return;
        }
        // Check regex handlers
        for (const regexHandler of this.regexButtonHandlers) {
            if (regexHandler.customId.test(customId)) {
                await regexHandler.handler(interaction);
                return;
            }
        }
    }
    // ─── Handle Select Menu Interaction ─────────────────────────────────────────────
    async handleSelectMenu(interaction) {
        const customId = interaction.customId;
        // Check exact match handlers
        const handler = this.selectMenuHandlers.get(customId);
        if (handler) {
            await handler.handler(interaction);
            return;
        }
        // Check regex handlers
        for (const regexHandler of this.regexSelectMenuHandlers) {
            if (regexHandler.customId.test(customId)) {
                await regexHandler.handler(interaction);
                return;
            }
        }
    }
    // ─── Handle Modal Submit Interaction ───────────────────────────────────────────
    async handleModal(interaction) {
        const customId = interaction.customId;
        // Check exact match handlers
        const handler = this.modalHandlers.get(customId);
        if (handler) {
            await handler.handler(interaction);
            return;
        }
        // Check regex handlers
        for (const regexHandler of this.regexModalHandlers) {
            if (regexHandler.customId.test(customId)) {
                await regexHandler.handler(interaction);
                return;
            }
        }
    }
    // ─── Clear All Handlers ───────────────────────────────────────────────────────
    clearAll() {
        this.buttonHandlers.clear();
        this.selectMenuHandlers.clear();
        this.modalHandlers.clear();
        this.regexButtonHandlers = [];
        this.regexSelectMenuHandlers = [];
        this.regexModalHandlers = [];
    }
    // ─── Clear Button Handlers ──────────────────────────────────────────────────────
    clearButtons() {
        this.buttonHandlers.clear();
        this.regexButtonHandlers = [];
    }
    // ─── Clear Select Menu Handlers ─────────────────────────────────────────────────
    clearSelectMenus() {
        this.selectMenuHandlers.clear();
        this.regexSelectMenuHandlers = [];
    }
    // ─── Clear Modal Handlers ───────────────────────────────────────────────────────
    clearModals() {
        this.modalHandlers.clear();
        this.regexModalHandlers = [];
    }
}
// ─── Create Button Collector with Timeout ─────────────────────────────────────────
export async function createButtonCollector(message, userId, timeout = 60000, onCollect, onEnd) {
    const collector = message.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: timeout,
        filter: (i) => i.user.id === userId,
    });
    collector.on('collect', async (i) => {
        await onCollect(i);
    });
    collector.on('end', (_, reason) => {
        if (onEnd)
            onEnd(reason);
        try {
            message.edit({ components: [] }).catch(() => { });
        }
        catch { }
    });
}
// ─── Create Select Menu Collector with Timeout ────────────────────────────────────
export async function createSelectMenuCollector(message, userId, timeout = 60000, onCollect, onEnd) {
    const collector = message.createMessageComponentCollector({
        componentType: ComponentType.StringSelect,
        time: timeout,
        filter: (i) => i.user.id === userId,
    });
    collector.on('collect', async (i) => {
        await onCollect(i);
    });
    collector.on('end', (_, reason) => {
        if (onEnd)
            onEnd(reason);
        try {
            message.edit({ components: [] }).catch(() => { });
        }
        catch { }
    });
}
// ─── Disable All Components in Message ───────────────────────────────────────────
export async function disableComponents(message) {
    try {
        const components = message.components.map(row => {
            const actionRow = new ActionRowBuilder();
            for (const component of row.components) {
                if (component.type === ComponentType.Button) {
                    actionRow.addComponents(ButtonBuilder.from(component.toJSON()).setDisabled(true));
                }
                else if (component.type === ComponentType.StringSelect) {
                    actionRow.addComponents(StringSelectMenuBuilder.from(component.toJSON()).setDisabled(true));
                }
            }
            return actionRow;
        });
        await message.edit({ components });
    }
    catch { }
}
// ─── Enable All Components in Message ────────────────────────────────────────────
export async function enableComponents(message) {
    try {
        const components = message.components.map(row => {
            const actionRow = new ActionRowBuilder();
            for (const component of row.components) {
                if (component.type === ComponentType.Button) {
                    actionRow.addComponents(ButtonBuilder.from(component.toJSON()).setDisabled(false));
                }
                else if (component.type === ComponentType.StringSelect) {
                    actionRow.addComponents(StringSelectMenuBuilder.from(component.toJSON()).setDisabled(false));
                }
            }
            return actionRow;
        });
        await message.edit({ components });
    }
    catch { }
}
// ─── Defer Reply with Loading State ───────────────────────────────────────────────
export async function deferWithLoading(interaction, ephemeral = false) {
    if (interaction.isChatInputCommand() || interaction.isMessageComponent()) {
        await interaction.deferReply({ ephemeral });
    }
}
// ─── Edit Reply with Loading State ────────────────────────────────────────────────
export async function editWithLoading(interaction, message) {
    if (interaction.isChatInputCommand() || interaction.isMessageComponent()) {
        if (interaction.replied || interaction.deferred) {
            await interaction.editReply({ content: `⏳ ${message}` });
        }
        else {
            await interaction.reply({ content: `⏳ ${message}`, ephemeral: true });
        }
    }
}
// ─── Follow Up with Success ────────────────────────────────────────────────────────
export async function followUpSuccess(interaction, message) {
    if (interaction.isChatInputCommand() || interaction.isMessageComponent()) {
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: `✅ ${message}`, ephemeral: true });
        }
        else {
            await interaction.reply({ content: `✅ ${message}`, ephemeral: true });
        }
    }
}
// ─── Follow Up with Error ─────────────────────────────────────────────────────────
export async function followUpError(interaction, message) {
    if (interaction.isChatInputCommand() || interaction.isMessageComponent()) {
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: `❌ ${message}`, ephemeral: true });
        }
        else {
            await interaction.reply({ content: `❌ ${message}`, ephemeral: true });
        }
    }
}
// ─── Export Interaction Manager ────────────────────────────────────────────────────
export const interactionManager = new InteractionManager();
export const InteractionUtils = {
    createButtonCollector,
    createSelectMenuCollector,
    disableComponents,
    enableComponents,
    deferWithLoading,
    editWithLoading,
    followUpSuccess,
    followUpError,
};
//# sourceMappingURL=InteractionManager.js.map