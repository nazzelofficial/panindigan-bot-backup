// @ts-nocheck
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, } from 'discord.js';
export class ComponentBuilder {
    static confirmRow(confirmId, cancelId, confirmLabel = 'Confirm', cancelLabel = 'Cancel') {
        return new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId(confirmId).setLabel(confirmLabel).setStyle(ButtonStyle.Success).setEmoji('✅'), new ButtonBuilder().setCustomId(cancelId).setLabel(cancelLabel).setStyle(ButtonStyle.Danger).setEmoji('❌'));
    }
    static yesNoRow(yesId, noId) {
        return new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId(yesId).setLabel('Yes').setStyle(ButtonStyle.Success), new ButtonBuilder().setCustomId(noId).setLabel('No').setStyle(ButtonStyle.Danger));
    }
    static paginationRow(prevId, nextId, current, total, disabled = false) {
        return new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId(prevId).setLabel('◀ Previous').setStyle(ButtonStyle.Secondary).setDisabled(disabled || current <= 1), new ButtonBuilder().setCustomId(`page_${current}`).setLabel(`${current} / ${total}`).setStyle(ButtonStyle.Primary).setDisabled(true), new ButtonBuilder().setCustomId(nextId).setLabel('Next ▶').setStyle(ButtonStyle.Secondary).setDisabled(disabled || current >= total));
    }
    static musicControlRow(guildId, paused = false, loop = 'none') {
        return new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId(`music_prev:${guildId}`).setEmoji('⏮️').setStyle(ButtonStyle.Secondary), new ButtonBuilder().setCustomId(`music_pause:${guildId}`).setEmoji(paused ? '▶️' : '⏸️').setStyle(paused ? ButtonStyle.Success : ButtonStyle.Primary), new ButtonBuilder().setCustomId(`music_skip:${guildId}`).setEmoji('⏭️').setStyle(ButtonStyle.Secondary), new ButtonBuilder().setCustomId(`music_loop:${guildId}`).setEmoji('🔁').setStyle(loop !== 'none' ? ButtonStyle.Success : ButtonStyle.Secondary), new ButtonBuilder().setCustomId(`music_stop:${guildId}`).setEmoji('⏹️').setStyle(ButtonStyle.Danger));
    }
    static musicVolumeRow(guildId) {
        return new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId(`music_voldown:${guildId}`).setEmoji('🔉').setStyle(ButtonStyle.Secondary), new ButtonBuilder().setCustomId(`music_queue:${guildId}`).setEmoji('📋').setStyle(ButtonStyle.Secondary), new ButtonBuilder().setCustomId(`music_save:${guildId}`).setEmoji('⭐').setStyle(ButtonStyle.Secondary), new ButtonBuilder().setCustomId(`music_shuffle:${guildId}`).setEmoji('🔀').setStyle(ButtonStyle.Secondary), new ButtonBuilder().setCustomId(`music_volup:${guildId}`).setEmoji('🔊').setStyle(ButtonStyle.Secondary));
    }
    static selectMenu(customId, placeholder, options) {
        const menu = new StringSelectMenuBuilder()
            .setCustomId(customId)
            .setPlaceholder(placeholder)
            .addOptions(options.map(opt => new StringSelectMenuOptionBuilder()
            .setLabel(opt.label)
            .setValue(opt.value)
            .setDescription(opt.description || '')
            .setEmoji(opt.emoji || '📌')));
        return new ActionRowBuilder().addComponents(menu);
    }
    static disabledRow(row) {
        const newRow = new ActionRowBuilder();
        for (const comp of row.components) {
            newRow.addComponents(ButtonBuilder.from(comp.toJSON()).setDisabled(true));
        }
        return newRow;
    }
}
