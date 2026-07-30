// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import {
  ChatInputCommandInteraction, Message, SlashCommandBuilder, EmbedBuilder,
  ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType,
  ModalBuilder, TextInputBuilder, TextInputStyle,
  PermissionFlagsBits, GuildMember,
} from 'discord.js';
import { ErrorHandler } from '../../handlers/ErrorHandler.js';
import { SuccessHandler } from '../../handlers/SuccessHandler.js';
import { EmbedManager } from '../../structures/EmbedManager.js';
import { validationService } from '../../services/ValidationService.js';
import { getPrismaClient } from '../../database/postgresql/client.js';
import { emojiManager } from '../../utils/EmojiManager.js';

export class ModerationCommand extends BaseCommand {
  constructor() {
    super({
      name: 'mod',
      description: 'Moderation commands for server management',
      category: 'moderation',
      premiumTier: 'free',
      cooldown: 3,
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['moderation', 'm'],
      examples: ['/mod ban @user reason', '/mod kick @user', '/mod warn @user reason'],
    } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder()
      .setName(this.name).setDescription(this.description)
      
      // User Actions Subcommand Group
      .addSubcommandGroup(g => g.setName('user').setDescription('User moderation actions')
        .addSubcommand(s => s.setName('ban').setDescription('Ban a user')
          .addUserOption(o => o.setName('user').setDescription('User to ban').setRequired(true))
          .addStringOption(o => o.setName('reason').setDescription('Ban reason').setRequired(false))
          .addIntegerOption(o => o.setName('days').setDescription('Delete message history (0-7)').setRequired(false).setMinValue(0).setMaxValue(7)))
        .addSubcommand(s => s.setName('kick').setDescription('Kick a user')
          .addUserOption(o => o.setName('user').setDescription('User to kick').setRequired(true))
          .addStringOption(o => o.setName('reason').setDescription('Kick reason').setRequired(false)))
        .addSubcommand(s => s.setName('mute').setDescription('Mute a user')
          .addUserOption(o => o.setName('user').setDescription('User to mute').setRequired(true))
          .addStringOption(o => o.setName('reason').setDescription('Mute reason').setRequired(false))
          .addIntegerOption(o => o.setName('duration').setDescription('Duration in minutes').setRequired(false)))
        .addSubcommand(s => s.setName('unmute').setDescription('Unmute a user')
          .addUserOption(o => o.setName('user').setDescription('User to unmute').setRequired(true))
          .addStringOption(o => o.setName('reason').setDescription('Unmute reason').setRequired(false)))
        .addSubcommand(s => s.setName('timeout').setDescription('Timeout a user')
          .addUserOption(o => o.setName('user').setDescription('User to timeout').setRequired(true))
          .addIntegerOption(o => o.setName('duration').setDescription('Duration in minutes').setRequired(true).setMinValue(1).setMaxValue(40320))
          .addStringOption(o => o.setName('reason').setDescription('Timeout reason').setRequired(false)))
        .addSubcommand(s => s.setName('warn').setDescription('Warn a user')
          .addUserOption(o => o.setName('user').setDescription('User to warn').setRequired(true))
          .addStringOption(o => o.setName('reason').setDescription('Warning reason').setRequired(true)))
        .addSubcommand(s => s.setName('unban').setDescription('Unban a user')
          .addStringOption(o => o.setName('user').setDescription('User ID to unban').setRequired(true))
          .addStringOption(o => o.setName('reason').setDescription('Unban reason').setRequired(false))))
      
      // Channel Actions Subcommand Group
      .addSubcommandGroup(g => g.setName('channel').setDescription('Channel moderation')
        .addSubcommand(s => s.setName('lock').setDescription('Lock a channel')
          .addChannelOption(o => o.setName('channel').setDescription('Channel to lock').setRequired(false))
          .addStringOption(o => o.setName('reason').setDescription('Lock reason').setRequired(false)))
        .addSubcommand(s => s.setName('unlock').setDescription('Unlock a channel')
          .addChannelOption(o => o.setName('channel').setDescription('Channel to unlock').setRequired(false))
          .addStringOption(o => o.setName('reason').setDescription('Unlock reason').setRequired(false)))
        .addSubcommand(s => s.setName('slowmode').setDescription('Set slowmode for a channel')
          .addChannelOption(o => o.setName('channel').setDescription('Channel to set slowmode').setRequired(false))
          .addIntegerOption(o => o.setName('seconds').setDescription('Slowmode duration (0-21600)').setRequired(true).setMinValue(0).setMaxValue(21600))
          .addStringOption(o => o.setName('reason').setDescription('Reason').setRequired(false))))
      
      // Role Actions Subcommand Group
      .addSubcommandGroup(g => g.setName('role').setDescription('Role management')
        .addSubcommand(s => s.setName('add').setDescription('Add role to user')
          .addUserOption(o => o.setName('user').setDescription('User to add role to').setRequired(true))
          .addRoleOption(o => o.setName('role').setDescription('Role to add').setRequired(true))
          .addStringOption(o => o.setName('reason').setDescription('Reason').setRequired(false)))
        .addSubcommand(s => s.setName('remove').setDescription('Remove role from user')
          .addUserOption(o => o.setName('user').setDescription('User to remove role from').setRequired(true))
          .addRoleOption(o => o.setName('role').setDescription('Role to remove').setRequired(true))
          .addStringOption(o => o.setName('reason').setDescription('Reason').setRequired(false))))
      
      // Message Actions Subcommand Group
      .addSubcommandGroup(g => g.setName('message').setDescription('Message moderation')
        .addSubcommand(s => s.setName('purge').setDescription('Purge messages')
          .addIntegerOption(o => o.setName('amount').setDescription('Number of messages to delete').setRequired(true).setMinValue(1).setMaxValue(100))
          .addUserOption(o => o.setName('user').setDescription('Only delete messages from this user').setRequired(false)))
        .addSubcommand(s => s.setName('purgeuser').setDescription('Purge all messages from a user')
          .addUserOption(o => o.setName('user').setDescription('User to purge messages from').setRequired(true))
          .addIntegerOption(o => o.setName('days').setDescription('Number of days to look back').setRequired(false).setMinValue(1).setMaxValue(7))))
      
      // Information Subcommand Group
      .addSubcommandGroup(g => g.setName('info').setDescription('Moderation information')
        .addSubcommand(s => s.setName('warnings').setDescription('View user warnings')
          .addUserOption(o => o.setName('user').setDescription('User to view warnings for').setRequired(false)))
        .addSubcommand(s => s.setName('history').setDescription('View moderation history')
          .addUserOption(o => o.setName('user').setDescription('User to view history for').setRequired(false)))
        .addSubcommand(s => s.setName('banlist').setDescription('View server ban list'))
        .addSubcommand(s => s.setName('auditlog').setDescription('View recent audit logs')))
      
      // Advanced Subcommand Group
      .addSubcommandGroup(g => g.setName('advanced').setDescription('Advanced moderation')
        .addSubcommand(s => s.setName('automod').setDescription('Toggle automod')
          .addStringOption(o => o.setName('action').setDescription('Action').setRequired(true)
            .addChoices({ name: 'Enable', value: 'enable' }, { name: 'Disable', value: 'disable' })))
        .addSubcommand(s => s.setName('raidmode').setDescription('Toggle raid mode')
          .addStringOption(o => o.setName('action').setDescription('Action').setRequired(true)
            .addChoices({ name: 'Enable', value: 'enable' }, { name: 'Disable', value: 'disable' })))
        .addSubcommand(s => s.setName('filter').setDescription('Manage message filters')
          .addStringOption(o => o.setName('action').setDescription('Action').setRequired(true)
            .addChoices({ name: 'Add', value: 'add' }, { name: 'Remove', value: 'remove' }, { name: 'List', value: 'list' }))
          .addStringOption(o => o.setName('word').setDescription('Word to filter').setRequired(false))))
      
      .setDMPermission(false)) as SlashCommandBuilder;
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    const subcommandGroup = i.options.getSubcommandGroup();
    const subcommand = i.options.getSubcommand();

    // Validate basic permissions
    const validation = await validationService.validateInteraction(i, {
      requireGuild: true,
      checkBlacklist: true,
    });

    if (!validation.valid) {
      await ErrorHandler.generic(i, new Error(validation.error));
      return;
    }

    if (subcommandGroup === 'user') {
      switch (subcommand) {
        case 'ban': await this.handleBan(i); break;
        case 'kick': await this.handleKick(i); break;
        case 'mute': await this.handleMute(i); break;
        case 'unmute': await this.handleUnmute(i); break;
        case 'timeout': await this.handleTimeout(i); break;
        case 'warn': await this.handleWarn(i); break;
        case 'unban': await this.handleUnban(i); break;
      }
    } else if (subcommandGroup === 'channel') {
      switch (subcommand) {
        case 'lock': await this.handleLock(i); break;
        case 'unlock': await this.handleUnlock(i); break;
        case 'slowmode': await this.handleSlowmode(i); break;
      }
    } else if (subcommandGroup === 'role') {
      switch (subcommand) {
        case 'add': await this.handleRoleAdd(i); break;
        case 'remove': await this.handleRoleRemove(i); break;
      }
    } else if (subcommandGroup === 'message') {
      switch (subcommand) {
        case 'purge': await this.handlePurge(i); break;
        case 'purgeuser': await this.handlePurgeUser(i); break;
      }
    } else if (subcommandGroup === 'info') {
      switch (subcommand) {
        case 'warnings': await this.handleWarnings(i); break;
        case 'history': await this.handleHistory(i); break;
        case 'banlist': await this.handleBanlist(i); break;
        case 'auditlog': await this.handleAuditlog(i); break;
      }
    } else if (subcommandGroup === 'advanced') {
      switch (subcommand) {
        case 'automod': await this.handleAutomod(i); break;
        case 'raidmode': await this.handleRaidmode(i); break;
        case 'filter': await this.handleFilter(i); break;
      }
    }
  }

