/**
 * ═══════════════════════════════════════════════════
 *  Panindigan Premium Success Handler
 *  Professional success messages with next actions
 * ═══════════════════════════════════════════════════
 */

import {
  ChatInputCommandInteraction,
  Message,
} from 'discord.js';
import { EmbedManager } from '../structures/EmbedManager.js';

// ─── Success Options Interface ────────────────────────────────────────────────────
export interface SuccessOptions {
  title?: string;
  description: string;
  summary?: string;
  nextActions?: string[];
  showTimestamp?: boolean;
  ephemeral?: boolean;
}

// ─── Success Handler Class ────────────────────────────────────────────────────────
export class SuccessHandler {
  /**
   * Send success response with professional formatting
   */
  static async send(
    source: ChatInputCommandInteraction | Message,
    options: SuccessOptions
  ): Promise<void> {
    const {
      title = 'Success',
      description,
      summary,
      nextActions,
      showTimestamp = true,
      ephemeral = false,
    } = options;

    const embed = EmbedManager.success(title, description);

    if (summary) {
      embed.addFields({
        name: '📝 Summary',
        value: summary,
        inline: false,
      });
    }

    if (nextActions && nextActions.length > 0) {
      embed.addFields({
        name: '➡️ Next Actions',
        value: nextActions.map((action, i) => `${i + 1}. ${action}`).join('\n'),
        inline: false,
      });
    }

    if (!showTimestamp) {
      embed.setTimestamp(null);
    }

    if (source instanceof Message) {
      await source.reply({ embeds: [embed] });
    } else {
      if (source.replied || source.deferred) {
        await source.editReply({ embeds: [embed] });
      } else {
        await source.reply({ embeds: [embed], ephemeral });
      }
    }
  }

  /**
   * Send moderation success
   */
  static async moderation(
    source: ChatInputCommandInteraction | Message,
    action: string,
    target: string,
    reason?: string
  ): Promise<void> {
    await this.send(source, {
      title: `${action} Successful`,
      description: `Successfully ${action.toLowerCase()} ${target}.`,
      summary: reason ? `Reason: ${reason}` : undefined,
      nextActions: [
        'View the moderation log for details',
        'Undo the action if needed',
        'Check the user\'s profile for more information',
      ],
    });
  }

  /**
   * Send economy success
   */
  static async economy(
    source: ChatInputCommandInteraction | Message,
    action: string,
    amount: number,
    target?: string
  ): Promise<void> {
    await this.send(source, {
      title: `${action} Successful`,
      description: target
        ? `Successfully ${action.toLowerCase()} ₱${amount.toLocaleString()} to ${target}.`
        : `Successfully ${action.toLowerCase()} ₱${amount.toLocaleString()}.`,
      nextActions: [
        'Check your balance with /balance',
        'View your transaction history',
        'Use economy commands to earn more',
      ],
    });
  }

  /**
   * Send music success
   */
  static async music(
    source: ChatInputCommandInteraction | Message,
    action: string,
    trackName: string
  ): Promise<void> {
    await this.send(source, {
      title: `${action} Successful`,
      description: `Successfully ${action.toLowerCase()} "${trackName}".`,
      nextActions: [
        'View the queue with /queue',
        'Control playback with /play, /pause, /skip',
        'Adjust volume with /volume',
      ],
    });
  }

  /**
   * Send configuration success
   */
  static async configuration(
    source: ChatInputCommandInteraction | Message,
    setting: string,
    value: string
  ): Promise<void> {
    await this.send(source, {
      title: 'Configuration Updated',
      description: `Successfully updated ${setting} to "${value}".`,
      nextActions: [
        'View current settings with /settings',
        'Test the new configuration',
        'Revert the change if needed',
      ],
    });
  }

