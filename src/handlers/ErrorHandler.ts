/**
 * ═══════════════════════════════════════════════════
 *  Panindigan Premium Error Handler
 *  Professional error messages with solutions
 * ═══════════════════════════════════════════════════
 */

import {
  ChatInputCommandInteraction,
  Message,
} from 'discord.js';
import { EmbedManager } from '../structures/EmbedManager.js';
import { ComponentBuilder } from '../structures/ComponentBuilder.js';

// ─── Error Options Interface ─────────────────────────────────────────────────────
export interface ErrorOptions {
  title?: string;
  description: string;
  whatHappened?: string;
  why?: string;
  howToFix?: string;
  suggestedActions?: string[];
  showTimestamp?: boolean;
  ephemeral?: boolean;
}

// ─── Error Handler Class ─────────────────────────────────────────────────────────
export class ErrorHandler {
  /**
   * Send error response with professional formatting
   */
  static async send(
    source: ChatInputCommandInteraction | Message,
    options: ErrorOptions
  ): Promise<void> {
    const {
      title = 'Error Occurred',
      description,
      whatHappened,
      why,
      howToFix,
      suggestedActions,
      showTimestamp = true,
      ephemeral = true,
    } = options;

    const embed = EmbedManager.error(title, description);

    if (whatHappened) {
      embed.addFields({
        name: '📋 What Happened',
        value: whatHappened,
        inline: false,
      });
    }

    if (why) {
      embed.addFields({
        name: '❓ Why',
        value: why,
        inline: false,
      });
    }

    if (howToFix) {
      embed.addFields({
        name: '🔧 How to Fix',
        value: howToFix,
        inline: false,
      });
    }

    if (suggestedActions && suggestedActions.length > 0) {
      embed.addFields({
        name: '💡 Suggested Actions',
        value: suggestedActions.map((action, i) => `${i + 1}. ${action}`).join('\n'),
        inline: false,
      });
    }

    if (!showTimestamp) {
      embed.setTimestamp(null);
    }

    // Always attach a support button so users know where to get help
    const components = [ComponentBuilder.errorActionRow()];

    if (source instanceof Message) {
      await source.reply({ embeds: [embed], components });
    } else {
      if (source.replied || source.deferred) {
        await source.editReply({ embeds: [embed], components });
      } else {
        await source.reply({ embeds: [embed], ephemeral, components });
      }
    }
  }

  /**
   * Send permission error
   */
  static async permission(
    source: ChatInputCommandInteraction | Message,
    missingPermissions: string[]
  ): Promise<void> {
    await this.send(source, {
      title: 'Missing Permissions',
      description: 'You do not have the required permissions to use this command.',
      whatHappened: 'The command requires permissions that you do not have.',
      why: 'This command is restricted to users with specific permissions to prevent misuse.',
      howToFix: 'Contact a server administrator if you believe you should have access to this command.',
      suggestedActions: [
        'Check your permissions in the server settings',
        'Ask a server administrator for the required permissions',
        'Use a different command that you have access to',
      ],
    });
  }

  /**
   * Send bot permission error
   */
  static async botPermission(
    source: ChatInputCommandInteraction | Message,
    missingPermissions: string[]
  ): Promise<void> {
    await this.send(source, {
      title: 'Bot Missing Permissions',
      description: 'The bot does not have the required permissions to perform this action.',
      whatHappened: 'The bot needs additional permissions to execute this command.',
      why: 'Discord requires bots to have specific permissions to perform certain actions.',
      howToFix: 'Grant the bot the required permissions in the server settings.',
      suggestedActions: [
        'Check the bot\'s role permissions',
        'Grant the bot the missing permissions',
        'Move the bot\'s role higher in the role hierarchy',
      ],
    });
  }

  /**
   * Send cooldown error
   */
  static async cooldown(
    source: ChatInputCommandInteraction | Message,
    remainingTime: number
  ): Promise<void> {
    await this.send(source, {
      title: 'Command on Cooldown',
      description: `This command is on cooldown. Please wait ${remainingTime} seconds before using it again.`,
      whatHappened: 'You have used this command recently and must wait before using it again.',
      why: 'Cooldowns prevent spam and ensure fair usage of bot commands.',
      howToFix: 'Wait for the cooldown to expire before using the command again.',
      suggestedActions: [
        'Wait for the cooldown to expire',
        'Use a different command',
        'Consider upgrading to premium for reduced cooldowns',
      ],
    });
  }

