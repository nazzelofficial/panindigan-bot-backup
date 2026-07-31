/**
 * ═══════════════════════════════════════════════════
 *  Panindigan Premium Pagination Manager
 *  Unified pagination system with consistent UX
 * ═══════════════════════════════════════════════════
 */

import {
  EmbedBuilder,
  Message,
  ChatInputCommandInteraction,
  MessageComponentInteraction,
  ComponentType,
} from 'discord.js';
import { ButtonManager } from './ButtonManager.js';

// ─── Pagination Options Interface ─────────────────────────────────────────────────
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

// ─── Pagination State Interface ───────────────────────────────────────────────────
export interface PaginationState {
  currentPage: number;
  totalPages: number;
  prefix: string;
}

// ─── Send Paginated Response ───────────────────────────────────────────────────────
export async function sendPaginatedResponse(
  source: Message | ChatInputCommandInteraction,
  pages: EmbedBuilder[],
  prefix: string,
  options: PaginationOptions = {}
): Promise<Message | null> {
  const {
    timeout = 60000,
    ephemeral = false,
    editReply = true,
    showFirst = true,
    showLast = true,
    showHome = false,
    showRefresh = false,
    showClose = true,
    onFirst,
    onLast,
    onHome,
    onRefresh,
    onClose,
  } = options;

  // Handle single page
  if (pages.length === 0) return null;
  if (pages.length === 1) {
    if (source instanceof Message) {
      return await source.reply({ embeds: [pages[0]] });
    } else {
      const method = editReply ? 'editReply' : 'reply';
      await source[method]({ embeds: [pages[0]], ephemeral });
      return editReply ? (await source.fetchReply() as Message) : null;
    }
  }

  let currentPage = 0;
  const totalPages = pages.length;

  // Build button row
  const getButtonRow = () =>
    ButtonManager.navigation(prefix, currentPage, totalPages, {
      showFirst,
      showLast,
      showHome,
      showRefresh,
      showClose,
    });

  // Send initial response
  let message: Message;
  if (source instanceof Message) {
    message = await source.reply({
      embeds: [pages[currentPage]],
      components: [getButtonRow()],
    });
  } else {
    const method = editReply ? 'editReply' : 'reply';
    await source[method]({
      embeds: [pages[currentPage]],
      components: [getButtonRow()],
      ephemeral,
    });
    message = await source.fetchReply() as Message;
  }

  // Create collector
  const collector = message.createMessageComponentCollector({
    componentType: ComponentType.Button,
    time: timeout,
    filter: (i) => {
      const userId = source instanceof Message ? source.author.id : source.user.id;
      if (i.user.id !== userId) {
        i.reply({ content: '❌ This menu is not for you.', ephemeral: true });
        return false;
      }
      return true;
    },
  });

  // Handle button interactions
  collector.on('collect', async (i: MessageComponentInteraction) => {
    const action = i.customId.replace(`${prefix}_`, '');

    switch (action) {
      case 'first':
        currentPage = 0;
        if (onFirst) onFirst();
        break;
      case 'previous':
        currentPage = Math.max(0, currentPage - 1);
        break;
      case 'next':
        currentPage = Math.min(totalPages - 1, currentPage + 1);
        break;
      case 'last':
        currentPage = totalPages - 1;
        if (onLast) onLast();
        break;
      case 'home':
        currentPage = 0;
        if (onHome) onHome();
        break;
      case 'refresh':
        if (onRefresh) onRefresh();
        break;
      case 'close':
        collector.stop('closed');
        if (onClose) onClose();
        await i.update({ embeds: [pages[currentPage]], components: [] });
        return;
    }

    await i.update({
      embeds: [pages[currentPage]],
      components: [getButtonRow()],
    });
  });

  // Handle collector end
  collector.on('end', async (_, reason) => {
    if (reason !== 'closed') {
      try {
        await message.edit({ components: [] });
      } catch {}
    }
  });

  return message;
}

