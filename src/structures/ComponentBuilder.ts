// @ts-nocheck
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from 'discord.js';

export class ComponentBuilder {
  public static confirmRow(
    confirmId: string,
    cancelId: string,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel'
  ): ActionRowBuilder<ButtonBuilder> {
    return new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId(confirmId).setLabel(confirmLabel).setStyle(ButtonStyle.Success).setEmoji('✅'),
      new ButtonBuilder().setCustomId(cancelId).setLabel(cancelLabel).setStyle(ButtonStyle.Danger).setEmoji('❌'),
    );
  }

  public static yesNoRow(yesId: string, noId: string): ActionRowBuilder<ButtonBuilder> {
    return new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId(yesId).setLabel('Yes').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId(noId).setLabel('No').setStyle(ButtonStyle.Danger),
    );
  }

  public static paginationRow(
    prevId: string,
    nextId: string,
    current: number,
    total: number,
    disabled = false
  ): ActionRowBuilder<ButtonBuilder> {
    return new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId(prevId).setLabel('◀ Previous').setStyle(ButtonStyle.Secondary).setDisabled(disabled || current <= 1),
      new ButtonBuilder().setCustomId(`page_${current}`).setLabel(`${current} / ${total}`).setStyle(ButtonStyle.Primary).setDisabled(true),
      new ButtonBuilder().setCustomId(nextId).setLabel('Next ▶').setStyle(ButtonStyle.Secondary).setDisabled(disabled || current >= total),
    );
  }

  public static musicControlRow(guildId: string, paused = false, loop: 'none' | 'track' | 'queue' = 'none'): ActionRowBuilder<ButtonBuilder> {
    return new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId(`music_prev:${guildId}`).setEmoji('⏮️').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId(`music_pause:${guildId}`).setEmoji(paused ? '▶️' : '⏸️').setStyle(paused ? ButtonStyle.Success : ButtonStyle.Primary),
      new ButtonBuilder().setCustomId(`music_skip:${guildId}`).setEmoji('⏭️').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId(`music_loop:${guildId}`).setEmoji('🔁').setStyle(loop !== 'none' ? ButtonStyle.Success : ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId(`music_stop:${guildId}`).setEmoji('⏹️').setStyle(ButtonStyle.Danger),
    );
  }

  public static musicVolumeRow(guildId: string): ActionRowBuilder<ButtonBuilder> {
    return new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId(`music_voldown:${guildId}`).setEmoji('🔉').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId(`music_queue:${guildId}`).setEmoji('📋').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId(`music_save:${guildId}`).setEmoji('⭐').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId(`music_shuffle:${guildId}`).setEmoji('🔀').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId(`music_volup:${guildId}`).setEmoji('🔊').setStyle(ButtonStyle.Secondary),
    );
  }

  public static selectMenu(
    customId: string,
    placeholder: string,
    options: { label: string; value: string; description?: string; emoji?: string }[]
  ): ActionRowBuilder<StringSelectMenuBuilder> {
    const menu = new StringSelectMenuBuilder()
      .setCustomId(customId)
      .setPlaceholder(placeholder)
      .addOptions(
        options.map(opt =>
          new StringSelectMenuOptionBuilder()
            .setLabel(opt.label)
            .setValue(opt.value)
            .setDescription(opt.description || '')
            .setEmoji(opt.emoji || '📌')
        )
      );
    return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu);
  }

  public static disabledRow(row: ActionRowBuilder<ButtonBuilder>): ActionRowBuilder<ButtonBuilder> {
    const newRow = new ActionRowBuilder<ButtonBuilder>();
    for (const comp of row.components) {
      newRow.addComponents(ButtonBuilder.from(comp.toJSON() as any).setDisabled(true));
    }
    return newRow;
  }
}
