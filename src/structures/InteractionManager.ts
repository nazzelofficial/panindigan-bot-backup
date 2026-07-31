// @ts-nocheck
/**
 * ═══════════════════════════════════════════════════
 *  Panindigan Premium Interaction Manager
 *  Professional interaction handling system
 * ═══════════════════════════════════════════════════
 */

import {
  Message,
  ChatInputCommandInteraction,
  MessageComponentInteraction,
  ModalSubmitInteraction,
  Interaction,
  ComponentType,
  ActionRowBuilder,
  ButtonBuilder,
  StringSelectMenuBuilder,
} from 'discord.js';
import { loggers } from '../utils/Logger.js';

// ─── Interaction Handler Options ───────────────────────────────────────────────────
export interface InteractionHandlerOptions {
  timeout?: number;
  ephemeral?: boolean;
  onTimeout?: () => void;
  onError?: (error: Error) => void;
}

// ─── Button Handler Interface ──────────────────────────────────────────────────────
export interface ButtonHandler {
  customId: string | RegExp;
  handler: (interaction: MessageComponentInteraction) => Promise<void> | void;
}

// ─── Select Menu Handler Interface ────────────────────────────────────────────────
export interface SelectMenuHandler {
  customId: string | RegExp;
  handler: (interaction: MessageComponentInteraction) => Promise<void> | void;
}

// ─── Modal Handler Interface ───────────────────────────────────────────────────────
export interface ModalHandler {
  customId: string | RegExp;
  handler: (interaction: ModalSubmitInteraction) => Promise<void> | void;
}

// ─── Interaction Manager Class ────────────────────────────────────────────────────
export class InteractionManager {
  private buttonHandlers: Map<string, ButtonHandler> = new Map();
  private selectMenuHandlers: Map<string, SelectMenuHandler> = new Map();
  private modalHandlers: Map<string, ModalHandler> = new Map();
  private regexButtonHandlers: ButtonHandler[] = [];
  private regexSelectMenuHandlers: SelectMenuHandler[] = [];
  private regexModalHandlers: ModalHandler[] = [];

  // ─── Register Button Handler ─────────────────────────────────────────────────────
  public registerButton(handler: ButtonHandler): void {
    if (handler.customId instanceof RegExp) {
      this.regexButtonHandlers.push(handler);
    } else {
      this.buttonHandlers.set(handler.customId, handler);
    }
  }

  // ─── Register Select Menu Handler ─────────────────────────────────────────────────
  public registerSelectMenu(handler: SelectMenuHandler): void {
    if (handler.customId instanceof RegExp) {
      this.regexSelectMenuHandlers.push(handler);
    } else {
      this.selectMenuHandlers.set(handler.customId, handler);
    }
  }

  // ─── Register Modal Handler ─────────────────────────────────────────────────────
  public registerModal(handler: ModalHandler): void {
    if (handler.customId instanceof RegExp) {
      this.regexModalHandlers.push(handler);
    } else {
      this.modalHandlers.set(handler.customId, handler);
    }
  }

