/**
 * ═══════════════════════════════════════════════════
 *  Panindigan Premium Component Factory
 *  Centralized component generation system
 * ═══════════════════════════════════════════════════
 */
// @ts-nocheck
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, } from 'discord.js';
import { EmbedManager } from './EmbedManager.js';
import { ButtonManager } from './ButtonManager.js';
import { SelectMenuManager } from './SelectMenuManager.js';
import { ModalManager } from './ModalManager.js';
// ─── Component Factory Class ────────────────────────────────────────────────────
export class ComponentFactory {
    // ─── Quick Embed Builders ───────────────────────────────────────────────────────
    static success(title, description) {
        return EmbedManager.success(title, description);
    }
    static error(title, description) {
        return EmbedManager.error(title, description);
    }
    static warning(title, description) {
        return EmbedManager.warning(title, description);
    }
    static info(title, description) {
        return EmbedManager.info(title, description);
    }
    static loading(action, description) {
        return EmbedManager.loading(action, description);
    }
    static confirmation(title, description) {
        return EmbedManager.confirmation(title, description);
    }
    // ─── Category Embed Builders ───────────────────────────────────────────────────
    static music(title, description) {
        return EmbedManager.music(title, description);
    }
    static economy(title, description) {
        return EmbedManager.economy(title, description);
    }
    static moderation(title, description) {
        return EmbedManager.moderation(title, description);
    }
    static ai(title, description) {
        return EmbedManager.ai(title, description);
    }
    static premium(title, description, tier) {
        return EmbedManager.premium(title, description, tier);
    }
    static utility(title, description) {
        return EmbedManager.utility(title, description);
    }
    static leveling(title, description) {
        return EmbedManager.leveling(title, description);
    }
    static queue(title, description) {
        return EmbedManager.queue(title, description);
    }
    static dashboard(title, description) {
        return EmbedManager.dashboard(title, description);
    }
    // ─── Quick Button Rows ─────────────────────────────────────────────────────────
    static confirmRow(prefix) {
        return ButtonManager.confirmation(prefix);
    }
    static yesNoRow(prefix) {
        return ButtonManager.yesNo(prefix);
    }
    static closeRow(prefix) {
        return ButtonManager.close(prefix);
    }
    static actionRow(prefix, options) {
        return ButtonManager.action(prefix, options);
    }
    static navigationRow(prefix, currentPage, totalPages, options) {
        return ButtonManager.navigation(prefix, currentPage, totalPages, options);
    }
    static dashboardRow(prefix, options) {
        return ButtonManager.dashboard(prefix, options);
    }
    // ─── Music Button Rows ───────────────────────────────────────────────────────
    static musicControlRow(guildId, state) {
        return ButtonManager.musicControl(guildId, state);
    }
    static musicSecondaryRow(guildId, state) {
        return ButtonManager.musicSecondary(guildId, state);
    }
    static musicFilterRow(guildId) {
        return ButtonManager.musicFilter(guildId);
    }
    // ─── Quick Select Menus ───────────────────────────────────────────────────────
    static categorySelect(customId, categories) {
        return SelectMenuManager.category(customId, categories);
    }
    static musicSourceSelect(customId) {
        return SelectMenuManager.musicSource(customId);
    }
    static languageSelect(customId) {
        return SelectMenuManager.language(customId);
    }
    static premiumTierSelect(customId) {
        return SelectMenuManager.premiumTier(customId);
    }
    static timezoneSelect(customId) {
        return SelectMenuManager.timezone(customId);
    }
    static helpCategorySelect(customId) {
        return SelectMenuManager.helpCategory(customId);
    }
    static moderationActionSelect(customId) {
        return SelectMenuManager.moderationAction(customId);
    }
    static aiModelSelect(customId) {
        return SelectMenuManager.aiModel(customId);
    }
    static customSelect(customId, placeholder, options, config) {
        return SelectMenuManager.custom(customId, placeholder, options, config);
    }
    // ─── Quick Modals ────────────────────────────────────────────────────────────
    static aiPromptModal(customId, prompt) {
        return ModalManager.aiPrompt(customId, prompt);
    }
    static translateModal(customId) {
        return ModalManager.translate(customId);
    }
    static rewriteModal(customId, text) {
        return ModalManager.rewrite(customId, text);
    }
    static summarizeModal(customId, text) {
        return ModalManager.summarize(customId, text);
    }
    static announcementModal(customId) {
        return ModalManager.announcement(customId);
    }
    static warnModal(customId, reason) {
        return ModalManager.warn(customId, reason);
    }
    static banModal(customId, reason, deleteDays) {
        return ModalManager.ban(customId, reason, deleteDays);
    }
    static timeoutModal(customId, reason, duration) {
        return ModalManager.timeout(customId, reason, duration);
    }
    static nicknameModal(customId, currentNickname) {
        return ModalManager.nickname(customId, currentNickname);
    }
    static musicSearchModal(customId, query) {
        return ModalManager.musicSearch(customId, query);
    }
    static volumeModal(customId, currentVolume) {
        return ModalManager.volume(customId, currentVolume);
    }
    static reminderModal(customId) {
        return ModalManager.reminder(customId);
    }
    static pollModal(customId) {
        return ModalManager.poll(customId);
    }
    static ticketReasonModal(customId) {
        return ModalManager.ticketReason(customId);
    }
    static welcomeMessageModal(customId, currentMessage) {
        return ModalManager.welcomeMessage(customId, currentMessage);
    }
    static goodbyeMessageModal(customId, currentMessage) {
        return ModalManager.goodbyeMessage(customId, currentMessage);
    }
    static premiumSetupModal(customId) {
        return ModalManager.premiumSetup(customId);
    }
    static serverConfigModal(customId) {
        return ModalManager.serverConfig(customId);
    }
    // ─── Combined Response Builders ───────────────────────────────────────────────
    static successWithAction(title, description, actionLabel, actionCustomId) {
        return {
            embed: this.success(title, description),
            components: [
                new ActionRowBuilder().addComponents(new ButtonBuilder()
                    .setCustomId(actionCustomId)
                    .setLabel(actionLabel)
                    .setStyle(ButtonStyle.Primary)),
            ],
        };
    }
    static errorWithRetry(title, description, retryCustomId) {
        return {
            embed: this.error(title, description),
            components: [
                new ActionRowBuilder().addComponents(new ButtonBuilder()
                    .setCustomId(retryCustomId)
                    .setLabel('Retry')
                    .setEmoji('🔄')
                    .setStyle(ButtonStyle.Primary), new ButtonBuilder()
                    .setCustomId(`${retryCustomId}_close`)
                    .setLabel('Close')
                    .setEmoji('❌')
                    .setStyle(ButtonStyle.Danger)),
            ],
        };
    }
    static confirmationWithButtons(title, description, confirmCustomId, cancelCustomId) {
        return {
            embed: this.confirmation(title, description),
            components: [this.confirmRow(confirmCustomId).components[0].setCustomId(confirmCustomId)],
        };
    }
    static loadingWithCancel(action, description, cancelCustomId) {
        return {
            embed: this.loading(action, description),
            components: [
                new ActionRowBuilder().addComponents(new ButtonBuilder()
                    .setCustomId(cancelCustomId)
                    .setLabel('Cancel')
                    .setEmoji('❌')
                    .setStyle(ButtonStyle.Danger)),
            ],
        };
    }
    // ─── Dashboard Response Builder ───────────────────────────────────────────────
    static dashboardResponse(title, sections, prefix, options) {
        return {
            embed: this.dashboard(title).addFields(sections),
            components: [this.dashboardRow(prefix, options)],
        };
    }
    // ─── Music Player Response Builder ────────────────────────────────────────────
    static musicPlayerResponse(title, description, guildId, state, thumbnail) {
        const embed = this.music(title, description);
        if (thumbnail)
            embed.setThumbnail(thumbnail);
        return {
            embed,
            components: [
                this.musicControlRow(guildId, state),
                this.musicSecondaryRow(guildId, state),
            ],
        };
    }
    // ─── Queue Response Builder ───────────────────────────────────────────────────
    static queueResponse(title, description, guildId, state) {
        return {
            embed: this.queue(title, description),
            components: [
                this.musicSecondaryRow(guildId, state),
            ],
        };
    }
    // ─── Single Button Builder ────────────────────────────────────────────────────
    static singleButton(customId, label, emoji, style = ButtonStyle.Primary, disabled = false) {
        return ButtonManager.single(customId, label, emoji, style, disabled);
    }
    // ─── Link Button Builder ───────────────────────────────────────────────────────
    static linkButton(label, url, emoji) {
        return ButtonManager.link(label, url, emoji);
    }
    // ─── Premium Button Builder ───────────────────────────────────────────────────
    static premiumButton(customId, label) {
        return ButtonManager.premium(customId, label);
    }
    // ─── Favorite Button Builder ───────────────────────────────────────────────────
    static favoriteButton(customId, isFavorite) {
        return ButtonManager.favorite(customId, isFavorite);
    }
}
// ─── Export Component Factory ────────────────────────────────────────────────────
export default ComponentFactory;
//# sourceMappingURL=ComponentFactory.js.map