  /**
   * Send rate limit error
   */
  static async rateLimit(
    source: ChatInputCommandInteraction | Message,
    resetTime: number
  ): Promise<void> {
    await this.send(source, {
      title: 'Rate Limit Exceeded',
      description: 'You have exceeded the rate limit for this command.',
      whatHappened: 'You have used this command too many times in a short period.',
      why: 'Rate limits prevent abuse and ensure stable bot performance.',
      howToFix: 'Wait for the rate limit to reset before using the command again.',
      suggestedActions: [
        'Wait for the rate limit to reset',
        'Slow down your command usage',
        'Consider upgrading to premium for higher rate limits',
      ],
    });
  }

  /**
   * Send invalid argument error
   */
  static async invalidArgument(
    source: ChatInputCommandInteraction | Message,
    argumentName: string,
    expected: string
  ): Promise<void> {
    await this.send(source, {
      title: 'Invalid Argument',
      description: `The value provided for \`${argumentName}\` is invalid.`,
      whatHappened: `The argument \`${argumentName}\` requires a specific format or value.`,
      why: 'This command requires valid arguments to function correctly.',
      howToFix: `Provide a valid value for \`${argumentName}\`: ${expected}`,
      suggestedActions: [
        'Check the command help for valid argument formats',
        'Use the autocomplete feature if available',
        'Try the command again with a different value',
      ],
    });
  }

  /**
   * Send not found error
   */
  static async notFound(
    source: ChatInputCommandInteraction | Message,
    resourceType: string,
    identifier: string
  ): Promise<void> {
    await this.send(source, {
      title: `${resourceType} Not Found`,
      description: `The ${resourceType.toLowerCase()} with identifier \`${identifier}\` could not be found.`,
      whatHappened: `The requested ${resourceType.toLowerCase()} does not exist or is not accessible.`,
      why: 'The resource may have been deleted, moved, or you may not have permission to access it.',
      howToFix: 'Verify the identifier is correct and that you have permission to access the resource.',
      suggestedActions: [
        'Check the identifier for typos',
        'Ensure you have permission to access the resource',
        'Use a different identifier if available',
      ],
    });
  }

  /**
   * Send generic error
   */
  static async generic(
    source: ChatInputCommandInteraction | Message,
    error: Error
  ): Promise<void> {
    await this.send(source, {
      title: 'An Error Occurred',
      description: 'Something went wrong while processing your request.',
      whatHappened: error.message,
      why: 'This may be due to a temporary issue or invalid input.',
      howToFix: 'Try the command again or contact support if the issue persists.',
      suggestedActions: [
        'Try the command again',
        'Check your input for errors',
        'Contact support if the issue persists',
      ],
    });
  }

  /**
   * Send music error
   */
  static async music(
    source: ChatInputCommandInteraction | Message,
    errorType: 'not_in_voice' | 'no_track' | 'queue_empty' | 'already_playing' | 'join_failed'
  ): Promise<void> {
    const errorMessages = {
      not_in_voice: {
        title: 'Not in Voice Channel',
        description: 'You need to be in a voice channel to use music commands.',
        whatHappened: 'You are not currently in a voice channel.',
        why: 'Music commands require you to be in a voice channel to play music.',
        howToFix: 'Join a voice channel and try the command again.',
        suggestedActions: [
          'Join a voice channel',
          'Use /join to have the bot join your voice channel',
          'Try the command again after joining',
        ],
      },
      no_track: {
        title: 'No Track Playing',
        description: 'There is no track currently playing.',
        whatHappened: 'The music player is not currently playing any track.',
        why: 'You need to have a track playing to use this command.',
        howToFix: 'Use /play to add a song to the queue.',
        suggestedActions: [
          'Use /play to add a song',
          'Use /search to find music',
          'Check the queue with /queue',
        ],
      },
      queue_empty: {
        title: 'Queue is Empty',
        description: 'There are no songs in the queue.',
        whatHappened: 'The music queue is currently empty.',
        why: 'You need to add songs to the queue before using this command.',
        howToFix: 'Use /play to add songs to the queue.',
        suggestedActions: [
          'Use /play to add a song',
          'Use /search to find music',
          'Load a playlist with /playlist load',
        ],
      },
      already_playing: {
        title: 'Already Playing',
        description: 'The bot is already playing music in this server.',
        whatHappened: 'There is already a track playing in the voice channel.',
        why: 'The bot can only play one track at a time in each voice channel.',
        howToFix: 'Use /queue to add songs to the queue instead.',
        suggestedActions: [
          'Use /queue to view the current queue',
          'Use /play to add songs to the queue',
          'Use /skip to skip the current track',
        ],
      },
      join_failed: {
        title: 'Failed to Join Voice Channel',
        description: 'The bot could not join the voice channel.',
        whatHappened: 'An error occurred while trying to join the voice channel.',
        why: 'This may be due to missing permissions or the voice channel being full.',
        howToFix: 'Check the bot\'s permissions and try again.',
        suggestedActions: [
          'Check bot permissions in the voice channel',
          'Ensure the voice channel is not full',
          'Try a different voice channel',
        ],
      },
    };

    await this.send(source, errorMessages[errorType]);
  }