  /**
   * Send level up success
   */
  static async levelUp(
    source: ChatInputCommandInteraction | Message,
    level: number,
    xp: number,
    rewards?: string[]
  ): Promise<void> {
    await this.send(source, {
      title: '🎉 Level Up!',
      description: `Congratulations! You have reached level ${level}!`,
      summary: `Total XP: ${xp.toLocaleString()}`,
      nextActions: rewards
        ? [`Rewards unlocked: ${rewards.join(', ')}`, 'Continue chatting to earn more XP']
        : ['Continue chatting to earn more XP', 'Check your rank with /rank'],
    });
  }

  /**
   * Send premium activation success
   */
  static async premium(
    source: ChatInputCommandInteraction | Message,
    tier: string,
    features: string[]
  ): Promise<void> {
    await this.send(source, {
      title: '💎 Premium Activated',
      description: `Successfully activated ${tier} premium tier!`,
      summary: `You now have access to ${features.length} premium features.`,
      nextActions: [
        `Explore premium features: ${features.slice(0, 3).join(', ')}`,
        'View your premium status with /premium',
        'Configure premium settings',
      ],
    });
  }

  /**
   * Send playlist success
   */
  static async playlist(
    source: ChatInputCommandInteraction | Message,
    action: string,
    playlistName: string,
    songCount?: number
  ): Promise<void> {
    await this.send(source, {
      title: `Playlist ${action}`,
      description: `Successfully ${action.toLowerCase()} playlist "${playlistName}".${songCount ? ` (${songCount} songs)` : ''}`,
      nextActions: [
        'View your playlists with /playlist list',
        'Load a playlist with /playlist load',
        'Manage your playlists',
      ],
    });
  }

  /**
   * Send giveaway success
   */
  static async giveaway(
    source: ChatInputCommandInteraction | Message,
    action: string,
    prize: string
  ): Promise<void> {
    await this.send(source, {
      title: `Giveaway ${action}`,
      description: `Successfully ${action.toLowerCase()} giveaway for "${prize}".`,
      nextActions: [
        'View active giveaways with /giveaway list',
        'Manage the giveaway',
        'Announce the giveaway to the server',
      ],
    });
  }

  /**
   * Send ticket success
   */
  static async ticket(
    source: ChatInputCommandInteraction | Message,
    action: string,
    ticketId: string
  ): Promise<void> {
    await this.send(source, {
      title: `Ticket ${action}`,
      description: `Successfully ${action.toLowerCase()} ticket #${ticketId}.`,
      nextActions: [
        'View your tickets with /ticket list',
        'Manage the ticket',
        'Close the ticket when resolved',
      ],
    });
  }

  /**
   * Send role success
   */
  static async role(
    source: ChatInputCommandInteraction | Message,
    action: string,
    roleName: string,
    target?: string
  ): Promise<void> {
    await this.send(source, {
      title: `Role ${action}`,
      description: `Successfully ${action.toLowerCase()} role "${roleName}"${target ? ` to ${target}` : ''}.`,
      nextActions: [
        'View server roles with /roles',
        'Manage role permissions',
        'Check user roles with /userinfo',
      ],
    });
  }

  /**
   * Send channel success
   */
  static async channel(
    source: ChatInputCommandInteraction | Message,
    action: string,
    channelName: string
  ): Promise<void> {
    await this.send(source, {
      title: `Channel ${action}`,
      description: `Successfully ${action.toLowerCase()} channel "${channelName}".`,
      nextActions: [
        'View server channels with /channels',
        'Configure channel settings',
        'Manage channel permissions',
      ],
    });
  }

  /**
   * Send generic success
   */
  static async generic(
    source: ChatInputCommandInteraction | Message,
    description: string,
    nextActions?: string[]
  ): Promise<void> {
    await this.send(source, {
      description,
      nextActions: nextActions || ['Continue using the bot', 'Check /help for more commands'],
    });
  }
}

// ─── Export Success Handler ─────────────────────────────────────────────────────────
export default SuccessHandler;
