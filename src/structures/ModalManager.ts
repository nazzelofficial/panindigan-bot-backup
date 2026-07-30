/**
 * ═══════════════════════════════════════════════════
 *  Panindigan Premium Modal Manager
 *  Professional modal system for user input
 * ═══════════════════════════════════════════════════
 */

import {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} from 'discord.js';

// ─── Modal Input Options ─────────────────────────────────────────────────────────
export interface ModalInput {
  customId: string;
  label: string;
  placeholder?: string;
  style?: TextInputStyle;
  value?: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
}

// ─── Base Modal Builder ────────────────────────────────────────────────────────────
function baseModal(
  customId: string,
  title: string,
  inputs: ModalInput[]
): ModalBuilder {
  const modal = new ModalBuilder()
    .setCustomId(customId)
    .setTitle(title);

  for (const input of inputs) {
    const textInput = new TextInputBuilder()
      .setCustomId(input.customId)
      .setLabel(input.label)
      .setStyle(input.style || TextInputStyle.Short)
      .setRequired(input.required ?? true);

    if (input.placeholder) textInput.setPlaceholder(input.placeholder);
    if (input.value) textInput.setValue(input.value);
    if (input.minLength) textInput.setMinLength(input.minLength);
    if (input.maxLength) textInput.setMaxLength(input.maxLength);

    modal.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(textInput));
  }

  return modal;
}

// ─── AI Prompt Modal ───────────────────────────────────────────────────────────────
export function aiPromptModal(customId: string, prompt?: string): ModalBuilder {
  return baseModal(customId, '🤖 AI Prompt', [
    {
      customId: 'prompt',
      label: 'Enter your prompt',
      placeholder: 'What would you like to ask?',
      style: TextInputStyle.Paragraph,
      value: prompt,
      required: true,
      minLength: 1,
      maxLength: 4000,
    },
  ]);
}

// ─── Translate Modal ──────────────────────────────────────────────────────────────
export function translateModal(customId: string): ModalBuilder {
  return baseModal(customId, '🌍 Translate', [
    {
      customId: 'text',
      label: 'Text to translate',
      placeholder: 'Enter the text you want to translate',
      style: TextInputStyle.Paragraph,
      required: true,
      minLength: 1,
      maxLength: 4000,
    },
    {
      customId: 'target_language',
      label: 'Target language',
      placeholder: 'e.g., Spanish, French, Japanese',
      style: TextInputStyle.Short,
      required: true,
      minLength: 1,
      maxLength: 50,
    },
  ]);
}

// ─── Rewrite Modal ────────────────────────────────────────────────────────────────
export function rewriteModal(customId: string, text?: string): ModalBuilder {
  return baseModal(customId, '✏️ Rewrite', [
    {
      customId: 'text',
      label: 'Text to rewrite',
      placeholder: 'Enter the text you want to rewrite',
      style: TextInputStyle.Paragraph,
      value: text,
      required: true,
      minLength: 1,
      maxLength: 4000,
    },
    {
      customId: 'style',
      label: 'Rewrite style',
      placeholder: 'e.g., professional, casual, formal',
      style: TextInputStyle.Short,
      required: false,
      maxLength: 100,
    },
  ]);
}

// ─── Summarize Modal ─────────────────────────────────────────────────────────────
export function summarizeModal(customId: string, text?: string): ModalBuilder {
  return baseModal(customId, '📝 Summarize', [
    {
      customId: 'text',
      label: 'Text to summarize',
      placeholder: 'Enter the text you want to summarize',
      style: TextInputStyle.Paragraph,
      value: text,
      required: true,
      minLength: 1,
      maxLength: 4000,
    },
    {
      customId: 'length',
      label: 'Summary length',
      placeholder: 'e.g., short, medium, detailed',
      style: TextInputStyle.Short,
      required: false,
      maxLength: 50,
    },
  ]);
}

// ─── Announcement Modal ─────────────────────────────────────────────────────────────
export function announcementModal(customId: string): ModalBuilder {
  return baseModal(customId, '📢 Announcement', [
    {
      customId: 'title',
      label: 'Announcement title',
      placeholder: 'Enter the announcement title',
      style: TextInputStyle.Short,
      required: true,
      minLength: 1,
      maxLength: 256,
    },
    {
      customId: 'content',
      label: 'Announcement content',
      placeholder: 'Enter the announcement content',
      style: TextInputStyle.Paragraph,
      required: true,
      minLength: 1,
      maxLength: 4000,
    },
    {
      customId: 'image_url',
      label: 'Image URL (optional)',
      placeholder: 'https://example.com/image.png',
      style: TextInputStyle.Short,
      required: false,
      maxLength: 512,
    },
  ]);
}

