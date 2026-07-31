/**
 * ═══════════════════════════════════════════════════
 *  Panindigan Premium Loading Handler
 *  Professional loading states with progress updates
 * ═══════════════════════════════════════════════════
 */

import {
  ChatInputCommandInteraction,
  Message,
} from 'discord.js';
import { EmbedManager } from '../structures/EmbedManager.js';

// ─── Loading Options Interface ────────────────────────────────────────────────────
export interface LoadingOptions {
  action: string;
  description?: string;
  progress?: number;
  total?: number;
  current?: string;
  showTimestamp?: boolean;
  ephemeral?: boolean;
}

// ─── Loading State Interface ─────────────────────────────────────────────────────
export interface LoadingState {
  message: Message;
  action: string;
  progress: number;
  total: number;
  current: string;
}

// ─── Loading Handler Class ────────────────────────────────────────────────────────
export class LoadingHandler {
  /**
   * Send loading response with professional formatting
   */
  static async send(
    source: ChatInputCommandInteraction | Message,
    options: LoadingOptions
  ): Promise<Message | null> {
    const {
      action,
      description,
      progress = 0,
      total = 100,
      current = 'Initializing...',
      showTimestamp = true,
      ephemeral = true,
    } = options;

    const embed = EmbedManager.loading(action, description);
    const percentage = Math.round((progress / total) * 100);
    const progressBar = this.createProgressBar(percentage);

    embed.addFields(
      {
        name: '📊 Progress',
        value: `${progressBar} ${percentage}%`,
        inline: false,
      },
      {
        name: '📋 Current Task',
        value: current,
        inline: false,
      }
    );

    if (!showTimestamp) {
      embed.setTimestamp(null);
    }

    if (source instanceof Message) {
      return await source.reply({ embeds: [embed] });
    } else {
      await source.deferReply({ ephemeral });
      await source.editReply({ embeds: [embed] });
      return await source.fetchReply() as Message;
    }
  }

  /**
   * Update loading state with new progress
   */
  static async update(
    state: LoadingState,
    progress: number,
    current?: string
  ): Promise<void> {
    state.progress = progress;
    if (current) state.current = current;

    const percentage = Math.round((progress / state.total) * 100);
    const progressBar = this.createProgressBar(percentage);

    const embed = EmbedManager.loading(state.action);
    embed.addFields(
      {
        name: '📊 Progress',
        value: `${progressBar} ${percentage}%`,
        inline: false,
      },
      {
        name: '📋 Current Task',
        value: state.current,
        inline: false,
      }
    );

    await state.message.edit({ embeds: [embed] });
  }

  /**
   * Complete loading state with success
   */
  static async complete(
    state: LoadingState,
    successMessage: string
  ): Promise<void> {
    const embed = EmbedManager.success('Complete', successMessage);
    embed.addFields({
      name: '📊 Progress',
      value: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 100%',
      inline: false,
    });

    await state.message.edit({ embeds: [embed] });
  }

  /**
   * Fail loading state with error
   */
  static async fail(
    state: LoadingState,
    errorMessage: string
  ): Promise<void> {
    const embed = EmbedManager.error('Failed', errorMessage);
    embed.addFields({
      name: '📊 Progress',
      value: `${this.createProgressBar(Math.round((state.progress / state.total) * 100))} ${Math.round((state.progress / state.total) * 100)}%`,
      inline: false,
    });

    await state.message.edit({ embeds: [embed] });
  }

  /**
   * Create progress bar
   */
  private static createProgressBar(percentage: number): string {
    const filled = Math.round(percentage / 10);
    const empty = 10 - filled;
    return '▬'.repeat(filled) + '🔘' + '▬'.repeat(empty);
  }

  /**
   * Create loading state for tracking
   */
  static createState(
    message: Message,
    action: string,
    total: number = 100
  ): LoadingState {
    return {
      message,
      action,
      progress: 0,
      total,
      current: 'Initializing...',
    };
  }

  /**
   * Send music loading
   */
  static async music(
    source: ChatInputCommandInteraction | Message,
    trackName: string,
    action: 'searching' | 'loading' | 'processing'
  ): Promise<Message | null> {
    const actionMessages = {
      searching: 'Searching for track...',
      loading: 'Loading track...',
      processing: 'Processing audio...',
    };

    return await this.send(source, {
      action: 'Music',
      description: `${actionMessages[action]} "${trackName}"`,
      current: actionMessages[action],
    });
  }

  /**
   * Send AI processing loading
   */
  static async ai(
    source: ChatInputCommandInteraction | Message,
    model: string,
    prompt: string
  ): Promise<Message | null> {
    return await this.send(source, {
      action: 'AI Processing',
      description: `Processing your request with ${model}...`,
      current: 'Analyzing prompt...',
    });
  }

  /**
   * Send database operation loading
   */
  static async database(
    source: ChatInputCommandInteraction | Message,
    operation: 'saving' | 'loading' | 'updating' | 'deleting'
  ): Promise<Message | null> {
    const operationMessages = {
      saving: 'Saving data...',
      loading: 'Loading data...',
      updating: 'Updating data...',
      deleting: 'Deleting data...',
    };

    return await this.send(source, {
      action: 'Database',
      description: operationMessages[operation],
      current: operationMessages[operation],
    });
  }

  /**
   * Send image generation loading
   */
  static async image(
    source: ChatInputCommandInteraction | Message,
    prompt: string
  ): Promise<Message | null> {
    return await this.send(source, {
      action: 'Image Generation',
      description: `Generating image for "${prompt}"...`,
      current: 'Initializing AI model...',
    });
  }

  /**
   * Send playlist loading
   */
  static async playlist(
    source: ChatInputCommandInteraction | Message,
    playlistName: string,
    songCount: number
  ): Promise<Message | null> {
    return await this.send(source, {
      action: 'Playlist',
      description: `Loading playlist "${playlistName}" with ${songCount} songs...`,
      current: 'Fetching track information...',
      total: songCount,
    });
  }

  /**
   * Send moderation action loading
   */
  static async moderation(
    source: ChatInputCommandInteraction | Message,
    action: string,
    target: string
  ): Promise<Message | null> {
    return await this.send(source, {
      action: 'Moderation',
      description: `${action} ${target}...`,
      current: 'Processing action...',
    });
  }

  /**
   * Send economy transaction loading
   */
  static async economy(
    source: ChatInputCommandInteraction | Message,
    action: string,
    amount: number
  ): Promise<Message | null> {
    return await this.send(source, {
      action: 'Economy',
      description: `${action} ₱${amount.toLocaleString()}...`,
      current: 'Processing transaction...',
    });
  }

  /**
   * Send bulk operation loading
   */
  static async bulk(
    source: ChatInputCommandInteraction | Message,
    operation: string,
    total: number
  ): Promise<Message | null> {
    return await this.send(source, {
      action: 'Bulk Operation',
      description: `${operation} ${total} items...`,
      current: 'Starting operation...',
      total,
    });
  }

  /**
   * Send API request loading
   */
  static async api(
    source: ChatInputCommandInteraction | Message,
    endpoint: string
  ): Promise<Message | null> {
    return await this.send(source, {
      action: 'API Request',
      description: `Making request to ${endpoint}...`,
      current: 'Connecting to API...',
    });
  }

  /**
   * Send generic loading with custom message
   */
  static async generic(
    source: ChatInputCommandInteraction | Message,
    message: string
  ): Promise<Message | null> {
    return await this.send(source, {
      action: 'Processing',
      description: message,
      current: 'Working on it...',
    });
  }
}

// ─── Export Loading Handler ─────────────────────────────────────────────────────────
export default LoadingHandler;
