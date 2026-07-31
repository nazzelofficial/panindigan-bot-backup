/**
 * ═══════════════════════════════════════════════════
 *  Panindigan Premium Component Factory
 *  Centralized component generation system
 * ═══════════════════════════════════════════════════
 */

// @ts-nocheck
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  EmbedBuilder,
} from 'discord.js';
import { EmbedManager } from './EmbedManager.js';
import { ButtonManager } from './ButtonManager.js';
import { SelectMenuManager, SelectMenuOption } from './SelectMenuManager.js';
import { ModalManager } from './ModalManager.js';

// ─── Component Factory Class ────────────────────────────────────────────────────
export class ComponentFactory {
  // ─── Quick Embed Builders ───────────────────────────────────────────────────────
  static success(title: string, description?: string): EmbedBuilder {
    return EmbedManager.success(title, description);
  }

  static error(title: string, description?: string): EmbedBuilder {
    return EmbedManager.error(title, description);
  }

  static warning(title: string, description?: string): EmbedBuilder {
    return EmbedManager.warning(title, description);
  }

  static info(title: string, description?: string): EmbedBuilder {
    return EmbedManager.info(title, description);
  }

  static loading(action: string, description?: string): EmbedBuilder {
    return EmbedManager.loading(action, description);
  }

  static confirmation(title: string, description: string): EmbedBuilder {
    return EmbedManager.confirmation(title, description);
  }

  // ─── Category Embed Builders ───────────────────────────────────────────────────
  static music(title: string, description?: string): EmbedBuilder {
    return EmbedManager.music(title, description);
  }

  static economy(title: string, description?: string): EmbedBuilder {
    return EmbedManager.economy(title, description);
  }

  static moderation(title: string, description?: string): EmbedBuilder {
    return EmbedManager.moderation(title, description);
  }

  static ai(title: string, description?: string): EmbedBuilder {
    return EmbedManager.ai(title, description);
  }

  static premium(title: string, description?: string, tier?: 'free' | 'bronze' | 'silver' | 'gold' | 'diamond'): EmbedBuilder {
    return EmbedManager.premium(title, description, tier);
  }

  static utility(title: string, description?: string): EmbedBuilder {
    return EmbedManager.utility(title, description);
  }

  static leveling(title: string, description?: string): EmbedBuilder {
    return EmbedManager.leveling(title, description);
  }

  static queue(title: string, description?: string): EmbedBuilder {
    return EmbedManager.queue(title, description);
  }

  static dashboard(title: string, description?: string): EmbedBuilder {
    return EmbedManager.dashboard(title, description);
  }

  // ─── Quick Button Rows ─────────────────────────────────────────────────────────
  static confirmRow(prefix: string): ActionRowBuilder<ButtonBuilder> {
    return ButtonManager.confirmation(prefix);
  }

  static yesNoRow(prefix: string): ActionRowBuilder<ButtonBuilder> {
    return ButtonManager.yesNo(prefix);
  }

  static closeRow(prefix: string): ActionRowBuilder<ButtonBuilder> {
    return ButtonManager.close(prefix);
  }

  static actionRow(prefix: string, options?: {
    showSave?: boolean;
    showEdit?: boolean;
    showDelete?: boolean;
    showClose?: boolean;
  }): ActionRowBuilder<ButtonBuilder> {
    return ButtonManager.action(prefix, options);
  }

  static navigationRow(
    prefix: string,
    currentPage: number,
    totalPages: number,
    options?: {
      showFirst?: boolean;
      showLast?: boolean;
      showHome?: boolean;
      showRefresh?: boolean;
      showClose?: boolean;
    }
  ): ActionRowBuilder<ButtonBuilder> {
    return ButtonManager.navigation(prefix, currentPage, totalPages, options);
  }

  static dashboardRow(prefix: string, options?: {
    showSettings?: boolean;
    showStatistics?: boolean;
    showRefresh?: boolean;
    showClose?: boolean;
  }): ActionRowBuilder<ButtonBuilder> {
    return ButtonManager.dashboard(prefix, options);
  }

  // ─── Music Button Rows ───────────────────────────────────────────────────────
  static musicControlRow(
    guildId: string,
    state: {
      paused: boolean;
      loop: 'none' | 'track' | 'queue';
      shuffle: boolean;
    }
  ): ActionRowBuilder<ButtonBuilder> {
    return ButtonManager.musicControl(guildId, state);
  }

