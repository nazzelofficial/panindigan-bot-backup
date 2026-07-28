// @ts-nocheck
/**
 * ═══════════════════════════════════════════════════
 *  Panindigan Premium Embed System
 *  Reusable, consistent, modern embed builders
 * ═══════════════════════════════════════════════════
 */

import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  ComponentType,
  Message,
  ChatInputCommandInteraction,
  MessageComponentInteraction,
} from 'discord.js';

// ─── Color Palette ────────────────────────────────────────────────────────────
export const PALETTE = {
  primary:    0x5865F2, // Discord blurple
  success:    0x57F287, // Green
  error:      0xED4245, // Red
  warning:    0xFEE75C, // Yellow
  info:       0x5865F2, // Blurple
  music:      0xEB459E, // Pink
  economy:    0xF1C40F, // Gold
  leveling:   0x3498DB, // Blue
  moderation: 0xE74C3C, // Dark Red
  admin:      0x9B59B6, // Purple
  premium:    0xFFD700, // Gold
  ai:         0x00ADB5, // Teal
  fun:        0xFF6B6B, // Coral
  games:      0x2ECC71, // Emerald
  social:     0x1ABC9C, // Turquoise
  utility:    0x95A5A6, // Gray
  dark:       0x2F3136, // Discord dark
  log:        0x7289DA, // Discord log
} as const;

// ─── Emoji Kit ────────────────────────────────────────────────────────────────
export const KIT = {
  success:    '✅',
  error:      '❌',
  warning:    '⚠️',
  info:       'ℹ️',
  loading:    '⏳',
  arrow:      '➜',
  dot:        '•',
  line:       '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
  music:      '🎵',
  economy:    '💰',
  leveling:   '📈',
  mod:        '🛡️',
  admin:      '👑',
  premium:    '💎',
  ai:         '🤖',
  fun:        '🎉',
  games:      '🎮',
  social:     '🌐',
  utility:    '🔧',
  ping:       '📶',
  server:     '🏠',
  user:       '👤',
  bot:        '🤖',
  time:       '🕐',
  globe:      '🌍',
  chart:      '📊',
  refresh:    '🔄',
  star:       '⭐',
  link:       '🔗',
  shield:     '🛡️',
  lock:       '🔒',
  unlock:     '🔓',
  crown:      '👑',
  gem:        '💎',
  fire:       '🔥',
  sparkle:    '✨',
  check:      '☑️',
  cross:      '✖️',
  up:         '🔺',
  down:       '🔻',
  inbox:      '📥',
  outbox:     '📤',
} as const;

// ─── Base embed helper ────────────────────────────────────────────────────────
function base(color: number): EmbedBuilder {
  return new EmbedBuilder().setColor(color).setTimestamp();
}

// ─── Success ──────────────────────────────────────────────────────────────────
export function successEmbed(title: string, description: string, footer?: string): EmbedBuilder {
  const e = base(PALETTE.success)
    .setTitle(`${KIT.success} ${title}`)
    .setDescription(description);
  if (footer) e.setFooter({ text: footer });
  return e;
}

// ─── Error ────────────────────────────────────────────────────────────────────
export function errorEmbed(title: string, description: string, footer?: string): EmbedBuilder {
  const e = base(PALETTE.error)
    .setTitle(`${KIT.error} ${title}`)
    .setDescription(description);
  if (footer) e.setFooter({ text: footer });
  return e;
}

// ─── Warning ─────────────────────────────────────────────────────────────────
export function warningEmbed(title: string, description: string): EmbedBuilder {
  return base(PALETTE.warning)
    .setTitle(`${KIT.warning} ${title}`)
    .setDescription(description);
}

// ─── Info ─────────────────────────────────────────────────────────────────────
export function infoEmbed(title: string, description: string): EmbedBuilder {
  return base(PALETTE.info)
    .setTitle(`${KIT.info} ${title}`)
    .setDescription(description);
}

// ─── Loading ──────────────────────────────────────────────────────────────────
export function loadingEmbed(action: string): EmbedBuilder {
  return base(PALETTE.primary)
    .setDescription(`${KIT.loading} **${action}**\n*Please wait...*`);
}

// ─── Confirmation ─────────────────────────────────────────────────────────────
export function confirmEmbed(title: string, description: string): EmbedBuilder {
  return base(PALETTE.warning)
    .setTitle(`${KIT.warning} ${title}`)
    .setDescription(`${description}\n\n*This action cannot be undone.*`);
}

// ─── Moderation ───────────────────────────────────────────────────────────────
export function modEmbed(title: string, fields: { name: string; value: string; inline?: boolean }[]): EmbedBuilder {
  return base(PALETTE.moderation)
    .setTitle(`${KIT.mod} ${title}`)
    .addFields(fields);
}

// ─── Economy ──────────────────────────────────────────────────────────────────
export function economyEmbed(title: string, description: string): EmbedBuilder {
  return base(PALETTE.economy)
    .setTitle(`${KIT.economy} ${title}`)
    .setDescription(description);
}

// ─── Leveling ─────────────────────────────────────────────────────────────────
export function levelingEmbed(title: string, description: string): EmbedBuilder {
  return base(PALETTE.leveling)
    .setTitle(`${KIT.leveling} ${title}`)
    .setDescription(description);
}

// ─── Premium ──────────────────────────────────────────────────────────────────
export function premiumEmbed(title: string, description: string): EmbedBuilder {
  return base(PALETTE.premium)
    .setTitle(`${KIT.premium} ${title}`)
    .setDescription(description);
}

// ─── AI ───────────────────────────────────────────────────────────────────────
export function aiEmbed(title: string, description: string): EmbedBuilder {
  return base(PALETTE.ai)
    .setTitle(`${KIT.ai} ${title}`)
    .setDescription(description);
}

