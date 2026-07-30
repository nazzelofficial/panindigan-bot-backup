// @ts-nocheck
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from 'discord.js';

export class ComponentBuilder {
  // ─── Confirm / Cancel ──────────────────────────────────────────────────────
  public static confirmRow(
    confirmId: string,
    cancelId: string,
    confirmLabel = 'Confirm',
    cancelLabel  = 'Cancel',
  ): ActionRowBuilder<ButtonBuilder> {
    return new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId(confirmId).setLabel(confirmLabel).setStyle(ButtonStyle.Success).setEmoji('✅'),
      new ButtonBuilder().setCustomId(cancelId).setLabel(cancelLabel).setStyle(ButtonStyle.Danger).setEmoji('❌'),
    );
  }

  // ─── Yes / No ─────────────────────────────────────────────────────────────
  public static yesNoRow(yesId: string, noId: string): ActionRowBuilder<ButtonBuilder> {
    return new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId(yesId).setLabel('Yes').setStyle(ButtonStyle.Success).setEmoji('✅'),
      new ButtonBuilder().setCustomId(noId).setLabel('No').setStyle(ButtonStyle.Danger).setEmoji('❌'),
    );
  }

  // ─── Dismiss ─────────────────────────────────────────────────────────────
  /** Single button that a user presses to dismiss/delete an ephemeral-style response. */
  public static dismissRow(id: string, label = 'Dismiss'): ActionRowBuilder<ButtonBuilder> {
    return new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId(id).setLabel(label).setStyle(ButtonStyle.Secondary).setEmoji('✖️'),
    );
  }

  // ─── Close ────────────────────────────────────────────────────────────────
  public static closeRow(id: string, label = 'Close'): ActionRowBuilder<ButtonBuilder> {
    return new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId(id).setLabel(label).setStyle(ButtonStyle.Danger).setEmoji('❌'),
    );
  }

  // ─── Link Button ─────────────────────────────────────────────────────────
  /** Single external-link button. */
  public static linkRow(label: string, url: string, emoji?: string): ActionRowBuilder<ButtonBuilder> {
    const btn = new ButtonBuilder().setLabel(label).setStyle(ButtonStyle.Link).setURL(url);
    if (emoji) btn.setEmoji(emoji);
    return new ActionRowBuilder<ButtonBuilder>().addComponents(btn);
  }

  // ─── Support + Invite row ─────────────────────────────────────────────────
  /** Error recovery row — links to support server and optionally invite. */
  public static errorActionRow(
    supportUrl = 'https://discord.gg/panindigan',
    inviteUrl?: string,
  ): ActionRowBuilder<ButtonBuilder> {
    const components = [
      new ButtonBuilder().setLabel('Support Server').setStyle(ButtonStyle.Link).setURL(supportUrl).setEmoji('🆘'),
    ];
    if (inviteUrl) {
      components.push(
        new ButtonBuilder().setLabel('Invite Bot').setStyle(ButtonStyle.Link).setURL(inviteUrl).setEmoji('🤖'),
      );
    }
    return new ActionRowBuilder<ButtonBuilder>().addComponents(components);
  }

  // ─── Basic Pagination ─────────────────────────────────────────────────────
  public static paginationRow(
    prevId:   string,
    nextId:   string,
    current:  number,
    total:    number,
    disabled  = false,
  ): ActionRowBuilder<ButtonBuilder> {
    return new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(prevId)
        .setEmoji('◀️')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(disabled || current <= 1),
      new ButtonBuilder()
        .setCustomId(`page_info_${current}`)
        .setLabel(`${current} / ${total}`)
        .setStyle(ButtonStyle.Primary)
        .setDisabled(true),
      new ButtonBuilder()
        .setCustomId(nextId)
        .setEmoji('▶️')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(disabled || current >= total),
    );
  }

  // ─── Full Pagination (with first / last) ──────────────────────────────────
  public static fullPaginationRow(
    firstId:  string,
    prevId:   string,
    nextId:   string,
    lastId:   string,
    current:  number,
    total:    number,
    disabled  = false,
  ): ActionRowBuilder<ButtonBuilder> {
    return new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(firstId)
        .setEmoji('⏮️')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(disabled || current <= 1),
      new ButtonBuilder()
        .setCustomId(prevId)
        .setEmoji('◀️')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(disabled || current <= 1),
      new ButtonBuilder()
        .setCustomId(`page_info_${current}`)
        .setLabel(`${current} / ${total}`)
        .setStyle(ButtonStyle.Primary)
        .setDisabled(true),
      new ButtonBuilder()
        .setCustomId(nextId)
        .setEmoji('▶️')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(disabled || current >= total),
      new ButtonBuilder()
        .setCustomId(lastId)
        .setEmoji('⏭️')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(disabled || current >= total),
    );
  }

  // ─── Music Controls (row 1 — main transport) ──────────────────────────────
  public static musicControlRow(
    guildId: string,
    paused   = false,
    loop: 'none' | 'track' | 'queue' = 'none',
  ): ActionRowBuilder<ButtonBuilder> {
    const loopStyle =
      loop === 'track' ? ButtonStyle.Success :
      loop === 'queue' ? ButtonStyle.Primary  :
      ButtonStyle.Secondary;
    const loopEmoji = loop === 'track' ? '🔂' : '🔁';

    return new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId(`music_prev:${guildId}`).setEmoji('⏮️').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId(`music_pause:${guildId}`)
        .setEmoji(paused ? '▶️' : '⏸️')
        .setStyle(paused ? ButtonStyle.Success : ButtonStyle.Primary),
      new ButtonBuilder().setCustomId(`music_skip:${guildId}`).setEmoji('⏭️').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId(`music_loop:${guildId}`).setEmoji(loopEmoji).setStyle(loopStyle),
      new ButtonBuilder().setCustomId(`music_stop:${guildId}`).setEmoji('⏹️').setStyle(ButtonStyle.Danger),
    );
  }

  // ─── Music Controls (row 2 — extras) ─────────────────────────────────────
  public static musicVolumeRow(guildId: string): ActionRowBuilder<ButtonBuilder> {
    return new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId(`music_voldown:${guildId}`).setEmoji('🔉').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId(`music_queue:${guildId}`).setEmoji('📋').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId(`music_save:${guildId}`).setEmoji('⭐').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId(`music_shuffle:${guildId}`).setEmoji('🔀').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId(`music_volup:${guildId}`).setEmoji('🔊').setStyle(ButtonStyle.Secondary),
    );
  }

  // ─── Select Menu ─────────────────────────────────────────────────────────
  public static selectMenu(
    customId:    string,
    placeholder: string,
    options: { label: string; value: string; description?: string; emoji?: string; default?: boolean }[],
    minValues = 1,
    maxValues = 1,
  ): ActionRowBuilder<StringSelectMenuBuilder> {
    const menu = new StringSelectMenuBuilder()
      .setCustomId(customId)
      .setPlaceholder(placeholder)
      .setMinValues(minValues)
      .setMaxValues(maxValues)
      .addOptions(
        options.map(opt => {
          const o = new StringSelectMenuOptionBuilder()
            .setLabel(opt.label)
            .setValue(opt.value);
          if (opt.description) o.setDescription(opt.description);
          if (opt.emoji)       o.setEmoji(opt.emoji);
          if (opt.default)     o.setDefault(true);
          return o;
        }),
      );
    return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu);
  }

  // ─── Disable all buttons in a row ────────────────────────────────────────
  public static disabledRow(row: ActionRowBuilder<ButtonBuilder>): ActionRowBuilder<ButtonBuilder> {
    const newRow = new ActionRowBuilder<ButtonBuilder>();
    for (const comp of row.components) {
      newRow.addComponents(ButtonBuilder.from(comp.toJSON() as any).setDisabled(true));
    }
    return newRow;
  }
}