  /**
   * Send economy error
   */
  static async economy(
    source: ChatInputCommandInteraction | Message,
    errorType: 'insufficient_funds' | 'negative_amount' | 'self_transfer' | 'invalid_user'
  ): Promise<void> {
    const errorMessages = {
      insufficient_funds: {
        title: 'Insufficient Funds',
        description: 'You do not have enough balance to perform this action.',
        whatHappened: 'Your account balance is too low for this transaction.',
        why: 'This action requires a minimum balance to complete.',
        howToFix: 'Earn more coins through daily rewards, games, or other activities.',
        suggestedActions: [
          'Claim your daily reward with /daily',
          'Play games to earn coins',
          'Ask for coins from other users',
        ],
      },
      negative_amount: {
        title: 'Invalid Amount',
        description: 'The amount must be a positive number.',
        whatHappened: 'You provided a negative or zero amount.',
        why: 'Transactions require positive amounts.',
        howToFix: 'Provide a positive amount for the transaction.',
        suggestedActions: [
          'Provide a positive number',
          'Check your input for errors',
          'Try the command again',
        ],
      },
      self_transfer: {
        title: 'Cannot Transfer to Self',
        description: 'You cannot transfer coins to yourself.',
        whatHappened: 'You attempted to transfer coins to your own account.',
        why: 'Transfers must be between different users.',
        howToFix: 'Specify a different user to transfer coins to.',
        suggestedActions: [
          'Specify a different user',
          'Use a valid user mention or ID',
          'Try the command again',
        ],
      },
      invalid_user: {
        title: 'Invalid User',
        description: 'The specified user could not be found.',
        whatHappened: 'The user you specified does not exist or is not accessible.',
        why: 'The user may have left the server or the ID is incorrect.',
        howToFix: 'Verify the user ID or mention is correct.',
        suggestedActions: [
          'Check the user ID for typos',
          'Use a user mention instead',
          'Ensure the user is in the server',
        ],
      },
    };

    await this.send(source, errorMessages[errorType]);
  }

  /**
   * Send moderation error
   */
  static async moderation(
    source: ChatInputCommandInteraction | Message,
    errorType: 'hierarchy' | 'cannot_moderate' | 'already_punished' | 'immune'
  ): Promise<void> {
    const errorMessages = {
      hierarchy: {
        title: 'Role Hierarchy Error',
        description: 'You cannot moderate users with roles higher than or equal to yours.',
        whatHappened: 'The target user has a role that is equal to or higher than your highest role.',
        why: 'Discord prevents users from moderating those with equal or higher roles for security.',
        howToFix: 'Ask a user with a higher role to perform this action.',
        suggestedActions: [
          'Ask a server administrator for help',
          'Check role hierarchy in server settings',
          'Use a different moderation approach',
        ],
      },
      cannot_moderate: {
        title: 'Cannot Moderate User',
        description: 'You cannot moderate this user.',
        whatHappened: 'The target user cannot be moderated by you.',
        why: 'This may be due to role hierarchy or special permissions.',
        howToFix: 'Ask a user with higher permissions to perform this action.',
        suggestedActions: [
          'Ask a server administrator for help',
          'Check your permissions',
          'Verify the target user is not immune',
        ],
      },
      already_punished: {
        title: 'Already Punished',
        description: 'This user is already punished with this action.',
        whatHappened: 'The target user already has an active punishment of this type.',
        why: 'Duplicate punishments are not allowed.',
        howToFix: 'Use a different punishment or wait for the current one to expire.',
        suggestedActions: [
          'Check the user\'s current punishments',
          'Use a different punishment type',
          'Wait for the current punishment to expire',
        ],
      },
      immune: {
        title: 'User is Immune',
        description: 'This user is immune to moderation actions.',
        whatHappened: 'The target user has immunity from moderation.',
        why: 'Some users may be protected from moderation for security reasons.',
        howToFix: 'Contact a server administrator if this needs to be overridden.',
        suggestedActions: [
          'Contact a server administrator',
          'Check the user\'s immunity status',
          'Use a different approach',
        ],
      },
    };

    await this.send(source, errorMessages[errorType]);
  }
}

// ─── Export Error Handler ──────────────────────────────────────────────────────────
export default ErrorHandler;
