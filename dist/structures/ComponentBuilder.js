// @ts-nocheck
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, } from 'discord.js';
export class ComponentBuilder {
    // ─── Confirm / Cancel ──────────────────────────────────────────────────────
    static confirmRow(confirmId, cancelId, confirmLabel = 'Confirm', cancelLabel = 'Cancel') {
        return new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId(confirmId).setLabel(confirmLabel).setStyle(ButtonStyle.Success).setEmoji('✅'), new ButtonBuilder().setCustomId(cancelId).setLabel(cancelLabel).setStyle(ButtonStyle.Danger).setEmoji('❌'));
    }
    // ─── Yes / No ─────────────────────────────────────────────────────────────
    static yesNoRow(yesId, noId) {
        return new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId(yesId).setLabel('Yes').setStyle(ButtonStyle.Success).setEmoji('✅'), new ButtonBuilder().setCustomId(noId).setLabel('No').setStyle(ButtonStyle.Danger).setEmoji('❌'));
    }
    // ─── Dismiss ─────────────────────────────────────────────────────────────
    /** Single button that a user presses to dismiss/delete an ephemeral-style response. */
    static dismissRow(id, label = 'Dismiss') {
        return new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId(id).setLabel(label).setStyle(ButtonStyle.Secondary).setEmoji('✖️'));
    }
    // ─── Close ────────────────────────────────────────────────────────────────
    static closeRow(id, label = 'Close') {
        return new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId(id).setLabel(label).setStyle(ButtonStyle.Danger).setEmoji('❌'));
    }
    // ─── Link Button ─────────────────────────────────────────────────────────
    /** Single external-link button. */
    static linkRow(label, url, emoji) {
        const btn = new ButtonBuilder().setLabel(label).setStyle(ButtonStyle.Link).setURL(url);
        if (emoji)
            btn.setEmoji(emoji);
        return new ActionRowBuilder().addComponents(btn);
    }
    // ─── Support + Invite row ─────────────────────────────────────────────────
    /** Error recovery row — links to support server and optionally invite. */
    static errorActionRow(supportUrl = 'https://discord.gg/panindigan', inviteUrl) {
        const components = [
            new ButtonBuilder().setLabel('Support Server').setStyle(ButtonStyle.Link).setURL(supportUrl).setEmoji('🆘'),
        ];
        if (inviteUrl) {
            components.push(new ButtonBuilder().setLabel('Invite Bot').setStyle(ButtonStyle.Link).setURL(inviteUrl).setEmoji('🤖'));
        }
        return new ActionRowBuilder().addComponents(components);
    }
    // ─── Basic Pagination ─────────────────────────────────────────────────────
    static paginationRow(prevId, nextId, current, total, disabled = false) {
        return new ActionRowBuilder().addComponents(new ButtonBuilder()
            .setCustomId(prevId)
            .setEmoji('◀️')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(disabled || current <= 1), new ButtonBuilder()
            .setCustomId(`page_info_${current}`)
            .setLabel(`${current} / ${total}`)
            .setStyle(ButtonStyle.Primary)
            .setDisabled(true), new ButtonBuilder()
            .setCustomId(nextId)
            .setEmoji('▶️')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(disabled || current >= total));
    }
    // ─── Full Pagination (with first / last) ──────────────────────────────────
    static fullPaginationRow(firstId, prevId, nextId, lastId, current, total, disabled = false) {
        return new ActionRowBuilder().addComponents(new ButtonBuilder()
            .setCustomId(firstId)
            .setEmoji('⏮️')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(disabled || current <= 1), new ButtonBuilder()
            .setCustomId(prevId)
            .setEmoji('◀️')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(disabled || current <= 1), new ButtonBuilder()
            .setCustomId(`page_info_${current}`)
            .setLabel(`${current} / ${total}`)
            .setStyle(ButtonStyle.Primary)
            .setDisabled(true), new ButtonBuilder()
            .setCustomId(nextId)
            .setEmoji('▶️')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(disabled || current >= total), new ButtonBuilder()
            .setCustomId(lastId)
            .setEmoji('⏭️')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(disabled || current >= total));
    }
    // ─── Music Controls (row 1 — main transport) ──────────────────────────────
    static musicControlRow(guildId, paused = false, loop = 'none') {
        const loopStyle = loop === 'track' ? ButtonStyle.Success :
            loop === 'queue' ? ButtonStyle.Primary :
                ButtonStyle.Secondary;
        const loopEmoji = loop === 'track' ? '🔂' : '🔁';
        return new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId(`music_prev:${guildId}`).setEmoji('⏮️').setStyle(ButtonStyle.Secondary), new ButtonBuilder()
            .setCustomId(`music_pause:${guildId}`)
            .setEmoji(paused ? '▶️' : '⏸️')
            .setStyle(paused ? ButtonStyle.Success : ButtonStyle.Primary), new ButtonBuilder().setCustomId(`music_skip:${guildId}`).setEmoji('⏭️').setStyle(ButtonStyle.Secondary), new ButtonBuilder().setCustomId(`music_loop:${guildId}`).setEmoji(loopEmoji).setStyle(loopStyle), new ButtonBuilder().setCustomId(`music_stop:${guildId}`).setEmoji('⏹️').setStyle(ButtonStyle.Danger));
    }
    // ─── Music Controls (row 2 — extras) ─────────────────────────────────────
    static musicVolumeRow(guildId) {
        return new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId(`music_voldown:${guildId}`).setEmoji('🔉').setStyle(ButtonStyle.Secondary), new ButtonBuilder().setCustomId(`music_queue:${guildId}`).setEmoji('📋').setStyle(ButtonStyle.Secondary), new ButtonBuilder().setCustomId(`music_save:${guildId}`).setEmoji('⭐').setStyle(ButtonStyle.Secondary), new ButtonBuilder().setCustomId(`music_shuffle:${guildId}`).setEmoji('🔀').setStyle(ButtonStyle.Secondary), new ButtonBuilder().setCustomId(`music_volup:${guildId}`).setEmoji('🔊').setStyle(ButtonStyle.Secondary));
    }
    // ─── Select Menu ─────────────────────────────────────────────────────────
    static selectMenu(customId, placeholder, options, minValues = 1, maxValues = 1) {
        const menu = new StringSelectMenuBuilder()
            .setCustomId(customId)
            .setPlaceholder(placeholder)
            .setMinValues(minValues)
            .setMaxValues(maxValues)
            .addOptions(options.map(opt => {
            const o = new StringSelectMenuOptionBuilder()
                .setLabel(opt.label)
                .setValue(opt.value);
            if (opt.description)
                o.setDescription(opt.description);
            if (opt.emoji)
                o.setEmoji(opt.emoji);
            if (opt.default)
                o.setDefault(true);
            return o;
        }));
        return new ActionRowBuilder().addComponents(menu);
    }
    // ─── Disable all buttons in a row ────────────────────────────────────────
    static disabledRow(row) {
        const newRow = new ActionRowBuilder();
        for (const comp of row.components) {
            newRow.addComponents(ButtonBuilder.from(comp.toJSON()).setDisabled(true));
        }
        return newRow;
    }
}
//# sourceMappingURL=ComponentBuilder.js.map