// ─── Warn Modal ───────────────────────────────────────────────────────────────────
export function warnModal(customId: string, reason?: string): ModalBuilder {
  return baseModal(customId, '⚠️ Warn User', [
    {
      customId: 'reason',
      label: 'Warning reason',
      placeholder: 'Enter the reason for this warning',
      style: TextInputStyle.Paragraph,
      value: reason,
      required: true,
      minLength: 1,
      maxLength: 1000,
    },
  ]);
}

// ─── Ban Modal ────────────────────────────────────────────────────────────────────
export function banModal(customId: string, reason?: string, deleteDays?: string): ModalBuilder {
  return baseModal(customId, '🔨 Ban User', [
    {
      customId: 'reason',
      label: 'Ban reason',
      placeholder: 'Enter the reason for this ban',
      style: TextInputStyle.Paragraph,
      value: reason,
      required: true,
      minLength: 1,
      maxLength: 1000,
    },
    {
      customId: 'delete_days',
      label: 'Delete message days (0-7)',
      placeholder: 'Number of days of messages to delete',
      style: TextInputStyle.Short,
      value: deleteDays || '0',
      required: true,
      minLength: 1,
      maxLength: 1,
    },
  ]);
}

// ─── Timeout Modal ─────────────────────────────────────────────────────────────────
export function timeoutModal(customId: string, reason?: string, duration?: string): ModalBuilder {
  return baseModal(customId, '⏰ Timeout User', [
    {
      customId: 'reason',
      label: 'Timeout reason',
      placeholder: 'Enter the reason for this timeout',
      style: TextInputStyle.Paragraph,
      value: reason,
      required: true,
      minLength: 1,
      maxLength: 1000,
    },
    {
      customId: 'duration',
      label: 'Duration (minutes)',
      placeholder: 'Enter timeout duration in minutes',
      style: TextInputStyle.Short,
      value: duration || '60',
      required: true,
      minLength: 1,
      maxLength: 4,
    },
  ]);
}

// ─── Nickname Modal ──────────────────────────────────────────────────────────────
export function nicknameModal(customId: string, currentNickname?: string): ModalBuilder {
  return baseModal(customId, '🏷️ Set Nickname', [
    {
      customId: 'nickname',
      label: 'New nickname',
      placeholder: 'Enter the new nickname',
      style: TextInputStyle.Short,
      value: currentNickname,
      required: true,
      minLength: 1,
      maxLength: 32,
    },
  ]);
}

// ─── Embed Builder Modal ───────────────────────────────────────────────────────────
export function embedBuilderModal(customId: string): ModalBuilder {
  return baseModal(customId, '🎨 Embed Builder', [
    {
      customId: 'title',
      label: 'Embed title',
      placeholder: 'Enter the embed title',
      style: TextInputStyle.Short,
      required: false,
      maxLength: 256,
    },
    {
      customId: 'description',
      label: 'Embed description',
      placeholder: 'Enter the embed description',
      style: TextInputStyle.Paragraph,
      required: false,
      maxLength: 4096,
    },
    {
      customId: 'color',
      label: 'Color (hex)',
      placeholder: 'e.g., #5865F2',
      style: TextInputStyle.Short,
      required: false,
      maxLength: 7,
    },
    {
      customId: 'footer',
      label: 'Footer text',
      placeholder: 'Enter the footer text',
      style: TextInputStyle.Short,
      required: false,
      maxLength: 2048,
    },
  ]);
}

// ─── Music Search Modal ───────────────────────────────────────────────────────────
export function musicSearchModal(customId: string, query?: string): ModalBuilder {
  return baseModal(customId, '🎵 Music Search', [
    {
      customId: 'query',
      label: 'Search query',
      placeholder: 'Enter song name or URL',
      style: TextInputStyle.Short,
      value: query,
      required: true,
      minLength: 1,
      maxLength: 200,
    },
  ]);
}

// ─── Playlist URL Modal ────────────────────────────────────────────────────────────
export function playlistUrlModal(customId: string): ModalBuilder {
  return baseModal(customId, '📜 Playlist URL', [
    {
      customId: 'url',
      label: 'Playlist URL',
      placeholder: 'Enter the playlist URL (Spotify, YouTube, etc.)',
      style: TextInputStyle.Short,
      required: true,
      minLength: 1,
      maxLength: 512,
    },
  ]);
}

// ─── Seek Modal ───────────────────────────────────────────────────────────────────
export function seekModal(customId: string): ModalBuilder {
  return baseModal(customId, '⏩ Seek', [
    {
      customId: 'position',
      label: 'Seek position (seconds)',
      placeholder: 'Enter position in seconds',
      style: TextInputStyle.Short,
      required: true,
      minLength: 1,
      maxLength: 10,
    },
  ]);
}