  // ─── Handle Interaction ────────────────────────────────────────────────────────
  public async handleInteraction(interaction: Interaction): Promise<void> {
    try {
      if (interaction.isButton()) {
        await this.handleButton(interaction);
      } else if (interaction.isStringSelectMenu()) {
        await this.handleSelectMenu(interaction);
      } else if (interaction.isModalSubmit()) {
        await this.handleModal(interaction);
      }
    } catch (error) {
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
  private async handleButton(interaction: MessageComponentInteraction): Promise<void> {
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
  private async handleSelectMenu(interaction: MessageComponentInteraction): Promise<void> {
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
  private async handleModal(interaction: ModalSubmitInteraction): Promise<void> {
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
  public clearAll(): void {
    this.buttonHandlers.clear();
    this.selectMenuHandlers.clear();
    this.modalHandlers.clear();
    this.regexButtonHandlers = [];
    this.regexSelectMenuHandlers = [];
    this.regexModalHandlers = [];
  }

  // ─── Clear Button Handlers ──────────────────────────────────────────────────────
  public clearButtons(): void {
    this.buttonHandlers.clear();
    this.regexButtonHandlers = [];
  }

  // ─── Clear Select Menu Handlers ─────────────────────────────────────────────────
  public clearSelectMenus(): void {
    this.selectMenuHandlers.clear();
    this.regexSelectMenuHandlers = [];
  }

  // ─── Clear Modal Handlers ───────────────────────────────────────────────────────
  public clearModals(): void {
    this.modalHandlers.clear();
    this.regexModalHandlers = [];
  }
}

// ─── Create Button Collector with Timeout ─────────────────────────────────────────
export async function createButtonCollector(
  message: Message,
  userId: string,
  timeout: number = 60000,
  onCollect: (interaction: MessageComponentInteraction) => Promise<void> | void,
  onEnd?: (reason: string) => void
): Promise<void> {
  const collector = message.createMessageComponentCollector({
    componentType: ComponentType.Button,
    time: timeout,
    filter: (i) => i.user.id === userId,
  });

  collector.on('collect', async (i: MessageComponentInteraction) => {
    await onCollect(i);
  });

  collector.on('end', (_, reason) => {
    if (onEnd) onEnd(reason);
    try {
      message.edit({ components: [] }).catch(() => {});
    } catch {}
  });
}

// ─── Create Select Menu Collector with Timeout ────────────────────────────────────
export async function createSelectMenuCollector(
  message: Message,
  userId: string,
  timeout: number = 60000,
  onCollect: (interaction: MessageComponentInteraction) => Promise<void> | void,
  onEnd?: (reason: string) => void
): Promise<void> {
  const collector = message.createMessageComponentCollector({
    componentType: ComponentType.StringSelect,
    time: timeout,
    filter: (i) => i.user.id === userId,
  });

  collector.on('collect', async (i: MessageComponentInteraction) => {
    await onCollect(i);
  });

  collector.on('end', (_, reason) => {
    if (onEnd) onEnd(reason);
    try {
      message.edit({ components: [] }).catch(() => {});
    } catch {}
  });
}

// ─── Disable All Components in Message ───────────────────────────────────────────
export async function disableComponents(message: Message): Promise<void> {
  try {
    const components = message.components.map(row => {
      const actionRow = new ActionRowBuilder<any>();
      for (const component of row.components) {
        if (component.type === ComponentType.Button) {
          actionRow.addComponents(
            ButtonBuilder.from(component.toJSON()).setDisabled(true)
          );
        } else if (component.type === ComponentType.StringSelect) {
          actionRow.addComponents(
            StringSelectMenuBuilder.from(component.toJSON()).setDisabled(true)
          );
        }
      }
      return actionRow;
    });

    await message.edit({ components });
  } catch {}
}

// ─── Enable All Components in Message ────────────────────────────────────────────
export async function enableComponents(message: Message): Promise<void> {
  try {
    const components = message.components.map(row => {
      const actionRow = new ActionRowBuilder<any>();
      for (const component of row.components) {
        if (component.type === ComponentType.Button) {
          actionRow.addComponents(
            ButtonBuilder.from(component.toJSON()).setDisabled(false)
          );
        } else if (component.type === ComponentType.StringSelect) {
          actionRow.addComponents(
            StringSelectMenuBuilder.from(component.toJSON()).setDisabled(false)
          );
        }
      }
      return actionRow;
    });

    await message.edit({ components });
  } catch {}
}

// ─── Defer Reply with Loading State ───────────────────────────────────────────────
export async function deferWithLoading(
  interaction: ChatInputCommandInteraction | MessageComponentInteraction,
  ephemeral: boolean = false
): Promise<void> {
  if (interaction.isChatInputCommand() || interaction.isMessageComponent()) {
    await interaction.deferReply({ ephemeral });
  }
}

// ─── Edit Reply with Loading State ────────────────────────────────────────────────
export async function editWithLoading(
  interaction: ChatInputCommandInteraction | MessageComponentInteraction,
  message: string
): Promise<void> {
  if (interaction.isChatInputCommand() || interaction.isMessageComponent()) {
    if (interaction.replied || interaction.deferred) {
      await interaction.editReply({ content: `⏳ ${message}` });
    } else {
      await interaction.reply({ content: `⏳ ${message}`, ephemeral: true });
    }
  }
}

// ─── Follow Up with Success ────────────────────────────────────────────────────────
export async function followUpSuccess(
  interaction: ChatInputCommandInteraction | MessageComponentInteraction,
  message: string
): Promise<void> {
  if (interaction.isChatInputCommand() || interaction.isMessageComponent()) {
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: `✅ ${message}`, ephemeral: true });
    } else {
      await interaction.reply({ content: `✅ ${message}`, ephemeral: true });
    }
  }
}

// ─── Follow Up with Error ─────────────────────────────────────────────────────────
export async function followUpError(
  interaction: ChatInputCommandInteraction | MessageComponentInteraction,
  message: string
): Promise<void> {
  if (interaction.isChatInputCommand() || interaction.isMessageComponent()) {
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: `❌ ${message}`, ephemeral: true });
    } else {
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
} as const;