  // User Action Handlers
  private async handleBan(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    const user = i.options.getUser('user', true);
    const reason = i.options.getString('reason') || 'No reason provided';
    const days = i.options.getInteger('days') || 0;
    const prisma = getPrismaClient();

    try {
      const member = await i.guild!.members.fetch(user.id).catch(() => null);
      if (member) {
        const modValidation = await validationService.validateModerationAction(i, member);
        if (!modValidation.valid) {
          await ErrorHandler.generic(i, new Error(modValidation.error));
          return;
        }
      }

      await i.guild!.members.ban(user.id, { reason, deleteMessageDays: days });

      await prisma.case.create({
        data: {
          guildId: i.guild!.id,
          userId: user.id,
          moderatorId: i.user.id,
          action: 'ban',
          reason,
          createdAt: new Date(),
        },
      });

      const embed = EmbedManager.moderationActionEmbed('ban', { tag: user.tag, id: user.id }, { tag: i.user.tag, id: i.user.id }, reason);
      await i.editReply({ embeds: [embed] });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleKick(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    const user = i.options.getUser('user', true);
    const reason = i.options.getString('reason') || 'No reason provided';
    const prisma = getPrismaClient();

    try {
      const member = await i.guild!.members.fetch(user.id);
      const modValidation = await validationService.validateModerationAction(i, member);
      if (!modValidation.valid) {
        await ErrorHandler.generic(i, new Error(modValidation.error));
        return;
      }

      await member.kick(reason);

      await prisma.case.create({
        data: {
          guildId: i.guild!.id,
          userId: user.id,
          moderatorId: i.user.id,
          action: 'kick',
          reason,
          createdAt: new Date(),
        },
      });

      const embed = EmbedManager.moderationActionEmbed('kick', { tag: user.tag, id: user.id }, { tag: i.user.tag, id: i.user.id }, reason);
      await i.editReply({ embeds: [embed] });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleMute(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    const user = i.options.getUser('user', true);
    const reason = i.options.getString('reason') || 'No reason provided';
    const duration = i.options.getInteger('duration') || 60;
    const prisma = getPrismaClient();

    try {
      const member = await i.guild!.members.fetch(user.id);
      const modValidation = await validationService.validateModerationAction(i, member);
      if (!modValidation.valid) {
        await ErrorHandler.generic(i, new Error(modValidation.error));
        return;
      }

      await member.timeout(duration * 60 * 1000, reason);

      await prisma.case.create({
        data: {
          guildId: i.guild!.id,
          userId: user.id,
          moderatorId: i.user.id,
          action: 'mute',
          reason,
          createdAt: new Date(),
        },
      });

      const embed = EmbedManager.moderationActionEmbed('mute', { tag: user.tag, id: user.id }, { tag: i.user.tag, id: i.user.id }, reason);
      await i.editReply({ embeds: [embed] });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleUnmute(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    const user = i.options.getUser('user', true);
    const reason = i.options.getString('reason') || 'No reason provided';
    const prisma = getPrismaClient();

    try {
      const member = await i.guild!.members.fetch(user.id);
      await member.timeout(null, reason);

      await prisma.case.create({
        data: {
          guildId: i.guild!.id,
          userId: user.id,
          moderatorId: i.user.id,
          action: 'unmute',
          reason,
          createdAt: new Date(),
        },
      });

      const embed = EmbedManager.moderationActionEmbed('unmute', { tag: user.tag, id: user.id }, { tag: i.user.tag, id: i.user.id }, reason);
      await i.editReply({ embeds: [embed] });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleTimeout(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    const user = i.options.getUser('user', true);
    const duration = i.options.getInteger('duration', true);
    const reason = i.options.getString('reason') || 'No reason provided';
    const prisma = getPrismaClient();

    try {
      const member = await i.guild!.members.fetch(user.id);
      const modValidation = await validationService.validateModerationAction(i, member);
      if (!modValidation.valid) {
        await ErrorHandler.generic(i, new Error(modValidation.error));
        return;
      }

      await member.timeout(duration * 60 * 1000, reason);

      await prisma.case.create({
        data: {
          guildId: i.guild!.id,
          userId: user.id,
          moderatorId: i.user.id,
          action: 'timeout',
          reason,
          createdAt: new Date(),
        },
      });

      const embed = EmbedManager.moderationActionEmbed('timeout', { tag: user.tag, id: user.id }, { tag: i.user.tag, id: i.user.id }, reason);
      await i.editReply({ embeds: [embed] });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleWarn(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    const user = i.options.getUser('user', true);
    const reason = i.options.getString('reason', true);
    const prisma = getPrismaClient();

    try {
      await prisma.warning.create({
        data: {
          guildId: i.guild!.id,
          userId: user.id,
          moderatorId: i.user.id,
          reason,
          createdAt: new Date(),
        },
      });

      const embed = EmbedManager.moderationActionEmbed('warn', { tag: user.tag, id: user.id }, { tag: i.user.tag, id: i.user.id }, reason);
      await i.editReply({ embeds: [embed] });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleUnban(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    const userId = i.options.getString('user', true);
    const reason = i.options.getString('reason') || 'No reason provided';
    const prisma = getPrismaClient();

    try {
      await i.guild!.bans.remove(userId, reason);

      await prisma.case.create({
        data: {
          guildId: i.guild!.id,
          userId,
          moderatorId: i.user.id,
          action: 'unban',
          reason,
          createdAt: new Date(),
        },
      });

      const embed = EmbedManager.moderationActionEmbed('unban', { tag: userId, id: userId }, { tag: i.user.tag, id: i.user.id }, reason);
      await i.editReply({ embeds: [embed] });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  // Channel Action Handlers
  private async handleLock(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    const channel = i.options.getChannel('channel') || i.channel;
    const reason = i.options.getString('reason') || 'No reason provided';

    try {
      if (!channel || !('permissionOverwrites' in channel)) {
        await ErrorHandler.generic(i, new Error('Invalid channel'));
        return;
      }

      await channel.permissionOverwrites.edit(i.guild!.roles.everyone, { SendMessages: false }, { reason });

      const embed = EmbedManager.moderation('Channel Locked', `${channel} has been locked`, { timestamp: true });
      await i.editReply({ embeds: [embed] });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleUnlock(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    const channel = i.options.getChannel('channel') || i.channel;
    const reason = i.options.getString('reason') || 'No reason provided';

    try {
      if (!channel || !('permissionOverwrites' in channel)) {
        await ErrorHandler.generic(i, new Error('Invalid channel'));
        return;
      }

      await channel.permissionOverwrites.edit(i.guild!.roles.everyone, { SendMessages: null }, { reason });

      const embed = EmbedManager.moderation('Channel Unlocked', `${channel} has been unlocked`, { timestamp: true });
      await i.editReply({ embeds: [embed] });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleSlowmode(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    const channel = i.options.getChannel('channel') || i.channel;
    const seconds = i.options.getInteger('seconds', true);
    const reason = i.options.getString('reason') || 'No reason provided';

    try {
      if (!channel || !('rateLimitPerUser' in channel)) {
        await ErrorHandler.generic(i, new Error('Invalid channel'));
        return;
      }

      await channel.setRateLimitPerUser(seconds, reason);

      const embed = EmbedManager.moderation('Slowmode Set', `${channel} slowmode set to ${seconds}s`, { timestamp: true });
      await i.editReply({ embeds: [embed] });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  // Role Action Handlers
  private async handleRoleAdd(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    const user = i.options.getUser('user', true);
    const role = i.options.getRole('role', true);
    const reason = i.options.getString('reason') || 'No reason provided';

    try {
      const member = await i.guild!.members.fetch(user.id);
      await member.roles.add(role, reason);

      const embed = EmbedManager.moderation('Role Added', `${user.tag} has been given ${role.name}`, { timestamp: true });
      await i.editReply({ embeds: [embed] });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleRoleRemove(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    const user = i.options.getUser('user', true);
    const role = i.options.getRole('role', true);
    const reason = i.options.getString('reason') || 'No reason provided';

    try {
      const member = await i.guild!.members.fetch(user.id);
      await member.roles.remove(role, reason);

      const embed = EmbedManager.moderation('Role Removed', `${role.name} has been removed from ${user.tag}`, { timestamp: true });
      await i.editReply({ embeds: [embed] });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  // Message Action Handlers
  private async handlePurge(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    const amount = i.options.getInteger('amount', true);
    const user = i.options.getUser('user');

    try {
      const messages = await i.channel!.messages.fetch({ limit: amount });
      let filtered = messages;

      if (user) {
        filtered = messages.filter(m => m.author.id === user.id);
      }

      await (i.channel! as any).bulkDelete(filtered);

      const embed = EmbedManager.moderation(`Purged ${filtered.size} messages`, user ? `From ${user.tag}` : 'All messages', { timestamp: true });
      await i.editReply({ embeds: [embed] });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handlePurgeUser(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    const user = i.options.getUser('user', true);
    const days = i.options.getInteger('days') || 7;

    try {
      const messages = await i.channel!.messages.fetch({ limit: 100 });
      const filtered = messages.filter(m => m.author.id === user.id && Date.now() - m.createdTimestamp < days * 24 * 60 * 60 * 1000);

      await (i.channel! as any).bulkDelete(filtered);

      const embed = EmbedManager.moderation(`Purged ${filtered.size} messages`, `From ${user.tag} (last ${days} days)`, { timestamp: true });
      await i.editReply({ embeds: [embed] });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  // Information Handlers
  private async handleWarnings(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    const user = i.options.getUser('user') || i.user;
    const prisma = getPrismaClient();

    try {
      const warnings = await prisma.warning.findMany({
        where: { guildId: i.guild!.id, userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 10,
      });

      const embed = EmbedManager.moderation('User Warnings', `${user.tag} has ${warnings.length} warnings`, {
        fields: warnings.map((w, i) => ({
          name: `Warning #${i + 1}`,
          value: `${w.reason} - <t:${Math.floor(w.createdAt.getTime() / 1000)}:R>`,
          inline: false,
        })),
        timestamp: true,
      });
      await i.editReply({ embeds: [embed] });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleHistory(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    const user = i.options.getUser('user') || i.user;
    const prisma = getPrismaClient();

    try {
      const cases = await prisma.case.findMany({
        where: { guildId: i.guild!.id, userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 10,
      });

      const embed = EmbedManager.moderation('Moderation History', `${user.tag} has ${cases.length} cases`, {
        fields: cases.map((c, i) => ({
          name: `Case #${i + 1} - ${c.action}`,
          value: `${c.reason} - <t:${Math.floor(c.createdAt.getTime() / 1000)}:R>`,
          inline: false,
        })),
        timestamp: true,
      });
      await i.editReply({ embeds: [embed] });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleBanlist(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();

    try {
      const bans = await i.guild!.bans.fetch();
      const banList = bans.map(b => `${b.user.tag} (${b.user.id})`).slice(0, 25).join('\n');

      const embed = EmbedManager.moderation('Server Banlist', `Total bans: ${bans.size}`, {
        description: banList || 'No bans',
        timestamp: true,
      });
      await i.editReply({ embeds: [embed] });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleAuditlog(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();

    try {
      const logs = await i.guild!.fetchAuditLogs({ limit: 10 });
      const logEntries = logs.entries.map(e => `${e.executor.tag}: ${e.action} - <t:${Math.floor(e.createdTimestamp / 1000)}:R>`).join('\n');

      const embed = EmbedManager.moderation('Recent Audit Logs', 'Last 10 actions', {
        description: logEntries || 'No recent logs',
        timestamp: true,
      });
      await i.editReply({ embeds: [embed] });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  // Advanced Handlers
  private async handleAutomod(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    const action = i.options.getString('action', true);
    const prisma = getPrismaClient();

    try {
      await prisma.guildSettings.upsert({
        where: { guildId: i.guild!.id },
        create: { guildId: i.guild!.id, automodEnabled: action === 'enable' },
        update: { automodEnabled: action === 'enable' },
      });

      const embed = EmbedManager.moderation('Automod', `Automod has been ${action}d`, { timestamp: true });
      await i.editReply({ embeds: [embed] });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleRaidmode(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    const action = i.options.getString('action', true);
    const prisma = getPrismaClient();

    try {
      await prisma.guildSettings.upsert({
        where: { guildId: i.guild!.id },
        create: { guildId: i.guild!.id, raidModeEnabled: action === 'enable' },
        update: { raidModeEnabled: action === 'enable' },
      });

      const embed = EmbedManager.moderation('Raid Mode', `Raid mode has been ${action}d`, { timestamp: true });
      await i.editReply({ embeds: [embed] });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleFilter(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    const action = i.options.getString('action', true);
    const word = i.options.getString('word');
    const prisma = getPrismaClient();

    try {
      if (action === 'list') {
        const filters = await prisma.messageFilter.findMany({
          where: { guildId: i.guild!.id },
        });

        const embed = EmbedManager.moderation('Message Filters', `Total filters: ${filters.length}`, {
          fields: filters.map(f => ({ name: f.word, value: 'Filtered', inline: true })),
          timestamp: true,
        });
        await i.editReply({ embeds: [embed] });
      } else if (action === 'add' && word) {
        await prisma.messageFilter.create({
          data: { guildId: i.guild!.id, word },
        });

        const embed = EmbedManager.moderation('Filter Added', `"${word}" has been added to filters`, { timestamp: true });
        await i.editReply({ embeds: [embed] });
      } else if (action === 'remove' && word) {
        await prisma.messageFilter.deleteMany({
          where: { guildId: i.guild!.id, word },
        });

        const embed = EmbedManager.moderation('Filter Removed', `"${word}" has been removed from filters`, { timestamp: true });
        await i.editReply({ embeds: [embed] });
      }
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  public async executePrefix(m: Message, args: string[]): Promise<void> {
    await m.reply({ content: 'Use slash command /mod for full options.' });
  }
}

export default ModerationCommand;