// ─── Jump Modal ───────────────────────────────────────────────────────────────────
export function jumpModal(customId: string): ModalBuilder {
  return baseModal(customId, '⏭️ Jump to Track', [
    {
      customId: 'index',
      label: 'Track index',
      placeholder: 'Enter the track number to jump to',
      style: TextInputStyle.Short,
      required: true,
      minLength: 1,
      maxLength: 5,
    },
  ]);
}

// ─── Volume Modal ──────────────────────────────────────────────────────────────────
export function volumeModal(customId: string, currentVolume?: number): ModalBuilder {
  return baseModal(customId, '🔊 Set Volume', [
    {
      customId: 'volume',
      label: 'Volume (0-100)',
      placeholder: 'Enter volume level (0-100)',
      style: TextInputStyle.Short,
      value: currentVolume?.toString(),
      required: true,
      minLength: 1,
      maxLength: 3,
    },
  ]);
}

// ─── Reminder Modal ───────────────────────────────────────────────────────────────
export function reminderModal(customId: string): ModalBuilder {
  return baseModal(customId, '⏰ Set Reminder', [
    {
      customId: 'content',
      label: 'Reminder content',
      placeholder: 'What do you want to be reminded about?',
      style: TextInputStyle.Paragraph,
      required: true,
      minLength: 1,
      maxLength: 1000,
    },
    {
      customId: 'time',
      label: 'Time',
      placeholder: 'e.g., 1h, 30m, tomorrow 9am',
      style: TextInputStyle.Short,
      required: true,
      minLength: 1,
      maxLength: 50,
    },
  ]);
}

// ─── Poll Modal ───────────────────────────────────────────────────────────────────
export function pollModal(customId: string): ModalBuilder {
  return baseModal(customId, '📊 Create Poll', [
    {
      customId: 'question',
      label: 'Poll question',
      placeholder: 'What do you want to ask?',
      style: TextInputStyle.Short,
      required: true,
      minLength: 1,
      maxLength: 300,
    },
    {
      customId: 'options',
      label: 'Options (comma-separated)',
      placeholder: 'Option 1, Option 2, Option 3',
      style: TextInputStyle.Paragraph,
      required: true,
      minLength: 1,
      maxLength: 1000,
    },
    {
      customId: 'duration',
      label: 'Duration (minutes)',
      placeholder: 'How long should the poll last?',
      style: TextInputStyle.Short,
      required: false,
      maxLength: 5,
    },
  ]);
}

// ─── Suggestion Modal ─────────────────────────────────────────────────────────────
export function suggestionModal(customId: string): ModalBuilder {
  return baseModal(customId, '💡 Suggestion', [
    {
      customId: 'suggestion',
      label: 'Your suggestion',
      placeholder: 'What would you like to suggest?',
      style: TextInputStyle.Paragraph,
      required: true,
      minLength: 1,
      maxLength: 1000,
    },
  ]);
}

// ─── Ticket Reason Modal ─────────────────────────────────────────────────────────
export function ticketReasonModal(customId: string): ModalBuilder {
  return baseModal(customId, '🎫 Ticket Reason', [
    {
      customId: 'reason',
      label: 'Ticket reason',
      placeholder: 'Why are you opening this ticket?',
      style: TextInputStyle.Paragraph,
      required: true,
      minLength: 1,
      maxLength: 1000,
    },
  ]);
}

// ─── Welcome Message Modal ─────────────────────────────────────────────────────────
export function welcomeMessageModal(customId: string, currentMessage?: string): ModalBuilder {
  return baseModal(customId, '👋 Welcome Message', [
    {
      customId: 'message',
      label: 'Welcome message',
      placeholder: 'Enter the welcome message (use {user} for mention)',
      style: TextInputStyle.Paragraph,
      value: currentMessage,
      required: true,
      minLength: 1,
      maxLength: 2000,
    },
  ]);
}

// ─── Goodbye Message Modal ────────────────────────────────────────────────────────
export function goodbyeMessageModal(customId: string, currentMessage?: string): ModalBuilder {
  return baseModal(customId, '👋 Goodbye Message', [
    {
      customId: 'message',
      label: 'Goodbye message',
      placeholder: 'Enter the goodbye message (use {user} for mention)',
      style: TextInputStyle.Paragraph,
      value: currentMessage,
      required: true,
      minLength: 1,
      maxLength: 2000,
    },
  ]);
}

// ─── Verification Modal ────────────────────────────────────────────────────────────
export function verificationModal(customId: string): ModalBuilder {
  return baseModal(customId, '✅ Verification', [
    {
      customId: 'code',
      label: 'Verification code',
      placeholder: 'Enter the verification code',
      style: TextInputStyle.Short,
      required: true,
      minLength: 1,
      maxLength: 20,
    },
  ]);
}