// ─── Send Paginated Embed with Custom Page Generator ─────────────────────────────
export async function sendDynamicPagination(
  source: Message | ChatInputCommandInteraction,
  pageGenerator: (page: number) => EmbedBuilder,
  totalPages: number,
  prefix: string,
  options: PaginationOptions = {}
): Promise<Message | null> {
  const {
    timeout = 60000,
    ephemeral = false,
    editReply = true,
    showFirst = true,
    showLast = true,
    showHome = false,
    showRefresh = false,
    showClose = true,
    onFirst,
    onLast,
    onHome,
    onRefresh,
    onClose,
  } = options;

  if (totalPages <= 0) return null;
  if (totalPages === 1) {
    const embed = pageGenerator(0);
    if (source instanceof Message) {
      return await source.reply({ embeds: [embed] });
    } else {
      const method = editReply ? 'editReply' : 'reply';
      await source[method]({ embeds: [embed], ephemeral });
      return editReply ? (await source.fetchReply() as Message) : null;
    }
  }

  let currentPage = 0;

  // Build button row
  const getButtonRow = () =>
    ButtonManager.navigation(prefix, currentPage, totalPages, {
      showFirst,
      showLast,
      showHome,
      showRefresh,
      showClose,
    });

  // Send initial response
  let message: Message;
  if (source instanceof Message) {
    message = await source.reply({
      embeds: [pageGenerator(currentPage)],
      components: [getButtonRow()],
    });
  } else {
    const method = editReply ? 'editReply' : 'reply';
    await source[method]({
      embeds: [pageGenerator(currentPage)],
      components: [getButtonRow()],
      ephemeral,
    });
    message = await source.fetchReply() as Message;
  }

  // Create collector
  const collector = message.createMessageComponentCollector({
    componentType: ComponentType.Button,
    time: timeout,
    filter: (i) => {
      const userId = source instanceof Message ? source.author.id : source.user.id;
      if (i.user.id !== userId) {
        i.reply({ content: '❌ This menu is not for you.', ephemeral: true });
        return false;
      }
      return true;
    },
  });

  // Handle button interactions
  collector.on('collect', async (i: MessageComponentInteraction) => {
    const action = i.customId.replace(`${prefix}_`, '');

    switch (action) {
      case 'first':
        currentPage = 0;
        if (onFirst) onFirst();
        break;
      case 'previous':
        currentPage = Math.max(0, currentPage - 1);
        break;
      case 'next':
        currentPage = Math.min(totalPages - 1, currentPage + 1);
        break;
      case 'last':
        currentPage = totalPages - 1;
        if (onLast) onLast();
        break;
      case 'home':
        currentPage = 0;
        if (onHome) onHome();
        break;
      case 'refresh':
        if (onRefresh) onRefresh();
        break;
      case 'close':
        collector.stop('closed');
        if (onClose) onClose();
        await i.update({ embeds: [pageGenerator(currentPage)], components: [] });
        return;
    }

    await i.update({
      embeds: [pageGenerator(currentPage)],
      components: [getButtonRow()],
    });
  });

  // Handle collector end
  collector.on('end', async (_, reason) => {
    if (reason !== 'closed') {
      try {
        await message.edit({ components: [] });
      } catch {}
    }
  });

  return message;
}

// ─── Simple Pagination (for quick use) ───────────────────────────────────────────
export async function simplePagination(
  source: Message | ChatInputCommandInteraction,
  pages: EmbedBuilder[],
  prefix: string
): Promise<Message | null> {
  return sendPaginatedResponse(source, pages, prefix, {
    timeout: 60000,
    showFirst: false,
    showLast: false,
    showHome: false,
    showRefresh: false,
    showClose: true,
  });
}

// ─── Extended Pagination (with all buttons) ───────────────────────────────────────
export async function extendedPagination(
  source: Message | ChatInputCommandInteraction,
  pages: EmbedBuilder[],
  prefix: string
): Promise<Message | null> {
  return sendPaginatedResponse(source, pages, prefix, {
    timeout: 120000,
    showFirst: true,
    showLast: true,
    showHome: true,
    showRefresh: true,
    showClose: true,
  });
}

// ─── Export Pagination Manager ────────────────────────────────────────────────────
export const PaginationManager = {
  send: sendPaginatedResponse,
  sendDynamic: sendDynamicPagination,
  simple: simplePagination,
  extended: extendedPagination,
} as const;