  static musicSecondaryRow(
    guildId: string,
    state: {
      shuffle: boolean;
      volume: number;
    }
  ): ActionRowBuilder<ButtonBuilder> {
    return ButtonManager.musicSecondary(guildId, state);
  }

  static musicFilterRow(guildId: string): ActionRowBuilder<ButtonBuilder> {
    return ButtonManager.musicFilter(guildId);
  }

  // ─── Quick Select Menus ───────────────────────────────────────────────────────
  static categorySelect(customId: string, categories: {
    name: string;
    value: string;
    emoji: string;
    description: string;
  }[]): ActionRowBuilder<StringSelectMenuBuilder> {
    return SelectMenuManager.category(customId, categories);
  }

  static musicSourceSelect(customId: string): ActionRowBuilder<StringSelectMenuBuilder> {
    return SelectMenuManager.musicSource(customId);
  }

  static languageSelect(customId: string): ActionRowBuilder<StringSelectMenuBuilder> {
    return SelectMenuManager.language(customId);
  }

  static premiumTierSelect(customId: string): ActionRowBuilder<StringSelectMenuBuilder> {
    return SelectMenuManager.premiumTier(customId);
  }

  static timezoneSelect(customId: string): ActionRowBuilder<StringSelectMenuBuilder> {
    return SelectMenuManager.timezone(customId);
  }

  static helpCategorySelect(customId: string): ActionRowBuilder<StringSelectMenuBuilder> {
    return SelectMenuManager.helpCategory(customId);
  }

  static moderationActionSelect(customId: string): ActionRowBuilder<StringSelectMenuBuilder> {
    return SelectMenuManager.moderationAction(customId);
  }

  static aiModelSelect(customId: string): ActionRowBuilder<StringSelectMenuBuilder> {
    return SelectMenuManager.aiModel(customId);
  }

  static customSelect(
    customId: string,
    placeholder: string,
    options: SelectMenuOption[],
    config?: {
      minValues?: number;
      maxValues?: number;
      disabled?: boolean;
    }
  ): ActionRowBuilder<StringSelectMenuBuilder> {
    return SelectMenuManager.custom(customId, placeholder, options, config);
  }

  // ─── Quick Modals ────────────────────────────────────────────────────────────
  static aiPromptModal(customId: string, prompt?: string) {
    return ModalManager.aiPrompt(customId, prompt);
  }

  static translateModal(customId: string) {
    return ModalManager.translate(customId);
  }

  static rewriteModal(customId: string, text?: string) {
    return ModalManager.rewrite(customId, text);
  }

  static summarizeModal(customId: string, text?: string) {
    return ModalManager.summarize(customId, text);
  }

  static announcementModal(customId: string) {
    return ModalManager.announcement(customId);
  }

  static warnModal(customId: string, reason?: string) {
    return ModalManager.warn(customId, reason);
  }

  static banModal(customId: string, reason?: string, deleteDays?: string) {
    return ModalManager.ban(customId, reason, deleteDays);
  }

  static timeoutModal(customId: string, reason?: string, duration?: string) {
    return ModalManager.timeout(customId, reason, duration);
  }

  static nicknameModal(customId: string, currentNickname?: string) {
    return ModalManager.nickname(customId, currentNickname);
  }

  static musicSearchModal(customId: string, query?: string) {
    return ModalManager.musicSearch(customId, query);
  }

  static volumeModal(customId: string, currentVolume?: number) {
    return ModalManager.volume(customId, currentVolume);
  }

  static reminderModal(customId: string) {
    return ModalManager.reminder(customId);
  }

  static pollModal(customId: string) {
    return ModalManager.poll(customId);
  }

  static ticketReasonModal(customId: string) {
    return ModalManager.ticketReason(customId);
  }

  static welcomeMessageModal(customId: string, currentMessage?: string) {
    return ModalManager.welcomeMessage(customId, currentMessage);
  }

  static goodbyeMessageModal(customId: string, currentMessage?: string) {
    return ModalManager.goodbyeMessage(customId, currentMessage);
  }

  static premiumSetupModal(customId: string) {
    return ModalManager.premiumSetup(customId);
  }

  static serverConfigModal(customId: string) {
    return ModalManager.serverConfig(customId);
  }

