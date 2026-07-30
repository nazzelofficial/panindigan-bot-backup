// @ts-nocheck
import { ChatInputCommandInteraction, Message, GuildMember, PermissionFlagsBits, ChannelType, VoiceBasedChannel } from 'discord.js';
import { ErrorHandler } from '../handlers/ErrorHandler.js';
import { EmbedManager } from '../structures/EmbedManager.js';
import { getPrismaClient } from '../database/postgresql/client.js';
import { getCooldown, setCooldown } from '../database/redis/client.js';

export interface ValidationOptions {
  requireGuild?: boolean;
  requireVoice?: boolean;
  requireSameVoice?: boolean;
  requirePermissions?: PermissionFlagsBits[];
  requireBotPermissions?: PermissionFlagsBits[];
  requirePremium?: 'free' | 'bronze' | 'silver' | 'gold' | 'diamond';
  cooldown?: number;
  checkBlacklist?: boolean;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
  data?: any;
}

class ValidationService {
  private prisma = getPrismaClient();

  public async validateInteraction(
    interaction: ChatInputCommandInteraction | Message,
    options: ValidationOptions = {}
  ): Promise<ValidationResult> {
    // Check guild requirement
    if (options.requireGuild && !interaction.guild) {
      return { valid: false, error: 'This command can only be used in a server.' };
    }

    // Check blacklist
    if (options.checkBlacklist) {
      const blacklistCheck = await this.checkBlacklist(interaction);
      if (!blacklistCheck.valid) return blacklistCheck;
    }

    // Check premium requirement
    if (options.requirePremium) {
      const premiumCheck = await this.checkPremium(interaction, options.requirePremium);
      if (!premiumCheck.valid) return premiumCheck;
    }

    // Check cooldown
    if (options.cooldown) {
      const cooldownCheck = await this.checkCooldown(interaction, options.cooldown);
      if (!cooldownCheck.valid) return cooldownCheck;
    }

    // Check voice requirements
    if (options.requireVoice || options.requireSameVoice) {
      const voiceCheck = await this.checkVoice(interaction, options);
      if (!voiceCheck.valid) return voiceCheck;
    }

    // Check user permissions
    if (options.requirePermissions?.length) {
      const permCheck = this.checkPermissions(interaction, options.requirePermissions);
      if (!permCheck.valid) return permCheck;
    }

    // Check bot permissions
    if (options.requireBotPermissions?.length) {
      const botPermCheck = await this.checkBotPermissions(interaction, options.requireBotPermissions);
      if (!botPermCheck.valid) return botPermCheck;
    }

    return { valid: true };
  }

  private async checkBlacklist(interaction: ChatInputCommandInteraction | Message): Promise<ValidationResult> {
    try {
      const userId = interaction.user.id;
      const guildId = interaction.guild?.id;

      // Check global blacklist
      const globalBlacklist = await this.prisma.blacklist.findUnique({
        where: { userId },
      });

      if (globalBlacklist) {
        return { valid: false, error: 'You are globally blacklisted from using this bot.' };
      }

      // Check guild blacklist
      if (guildId) {
        const guildBlacklist = await this.prisma.guildBlacklist.findFirst({
          where: { userId, guildId },
        });

        if (guildBlacklist) {
          return { valid: false, error: 'You are blacklisted from this server.' };
        }
     }

      return { valid: true };
    } catch (error) {
      return { valid: false, error: 'Failed to check blacklist status.' };
    }
  }

  private async checkPremium(
    interaction: ChatInputCommandInteraction | Message,
    requiredTier: string
  ): Promise<ValidationResult> {
    try {
      const userId = interaction.user.id;
      const premium = await this.prisma.premium.findUnique({
        where: { userId },
      });

      if (!premium) {
        if (requiredTier === 'free') return { valid: true };
        return { valid: false, error: 'This feature requires a premium subscription.' };
      }

      const tierHierarchy = ['free', 'bronze', 'silver', 'gold', 'diamond'];
      const userTierIndex = tierHierarchy.indexOf(premium.tier);
      const requiredTierIndex = tierHierarchy.indexOf(requiredTier);

      if (userTierIndex < requiredTierIndex) {
        return { valid: false, error: `This feature requires ${requiredTier} tier or higher.` };
      }

      return { valid: true };
    } catch (error) {
      return { valid: false, error: 'Failed to check premium status.' };
    }
  }

  private async checkCooldown(
    interaction: ChatInputCommandInteraction | Message,
    cooldownSeconds: number
  ): Promise<ValidationResult> {
    try {
      const userId = interaction.user.id;
      const guildId = interaction.guild?.id || 'dm';
      const commandName = interaction instanceof ChatInputCommandInteraction
        ? interaction.commandName
        : (interaction as Message).content.split(' ')[0].replace('!', '');

      const remaining = await getCooldown(userId, guildId, commandName);

      if (remaining > 0) {
        return {
          valid: false,
          error: `Please wait ${remaining} seconds before using this command again.`,
        };
      }

      await setCooldown(userId, guildId, commandName, cooldownSeconds);
      return { valid: true };
    } catch (error) {
      return { valid: false, error: 'Failed to check cooldown.' };
    }
  }

