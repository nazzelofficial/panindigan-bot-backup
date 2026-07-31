/**
 * ═══════════════════════════════════════════════════
 *  Panindigan Premium Button Manager
 *  Standardized, professional button system
 * ═══════════════════════════════════════════════════
 */
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, } from 'discord.js';
// ─── Button Icons ─────────────────────────────────────────────────────────────────
export const BUTTON_ICONS = {
    home: '🏠',
    previous: '⬅️',
    next: '➡️',
    first: '⏮️',
    last: '⏭️',
    details: '📄',
    statistics: '📊',
    settings: '⚙️',
    save: '💾',
    edit: '✏️',
    add: '➕',
    remove: '➖',
    favorite: '❤️',
    premium: '⭐',
    pin: '📌',
    export: '📥',
    import: '📤',
    refresh: '🔄',
    delete: '🗑️',
    stop: '🛑',
    close: '❌',
    confirm: '✅',
    cancel: '❌',
    yes: '✅',
    no: '❌',
    play: '▶️',
    pause: '⏸️',
    skip: '⏭️',
    shuffle: '🔀',
    loop: '🔁',
    queue: '📜',
    volumeUp: '🔊',
    volumeDown: '🔉',
    filter: '🎛️',
    search: '🔍',
    link: '🔗',
    share: '📤',
    copy: '📋',
    download: '⬇️',
    upload: '⬆️',
    check: '☑️',
    cross: '✖️',
    up: '🔺',
    down: '🔻',
    left: '⬅️',
    right: '➡️',
    music: '🎵',
    user: '👤',
    server: '🏠',
    channel: '#️⃣',
    role: '🎭',
    message: '💬',
    notification: '🔔',
    warning: '⚠️',
    info: 'ℹ️',
    help: '❓',
    crown: '👑',
    gem: '💎',
    fire: '🔥',
    sparkle: '✨',
    star: '⭐',
    heart: '❤️',
    clock: '🕐',
    calendar: '📅',
    globe: '🌍',
    chart: '📊',
    list: '📋',
    grid: '🔲',
    menu: '☰',
};
// ─── Button Labels ────────────────────────────────────────────────────────────────
export const BUTTON_LABELS = {
    home: 'Home',
    previous: 'Previous',
    next: 'Next',
    first: 'First',
    last: 'Last',
    details: 'Details',
    statistics: 'Statistics',
    settings: 'Settings',
    save: 'Save',
    edit: 'Edit',
    add: 'Add',
    remove: 'Remove',
    favorite: 'Favorite',
    premium: 'Premium',
    pin: 'Pin',
    export: 'Export',
    import: 'Import',
    refresh: 'Refresh',
    delete: 'Delete',
    stop: 'Stop',
    close: 'Close',
    confirm: 'Confirm',
    cancel: 'Cancel',
    yes: 'Yes',
    no: 'No',
    play: 'Play',
    pause: 'Pause',
    skip: 'Skip',
    shuffle: 'Shuffle',
    loop: 'Loop',
    queue: 'Queue',
    volumeUp: 'Volume +',
    volumeDown: 'Volume -',
    filter: 'Filters',
    search: 'Search',
    link: 'Link',
    share: 'Share',
    copy: 'Copy',
    download: 'Download',
    upload: 'Upload',
};
// ─── Navigation Row ───────────────────────────────────────────────────────────────
export function navigationRow(prefix, currentPage, totalPages, options = {}) {
    const { showFirst = true, showLast = true, showHome = false, showRefresh = false, showClose = true, } = options;
    const buttons = [];
    if (showFirst) {
        buttons.push(new ButtonBuilder()
            .setCustomId(`${prefix}_first`)
            .setEmoji(BUTTON_ICONS.first)
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(currentPage === 0));
    }
    buttons.push(new ButtonBuilder()
        .setCustomId(`${prefix}_previous`)
        .setEmoji(BUTTON_ICONS.previous)
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(currentPage === 0));
    buttons.push(new ButtonBuilder()
        .setCustomId(`${prefix}_page`)
        .setLabel(`${currentPage + 1} / ${totalPages}`)
        .setStyle(ButtonStyle.Primary)
        .setDisabled(true));
    buttons.push(new ButtonBuilder()
        .setCustomId(`${prefix}_next`)
        .setEmoji(BUTTON_ICONS.next)
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(currentPage >= totalPages - 1));
    if (showLast) {
        buttons.push(new ButtonBuilder()
            .setCustomId(`${prefix}_last`)
            .setEmoji(BUTTON_ICONS.last)
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(currentPage >= totalPages - 1));
    }
    if (showHome) {
        buttons.push(new ButtonBuilder()
            .setCustomId(`${prefix}_home`)
            .setEmoji(BUTTON_ICONS.home)
            .setStyle(ButtonStyle.Secondary));
    }
    if (showRefresh) {
        buttons.push(new ButtonBuilder()
            .setCustomId(`${prefix}_refresh`)
            .setEmoji(BUTTON_ICONS.refresh)
            .setStyle(ButtonStyle.Secondary));
    }
    if (showClose) {
        buttons.push(new ButtonBuilder()
            .setCustomId(`${prefix}_close`)
            .setEmoji(BUTTON_ICONS.close)
            .setStyle(ButtonStyle.Danger));
    }
    return new ActionRowBuilder().addComponents(buttons);
}
// ─── Confirmation Row ─────────────────────────────────────────────────────────────
export function confirmationRow(prefix, confirmLabel = BUTTON_LABELS.confirm, cancelLabel = BUTTON_LABELS.cancel) {
    return new ActionRowBuilder().addComponents(new ButtonBuilder()
        .setCustomId(`${prefix}_confirm`)
        .setLabel(confirmLabel)
        .setEmoji(BUTTON_ICONS.confirm)
        .setStyle(ButtonStyle.Success), new ButtonBuilder()
        .setCustomId(`${prefix}_cancel`)
        .setLabel(cancelLabel)
        .setEmoji(BUTTON_ICONS.cancel)
        .setStyle(ButtonStyle.Danger));
}
// ─── Yes/No Row ───────────────────────────────────────────────────────────────────
export function yesNoRow(prefix) {
    return new ActionRowBuilder().addComponents(new ButtonBuilder()
        .setCustomId(`${prefix}_yes`)
        .setLabel(BUTTON_LABELS.yes)
        .setEmoji(BUTTON_ICONS.yes)
        .setStyle(ButtonStyle.Success), new ButtonBuilder()
        .setCustomId(`${prefix}_no`)
        .setLabel(BUTTON_LABELS.no)
        .setEmoji(BUTTON_ICONS.no)
        .setStyle(ButtonStyle.Danger));
}
// ─── Close Row ────────────────────────────────────────────────────────────────────
export function closeRow(prefix, label = BUTTON_LABELS.close) {
    return new ActionRowBuilder().addComponents(new ButtonBuilder()
        .setCustomId(`${prefix}_close`)
        .setLabel(label)
        .setEmoji(BUTTON_ICONS.close)
        .setStyle(ButtonStyle.Danger));
}
// ─── Action Row (Save, Edit, Delete) ──────────────────────────────────────────────
export function actionRow(prefix, options = {}) {
    const { showSave = true, showEdit = true, showDelete = true, showClose = false } = options;
    const buttons = [];
    if (showSave) {
        buttons.push(new ButtonBuilder()
            .setCustomId(`${prefix}_save`)
            .setLabel(BUTTON_LABELS.save)
            .setEmoji(BUTTON_ICONS.save)
            .setStyle(ButtonStyle.Success));
    }
    if (showEdit) {
        buttons.push(new ButtonBuilder()
            .setCustomId(`${prefix}_edit`)
            .setLabel(BUTTON_LABELS.edit)
            .setEmoji(BUTTON_ICONS.edit)
            .setStyle(ButtonStyle.Primary));
    }
    if (showDelete) {
        buttons.push(new ButtonBuilder()
            .setCustomId(`${prefix}_delete`)
            .setLabel(BUTTON_LABELS.delete)
            .setEmoji(BUTTON_ICONS.delete)
            .setStyle(ButtonStyle.Danger));
    }
    if (showClose) {
        buttons.push(new ButtonBuilder()
            .setCustomId(`${prefix}_close`)
            .setLabel(BUTTON_LABELS.close)
            .setEmoji(BUTTON_ICONS.close)
            .setStyle(ButtonStyle.Secondary));
    }
    return new ActionRowBuilder().addComponents(buttons);
}
// ─── Music Control Row ───────────────────────────────────────────────────────────
export function musicControlRow(guildId, state) {
    return new ActionRowBuilder().addComponents(new ButtonBuilder()
        .setCustomId(`music_previous:${guildId}`)
        .setEmoji(BUTTON_ICONS.previous)
        .setStyle(ButtonStyle.Secondary), new ButtonBuilder()
        .setCustomId(`music_pause:${guildId}`)
        .setEmoji(state.paused ? BUTTON_ICONS.play : BUTTON_ICONS.pause)
        .setStyle(state.paused ? ButtonStyle.Success : ButtonStyle.Primary), new ButtonBuilder()
        .setCustomId(`music_skip:${guildId}`)
        .setEmoji(BUTTON_ICONS.skip)
        .setStyle(ButtonStyle.Secondary), new ButtonBuilder()
        .setCustomId(`music_loop:${guildId}`)
        .setEmoji(BUTTON_ICONS.loop)
        .setStyle(state.loop !== 'none' ? ButtonStyle.Success : ButtonStyle.Secondary), new ButtonBuilder()
        .setCustomId(`music_stop:${guildId}`)
        .setEmoji(BUTTON_ICONS.stop)
        .setStyle(ButtonStyle.Danger));
}
// ─── Music Secondary Row (Queue, Shuffle, Volume, etc.) ───────────────────────────
export function musicSecondaryRow(guildId, state) {
    return new ActionRowBuilder().addComponents(new ButtonBuilder()
        .setCustomId(`music_voldown:${guildId}`)
        .setEmoji(BUTTON_ICONS.volumeDown)
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(state.volume <= 0), new ButtonBuilder()
        .setCustomId(`music_queue:${guildId}`)
        .setEmoji(BUTTON_ICONS.queue)
        .setStyle(ButtonStyle.Secondary), new ButtonBuilder()
        .setCustomId(`music_shuffle:${guildId}`)
        .setEmoji(BUTTON_ICONS.shuffle)
        .setStyle(state.shuffle ? ButtonStyle.Success : ButtonStyle.Secondary), new ButtonBuilder()
        .setCustomId(`music_favorite:${guildId}`)
        .setEmoji(BUTTON_ICONS.favorite)
        .setStyle(ButtonStyle.Secondary), new ButtonBuilder()
        .setCustomId(`music_volup:${guildId}`)
        .setEmoji(BUTTON_ICONS.volumeUp)
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(state.volume >= 100));
}
// ─── Music Filter Row ─────────────────────────────────────────────────────────────
export function musicFilterRow(guildId) {
    return new ActionRowBuilder().addComponents(new ButtonBuilder()
        .setCustomId(`music_nightcore:${guildId}`)
        .setLabel('Nightcore')
        .setStyle(ButtonStyle.Secondary), new ButtonBuilder()
        .setCustomId(`music_bassboost:${guildId}`)
        .setLabel('Bassboost')
        .setStyle(ButtonStyle.Secondary), new ButtonBuilder()
        .setCustomId(`music_vaporwave:${guildId}`)
        .setLabel('Vaporwave')
        .setStyle(ButtonStyle.Secondary), new ButtonBuilder()
        .setCustomId(`music_reset:${guildId}`)
        .setLabel('Reset')
        .setStyle(ButtonStyle.Danger));
}
// ─── Dashboard Row ────────────────────────────────────────────────────────────────
export function dashboardRow(prefix, options = {}) {
    const { showSettings = true, showStatistics = true, showRefresh = true, showClose = true } = options;
    const buttons = [];
    if (showSettings) {
        buttons.push(new ButtonBuilder()
            .setCustomId(`${prefix}_settings`)
            .setLabel(BUTTON_LABELS.settings)
            .setEmoji(BUTTON_ICONS.settings)
            .setStyle(ButtonStyle.Primary));
    }
    if (showStatistics) {
        buttons.push(new ButtonBuilder()
            .setCustomId(`${prefix}_statistics`)
            .setLabel(BUTTON_LABELS.statistics)
            .setEmoji(BUTTON_ICONS.statistics)
            .setStyle(ButtonStyle.Secondary));
    }
    if (showRefresh) {
        buttons.push(new ButtonBuilder()
            .setCustomId(`${prefix}_refresh`)
            .setEmoji(BUTTON_ICONS.refresh)
            .setStyle(ButtonStyle.Secondary));
    }
    if (showClose) {
        buttons.push(new ButtonBuilder()
            .setCustomId(`${prefix}_close`)
            .setEmoji(BUTTON_ICONS.close)
            .setStyle(ButtonStyle.Danger));
    }
    return new ActionRowBuilder().addComponents(buttons);
}
// ─── Single Button Builder ───────────────────────────────────────────────────────
export function singleButton(customId, label, emoji, style = ButtonStyle.Primary, disabled = false) {
    const button = new ButtonBuilder()
        .setCustomId(customId)
        .setStyle(style)
        .setDisabled(disabled);
    if (label)
        button.setLabel(label);
    if (emoji)
        button.setEmoji(emoji);
    return button;
}
// ─── Link Button ──────────────────────────────────────────────────────────────────
export function linkButton(label, url, emoji) {
    const button = new ButtonBuilder()
        .setLabel(label)
        .setURL(url)
        .setStyle(ButtonStyle.Link);
    if (emoji)
        button.setEmoji(emoji);
    return button;
}
// ─── Premium Button ───────────────────────────────────────────────────────────────
export function premiumButton(customId, label = BUTTON_LABELS.premium) {
    return new ButtonBuilder()
        .setCustomId(customId)
        .setLabel(label)
        .setEmoji(BUTTON_ICONS.premium)
        .setStyle(ButtonStyle.Success);
}
// ─── Favorite Button ─────────────────────────────────────────────────────────────
export function favoriteButton(customId, isFavorite) {
    return new ButtonBuilder()
        .setCustomId(customId)
        .setEmoji(BUTTON_ICONS.favorite)
        .setStyle(isFavorite ? ButtonStyle.Success : ButtonStyle.Secondary);
}
// ─── Disable All Buttons in Row ───────────────────────────────────────────────────
export function disableRow(row) {
    const newRow = new ActionRowBuilder();
    for (const component of row.components) {
        newRow.addComponents(ButtonBuilder.from(component.toJSON()).setDisabled(true));
    }
    return newRow;
}
// ─── Export Button Manager ─────────────────────────────────────────────────────────
export const ButtonManager = {
    navigation: navigationRow,
    confirmation: confirmationRow,
    yesNo: yesNoRow,
    close: closeRow,
    action: actionRow,
    musicControl: musicControlRow,
    musicSecondary: musicSecondaryRow,
    musicFilter: musicFilterRow,
    dashboard: dashboardRow,
    single: singleButton,
    link: linkButton,
    premium: premiumButton,
    favorite: favoriteButton,
    disable: disableRow,
    icons: BUTTON_ICONS,
    labels: BUTTON_LABELS,
};
//# sourceMappingURL=ButtonManager.js.map