  // ─── Combined Response Builders ───────────────────────────────────────────────
  static successWithAction(
    title: string,
    description: string,
    actionLabel: string,
    actionCustomId: string
  ): { embed: EmbedBuilder; components: ActionRowBuilder<ButtonBuilder>[] } {
    return {
      embed: this.success(title, description),
      components: [
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setCustomId(actionCustomId)
            .setLabel(actionLabel)
            .setStyle(ButtonStyle.Primary)
        ),
      ],
    };
  }

  static errorWithRetry(
    title: string,
    description: string,
    retryCustomId: string
  ): { embed: EmbedBuilder; components: ActionRowBuilder<ButtonBuilder>[] } {
    return {
      embed: this.error(title, description),
      components: [
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setCustomId(retryCustomId)
            .setLabel('Retry')
            .setEmoji('🔄')
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId(`${retryCustomId}_close`)
            .setLabel('Close')
            .setEmoji('❌')
            .setStyle(ButtonStyle.Danger)
        ),
      ],
    };
  }

  static confirmationWithButtons(
    title: string,
    description: string,
    confirmCustomId: string,
    cancelCustomId: string
  ): { embed: EmbedBuilder; components: ActionRowBuilder<ButtonBuilder>[] } {
    return {
      embed: this.confirmation(title, description),
      components: [this.confirmRow(confirmCustomId).components[0].setCustomId(confirmCustomId)],
    };
  }

  static loadingWithCancel(
    action: string,
    description: string,
    cancelCustomId: string
  ): { embed: EmbedBuilder; components: ActionRowBuilder<ButtonBuilder>[] } {
    return {
      embed: this.loading(action, description),
      components: [
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setCustomId(cancelCustomId)
            .setLabel('Cancel')
            .setEmoji('❌')
            .setStyle(ButtonStyle.Danger)
        ),
      ],
    };
  }

  // ─── Dashboard Response Builder ───────────────────────────────────────────────
  static dashboardResponse(
    title: string,
    sections: { name: string; value: string; inline?: boolean }[],
    prefix: string,
    options?: {
      thumbnail?: string;
      image?: string;
      showSettings?: boolean;
      showStatistics?: boolean;
      showRefresh?: boolean;
      showClose?: boolean;
    }
  ): { embed: EmbedBuilder; components: ActionRowBuilder<ButtonBuilder>[] } {
    return {
      embed: this.dashboard(title).addFields(sections),
      components: [this.dashboardRow(prefix, options)],
    };
  }

  // ─── Music Player Response Builder ────────────────────────────────────────────
  static musicPlayerResponse(
    title: string,
    description: string,
    guildId: string,
    state: {
      paused: boolean;
      loop: 'none' | 'track' | 'queue';
      shuffle: boolean;
      volume: number;
    },
    thumbnail?: string
  ): { embed: EmbedBuilder; components: ActionRowBuilder<ButtonBuilder>[] } {
    const embed = this.music(title, description);
    if (thumbnail) embed.setThumbnail(thumbnail);

    return {
      embed,
      components: [
        this.musicControlRow(guildId, state),
        this.musicSecondaryRow(guildId, state),
      ],
    };
  }

  // ─── Queue Response Builder ───────────────────────────────────────────────────
  static queueResponse(
    title: string,
    description: string,
    guildId: string,
    state: {
      shuffle: boolean;
      volume: number;
    }
  ): { embed: EmbedBuilder; components: ActionRowBuilder<ButtonBuilder>[] } {
    return {
      embed: this.queue(title, description),
      components: [
        this.musicSecondaryRow(guildId, state),
      ],
    };
  }

  // ─── Single Button Builder ────────────────────────────────────────────────────
  static singleButton(
    customId: string,
    label?: string,
    emoji?: string,
    style: ButtonStyle = ButtonStyle.Primary,
    disabled = false
  ): ButtonBuilder {
    return ButtonManager.single(customId, label, emoji, style, disabled);
  }

  // ─── Link Button Builder ───────────────────────────────────────────────────────
  static linkButton(label: string, url: string, emoji?: string): ButtonBuilder {
    return ButtonManager.link(label, url, emoji);
  }

  // ─── Premium Button Builder ───────────────────────────────────────────────────
  static premiumButton(customId: string, label?: string): ButtonBuilder {
    return ButtonManager.premium(customId, label);
  }

  // ─── Favorite Button Builder ───────────────────────────────────────────────────
  static favoriteButton(customId: string, isFavorite: boolean): ButtonBuilder {
    return ButtonManager.favorite(customId, isFavorite);
  }
}

// ─── Export Component Factory ────────────────────────────────────────────────────
export default ComponentFactory;