// ─── Music ────────────────────────────────────────────────────────────────────
export function musicEmbed(title: string, description: string): EmbedBuilder {
  return base(PALETTE.music)
    .setTitle(`${KIT.music} ${title}`)
    .setDescription(description);
}

// ─── Utility ──────────────────────────────────────────────────────────────────
export function utilityEmbed(title: string, description?: string): EmbedBuilder {
  const e = base(PALETTE.utility).setTitle(`${KIT.utility} ${title}`);
  if (description) e.setDescription(description);
  return e;
}

// ─── User ─────────────────────────────────────────────────────────────────────
export function userEmbed(title: string, description?: string): EmbedBuilder {
  const e = base(PALETTE.primary).setTitle(`${KIT.user} ${title}`);
  if (description) e.setDescription(description);
  return e;
}

// ─── Server ───────────────────────────────────────────────────────────────────
export function serverEmbed(title: string, description?: string): EmbedBuilder {
  const e = base(PALETTE.primary).setTitle(`${KIT.server} ${title}`);
  if (description) e.setDescription(description);
  return e;
}

// ─── Log ──────────────────────────────────────────────────────────────────────
export function logEmbed(title: string, description: string): EmbedBuilder {
  return base(PALETTE.log)
    .setTitle(title)
    .setDescription(description);
}

// ─── Generic category embed ───────────────────────────────────────────────────
export function categoryEmbed(category: keyof typeof PALETTE, title: string, description?: string): EmbedBuilder {
  const color = PALETTE[category] ?? PALETTE.primary;
  const e = new EmbedBuilder().setColor(color).setTimestamp().setTitle(title);
  if (description) e.setDescription(description);
  return e;
}

// ─── Section divider (used inside descriptions) ───────────────────────────────
export function section(title: string, lines: string[]): string {
  const body = lines.map(l => `${KIT.dot} ${l}`).join('\n');
  return `**${title}**\n${body}`;
}

export function divider(): string {
  return `\`${KIT.line}\``;
}

// ─── Standard button row ──────────────────────────────────────────────────────
export function paginationRow(page: number, total: number, prefix: string): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`${prefix}_first`)
      .setEmoji('⏮️')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(page === 0),
    new ButtonBuilder()
      .setCustomId(`${prefix}_prev`)
      .setEmoji('⬅️')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(page === 0),
    new ButtonBuilder()
      .setCustomId(`${prefix}_page`)
      .setLabel(`${page + 1} / ${total}`)
      .setStyle(ButtonStyle.Primary)
      .setDisabled(true),
    new ButtonBuilder()
      .setCustomId(`${prefix}_next`)
      .setEmoji('➡️')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(page >= total - 1),
    new ButtonBuilder()
      .setCustomId(`${prefix}_close`)
      .setEmoji('❌')
      .setStyle(ButtonStyle.Danger),
  );
}

// ─── Confirm/Cancel row ───────────────────────────────────────────────────────
export function confirmRow(prefix: string): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`${prefix}_confirm`)
      .setLabel('Confirm')
      .setEmoji('✅')
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId(`${prefix}_cancel`)
      .setLabel('Cancel')
      .setEmoji('❌')
      .setStyle(ButtonStyle.Danger),
  );
}

// ─── Close button row ─────────────────────────────────────────────────────────
export function closeRow(prefix: string): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`${prefix}_close`)
      .setLabel('Close')
      .setEmoji('❌')
      .setStyle(ButtonStyle.Danger),
  );
}

// ─── Pagination helper ────────────────────────────────────────────────────────
/**
 * Sends a paginated embed response.
 * @param source   Interaction or Message to reply to
 * @param pages    Array of EmbedBuilders (one per page)
 * @param prefix   Unique prefix for button custom IDs
 * @param timeout  Button timeout in ms (default 60000)
 */
export async function paginate(
  source: ChatInputCommandInteraction | Message,
  pages: EmbedBuilder[],
  prefix: string,
  timeout = 60_000,
): Promise<void> {
  if (pages.length === 0) return;
  if (pages.length === 1) {
    if (source instanceof Message) {
      await source.reply({ embeds: [pages[0]] });
    } else {
      await source.reply({ embeds: [pages[0]] });
    }
    return;
  }

  let page = 0;
  const row = () => paginationRow(page, pages.length, prefix);

  const send = async () => ({
    embeds: [pages[page]],
    components: [row()],
  });

  let msg: Message;
  if (source instanceof Message) {
    msg = await source.reply(await send());
  } else {
    await source.reply(await send());
    msg = await source.fetchReply() as Message;
  }

  const collector = msg.createMessageComponentCollector({
    componentType: ComponentType.Button,
    time: timeout,
    filter: (i) => {
      const userId = source instanceof Message ? source.author.id : source.user.id;
      if (i.user.id !== userId) {
        i.reply({ content: `${KIT.error} This menu is not for you.`, ephemeral: true });
        return false;
      }
      return true;
    },
  });

  collector.on('collect', async (i: MessageComponentInteraction) => {
    const action = i.customId.replace(`${prefix}_`, '');
    if (action === 'first') page = 0;
    else if (action === 'prev') page = Math.max(0, page - 1);
    else if (action === 'next') page = Math.min(pages.length - 1, page + 1);
    else if (action === 'close') {
      collector.stop('closed');
      await i.update({ embeds: [pages[page]], components: [] });
      return;
    }
    await i.update(await send());
  });

  collector.on('end', async (_, reason) => {
    if (reason !== 'closed') {
      try {
        await msg.edit({ components: [] });
      } catch {}
    }
  });
}