  private async checkVoice(
    interaction: ChatInputCommandInteraction | Message,
    options: ValidationOptions
  ): Promise<ValidationResult> {
    const member = interaction.member as GuildMember;
    if (!member) {
      return { valid: false, error: 'You must be a member to use voice commands.' };
    }

    const voiceChannel = member.voice.channel;

    if (options.requireVoice && !voiceChannel) {
      return { valid: false, error: 'You must be in a voice channel to use this command.' };
    }

    if (options.requireSameVoice && voiceChannel) {
      const client = interaction.client;
      const guild = interaction.guild;
      if (!guild) return { valid: false, error: 'This command can only be used in a server.' };

      const botMember = guild.members.me;
      if (!botMember) return { valid: false, error: 'Bot member not found.' };

      const botVoiceChannel = botMember.voice.channel;

      if (botVoiceChannel && botVoiceChannel.id !== voiceChannel.id) {
        return { valid: false, error: 'You must be in the same voice channel as the bot.' };
      }
    }

    return { valid: true };
  }

  private checkPermissions(
    interaction: ChatInputCommandInteraction | Message,
    requiredPermissions: PermissionFlagsBits[]
  ): ValidationResult {
    const member = interaction.member as GuildMember;
    if (!member) {
      return { valid: false, error: 'You must be a member to use this command.' };
    }

    const missingPermissions = requiredPermissions.filter(perm => !member.permissions.has(perm));

    if (missingPermissions.length > 0) {
      const permNames = missingPermissions.map(p => Object.keys(PermissionFlagsBits).find(key => PermissionFlagsBits[key as keyof typeof PermissionFlagsBits] === p)).join(', ');
      return { valid: false, error: `You need the following permissions: ${permNames}` };
    }

    return { valid: true };
  }

  private async checkBotPermissions(
    interaction: ChatInputCommandInteraction | Message,
    requiredPermissions: PermissionFlagsBits[]
  ): Promise<ValidationResult> {
    const guild = interaction.guild;
    if (!guild) {
      return { valid: false, error: 'This command can only be used in a server.' };
    }

    const botMember = guild.members.me;
    if (!botMember) {
      return { valid: false, error: 'Bot member not found.' };
    }

    const missingPermissions = requiredPermissions.filter(perm => !botMember.permissions.has(perm));

    if (missingPermissions.length > 0) {
      const permNames = missingPermissions.map(p => Object.keys(PermissionFlagsBits).find(key => PermissionFlagsBits[key as keyof typeof PermissionFlagsBits] === p)).join(', ');
      return { valid: false, error: `I need the following permissions: ${permNames}` };
    }

    return { valid: true };
  }

  public async validateMusicPlayer(interaction: ChatInputCommandInteraction | Message): Promise<ValidationResult> {
    const voiceCheck = await this.checkVoice(interaction, { requireVoice: true, requireSameVoice: true });
    if (!voiceCheck.valid) return voiceCheck;

    const member = interaction.member as GuildMember;
    const voiceChannel = member.voice.channel as VoiceBasedChannel;

    if (!voiceChannel.joinable) {
      return { valid: false, error: 'I cannot join your voice channel.' };
    }

    if (!voiceChannel.speakable) {
      return { valid: false, error: 'I cannot speak in your voice channel.' };
    }

    return { valid: true, data: { voiceChannel } };
  }

  public async validateModerationAction(
    interaction: ChatInputCommandInteraction | Message,
    targetUser: GuildMember
  ): Promise<ValidationResult> {
    const member = interaction.member as GuildMember;
    if (!member) return { valid: false, error: 'You must be a member to perform moderation actions.' };

    // Check if target is higher in hierarchy
    if (targetUser.roles.highest.position >= member.roles.highest.position) {
      return { valid: false, error: 'You cannot moderate someone with equal or higher role position.' };
    }

    // Check if bot is higher in hierarchy
    const botMember = interaction.guild!.members.me!;
    if (targetUser.roles.highest.position >= botMember.roles.highest.position) {
      return { valid: false, error: 'I cannot moderate someone with equal or higher role position than me.' };
    }

    return { valid: true };
  }

  public async validateEconomyTransaction(
    interaction: ChatInputCommandInteraction | Message,
    amount: number
  ): Promise<ValidationResult> {
    if (amount <= 0) {
      return { valid: false, error: 'Amount must be greater than 0.' };
    }

    try {
      const economy = await this.prisma.economy.findUnique({
        where: { userId: interaction.user.id },
      });

      if (!economy) {
        return { valid: false, error: 'You do not have an economy account.' };
      }

      if (economy.wallet < amount) {
        return { valid: false, error: 'You do not have enough coins in your wallet.' };
      }

      return { valid: true, data: { economy } };
    } catch (error) {
      return { valid: false, error: 'Failed to check economy balance.' };
    }
  }

  public async validateInput(input: string, type: 'url' | 'email' | 'number' | 'text' = 'text'): Promise<ValidationResult> {
    switch (type) {
      case 'url':
        try {
          new URL(input);
          return { valid: true };
        } catch {
          return { valid: false, error: 'Invalid URL format.' };
        }
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(input)) {
          return { valid: false, error: 'Invalid email format.' };
        }
        return { valid: true };
      case 'number':
        if (isNaN(Number(input))) {
          return { valid: false, error: 'Invalid number format.' };
        }
        return { valid: true };
      case 'text':
        if (input.length === 0) {
          return { valid: false, error: 'Input cannot be empty.' };
        }
        if (input.length > 1000) {
          return { valid: false, error: 'Input is too long (max 1000 characters).' };
        }
        return { valid: true };
    }
  }
}

export const validationService = new ValidationService();
export default validationService;