// ─── Reaction Role Modal ───────────────────────────────────────────────────────────
export function reactionRoleModal(customId: string): ModalBuilder {
  return baseModal(customId, '🎭 Reaction Role', [
    {
      customId: 'emoji',
      label: 'Reaction emoji',
      placeholder: 'Enter the emoji',
      style: TextInputStyle.Short,
      required: true,
      minLength: 1,
      maxLength: 50,
    },
    {
      customId: 'role_id',
      label: 'Role ID',
      placeholder: 'Enter the role ID',
      style: TextInputStyle.Short,
      required: true,
      minLength: 1,
      maxLength: 25,
    },
  ]);
}

// ─── Premium Setup Modal ───────────────────────────────────────────────────────────
export function premiumSetupModal(customId: string): ModalBuilder {
  return baseModal(customId, '💎 Premium Setup', [
    {
      customId: 'key',
      label: 'Premium key',
      placeholder: 'Enter your premium key',
      style: TextInputStyle.Short,
      required: true,
      minLength: 1,
      maxLength: 100,
    },
  ]);
}

// ─── Webhook Message Modal ─────────────────────────────────────────────────────────
export function webhookMessageModal(customId: string): ModalBuilder {
  return baseModal(customId, '🔗 Webhook Message', [
    {
      customId: 'content',
      label: 'Message content',
      placeholder: 'Enter the message content',
      style: TextInputStyle.Paragraph,
      required: true,
      minLength: 1,
      maxLength: 4000,
    },
    {
      customId: 'username',
      label: 'Webhook username (optional)',
      placeholder: 'Custom webhook username',
      style: TextInputStyle.Short,
      required: false,
      maxLength: 80,
    },
  ]);
}

// ─── Auto Role Modal ──────────────────────────────────────────────────────────────
export function autoRoleModal(customId: string): ModalBuilder {
  return baseModal(customId, '🎭 Auto Role', [
    {
      customId: 'role_id',
      label: 'Role ID',
      placeholder: 'Enter the role ID to assign automatically',
      style: TextInputStyle.Short,
      required: true,
      minLength: 1,
      maxLength: 25,
    },
  ]);
}

// ─── Logging Modal ─────────────────────────────────────────────────────────────────
export function loggingModal(customId: string): ModalBuilder {
  return baseModal(customId, '📋 Logging Configuration', [
    {
      customId: 'channel_id',
      label: 'Log channel ID',
      placeholder: 'Enter the channel ID for logs',
      style: TextInputStyle.Short,
      required: true,
      minLength: 1,
      maxLength: 25,
    },
    {
      customId: 'events',
      label: 'Events to log (comma-separated)',
      placeholder: 'e.g., message_delete, member_join, ban',
      style: TextInputStyle.Paragraph,
      required: false,
      maxLength: 500,
    },
  ]);
}

// ─── Server Configuration Modal ────────────────────────────────────────────────────
export function serverConfigModal(customId: string): ModalBuilder {
  return baseModal(customId, '⚙️ Server Configuration', [
    {
      customId: 'prefix',
      label: 'Bot prefix',
      placeholder: 'Enter the bot prefix',
      style: TextInputStyle.Short,
      required: false,
      minLength: 1,
      maxLength: 10,
    },
    {
      customId: 'language',
      label: 'Language',
      placeholder: 'e.g., en, es, fr',
      style: TextInputStyle.Short,
      required: false,
      maxLength: 10,
    },
    {
      customId: 'timezone',
      label: 'Timezone',
      placeholder: 'e.g., UTC, America/New_York',
      style: TextInputStyle.Short,
      required: false,
      maxLength: 50,
    },
  ]);
}

// ─── Custom Modal Builder ─────────────────────────────────────────────────────────
export function customModal(
  customId: string,
  title: string,
  inputs: ModalInput[]
): ModalBuilder {
  return baseModal(customId, title, inputs);
}

// ─── Export Modal Manager ──────────────────────────────────────────────────────────
export const ModalManager = {
  aiPrompt: aiPromptModal,
  translate: translateModal,
  rewrite: rewriteModal,
  summarize: summarizeModal,
  announcement: announcementModal,
  warn: warnModal,
  ban: banModal,
  timeout: timeoutModal,
  nickname: nicknameModal,
  embedBuilder: embedBuilderModal,
  musicSearch: musicSearchModal,
  playlistUrl: playlistUrlModal,
  seek: seekModal,
  jump: jumpModal,
  volume: volumeModal,
  reminder: reminderModal,
  poll: pollModal,
  suggestion: suggestionModal,
  ticketReason: ticketReasonModal,
  welcomeMessage: welcomeMessageModal,
  goodbyeMessage: goodbyeMessageModal,
  verification: verificationModal,
  reactionRole: reactionRoleModal,
  premiumSetup: premiumSetupModal,
  webhookMessage: webhookMessageModal,
  autoRole: autoRoleModal,
  logging: loggingModal,
  serverConfig: serverConfigModal,
  custom: customModal,
} as const;
