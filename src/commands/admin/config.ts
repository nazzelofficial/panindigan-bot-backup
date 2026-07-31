// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { DashboardUI } from '../../structures/DashboardUI.js';
import { ButtonManager } from '../../structures/ButtonManager.js';
import { EmbedManager } from '../../structures/EmbedManager.js';
import { ErrorHandler } from '../../handlers/ErrorHandler.js';
import { SuccessHandler } from '../../handlers/SuccessHandler.js';
import { getPrismaClient } from '../../database/postgresql/client.js';

export class ConfigCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'config',
      description: 'View and modify server configuration',
      category: 'admin',
      cooldown: 5,
      userPermissions: [PermissionFlagsBits.Administrator],
      botPermissions: [PermissionFlagsBits.ManageGuild],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['settings', 'configure'],
      examples: ['/config', '/config roles admin @Admin', '/config channels bot #bot-commands'],
    };
    super(options);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addSubcommandGroup(g => g.setName('roles').setDescription('Configure server roles')
        .addSubcommand(s => s.setName('admin').setDescription('Set the admin role')
          .addRoleOption(o => o.setName('role').setDescription('Role to set as admin').setRequired(true)))
        .addSubcommand(s => s.setName('mod').setDescription('Set the moderator role')
          .addRoleOption(o => o.setName('role').setDescription('Role to set as moderator').setRequired(true)))
        .addSubcommand(s => s.setName('dj').setDescription('Set the DJ role')
          .addRoleOption(o => o.setName('role').setDescription('Role to set as DJ').setRequired(true)))
        .addSubcommand(s => s.setName('mute').setDescription('Set the mute role')
          .addRoleOption(o => o.setName('role').setDescription('Role to set as muted').setRequired(true)))
        .addSubcommand(s => s.setName('bot').setDescription('Set the bot role')
          .addRoleOption(o => o.setName('role').setDescription('Role to set as bot').setRequired(true))))
      .addSubcommandGroup(g => g.setName('channels').setDescription('Configure server channels')
        .addSubcommand(s => s.setName('application').setDescription('Set the applications channel')
          .addChannelOption(o => o.setName('channel').setDescription('Channel for applications').setRequired(true)))
        .addSubcommand(s => s.setName('bot').setDescription('Set the bot commands channel')
          .addChannelOption(o => o.setName('channel').setDescription('Channel for bot commands').setRequired(true)))
        .addSubcommand(s => s.setName('economy').setDescription('Set the economy channel')
          .addChannelOption(o => o.setName('channel').setDescription('Channel for economy').setRequired(true)))
        .addSubcommand(s => s.setName('giveaway').setDescription('Set the giveaways channel')
          .addChannelOption(o => o.setName('channel').setDescription('Channel for giveaways').setRequired(true)))
        .addSubcommand(s => s.setName('levelup').setDescription('Set the level-up announcements channel')
          .addChannelOption(o => o.setName('channel').setDescription('Channel for level-up messages').setRequired(true)))
        .addSubcommand(s => s.setName('logs').setDescription('Set the moderation logs channel')
          .addChannelOption(o => o.setName('channel').setDescription('Channel for mod logs').setRequired(true)))
        .addSubcommand(s => s.setName('music').setDescription('Set the music channel')
          .addChannelOption(o => o.setName('channel').setDescription('Channel for music').setRequired(true)))
        .addSubcommand(s => s.setName('starboard').setDescription('Set the starboard channel')
          .addChannelOption(o => o.setName('channel').setDescription('Channel for starboard').setRequired(true))))
      .addSubcommandGroup(g => g.setName('general').setDescription('General server settings')
        .addSubcommand(s => s.setName('prefix').setDescription('Change the bot prefix')
          .addStringOption(o => o.setName('prefix').setDescription('New prefix (max 5 characters)').setRequired(true).setMaxLength(5)))
        .addSubcommand(s => s.setName('language').setDescription('Change the bot language')
          .addStringOption(o => o.setName('language').setDescription('Language code').setRequired(true)
            .addChoices({ name: 'English', value: 'en' }, { name: 'Filipino', value: 'fil' }))))
      .addSubcommandGroup(g => g.setName('ignore').setDescription('Manage ignored channels and users')
        .addSubcommand(s => s.setName('channel').setDescription('Ignore or unignore a channel')
          .addChannelOption(o => o.setName('channel').setDescription('Channel to ignore/unignore').setRequired(true))
          .addStringOption(o => o.setName('action').setDescription('Action to perform').setRequired(true)
            .addChoices({ name: 'Add', value: 'add' }, { name: 'Remove', value: 'remove' })))
        .addSubcommand(s => s.setName('user').setDescription('Ignore or unignore a user')
          .addUserOption(o => o.setName('user').setDescription('User to ignore/unignore').setRequired(true))
          .addStringOption(o => o.setName('action').setDescription('Action to perform').setRequired(true)
            .addChoices({ name: 'Add', value: 'add' }, { name: 'Remove', value: 'remove' }))))
      .setDMPermission(false)) as SlashCommandBuilder;
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const subcommandGroup = interaction.options.getSubcommandGroup(false);

    if (!subcommandGroup) {
      await this.showConfig(interaction);
      return;
    }

    if (subcommandGroup === 'roles') {
      await this.handleRoles(interaction);
    } else if (subcommandGroup === 'channels') {
      await this.handleChannels(interaction);
    } else if (subcommandGroup === 'general') {
      await this.handleGeneral(interaction);
    } else if (subcommandGroup === 'ignore') {
      await this.handleIgnore(interaction);
    }
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    if (args.length === 0) {
      await this.showConfig(message);
      return;
    }

    const [group, action, ...value] = args;

    if (group === 'roles') {
      await this.handleRolesPrefix(message, action, value);
    } else if (group === 'channels') {
      await this.handleChannelsPrefix(message, action, value);
    } else if (group === 'general') {
      await this.handleGeneralPrefix(message, action, value);
    } else if (group === 'ignore') {
      await this.handleIgnorePrefix(message, action, value);
    } else {
      await this.showConfig(message);
    }
  }

  private async showConfig(interaction: ChatInputCommandInteraction | Message): Promise<void> {
    if (!interaction.guild) return;

    const prisma = getPrismaClient();
    let guild = await prisma.guild.findUnique({
      where: { guildId: interaction.guild.id },
    });

    // Create guild record if it doesn't exist
    if (!guild) {
      guild = await prisma.guild.create({
        data: { guildId: interaction.guild.id },
      });
    }

    const components = [
      ButtonManager.dashboard('config', {
        showSettings: true,
        showStatistics: false,
        showRefresh: true,
        showClose: false,
      }),
    ];

    if (interaction instanceof ChatInputCommandInteraction) {
      await interaction.reply({ embeds: [DashboardUI.createSettings(interaction.guild.name, {
        prefix: guild?.prefix || 'p!',
        language: guild?.language || 'en',
        welcomeChannel: guild?.welcomeChannelId ? `<#${guild.welcomeChannelId}>` : undefined,
        goodbyeChannel: guild?.goodbyeChannelId ? `<#${guild.goodbyeChannelId}>` : undefined,
        logChannel: guild?.modLogChannelId ? `<#${guild.modLogChannelId}>` : undefined,
        musicChannel: guild?.musicChannelId ? `<#${guild.musicChannelId}>` : undefined,
        levelUpChannel: guild?.levelUpChannelId ? `<#${guild.levelUpChannelId}>` : undefined,
      })], components });
    } else {
      await interaction.reply({ embeds: [DashboardUI.createSettings(interaction.guild.name, {
        prefix: guild?.prefix || 'p!',
        language: guild?.language || 'en',
        welcomeChannel: guild?.welcomeChannelId ? `<#${guild.welcomeChannelId}>` : undefined,
        goodbyeChannel: guild?.goodbyeChannelId ? `<#${guild.goodbyeChannelId}>` : undefined,
        logChannel: guild?.modLogChannelId ? `<#${guild.modLogChannelId}>` : undefined,
        musicChannel: guild?.musicChannelId ? `<#${guild.musicChannelId}>` : undefined,
        levelUpChannel: guild?.levelUpChannelId ? `<#${guild.levelUpChannelId}>` : undefined,
      })], components });
    }
  }

  private async handleRoles(interaction: ChatInputCommandInteraction): Promise<void> {
    const action = interaction.options.getSubcommand(true);
    const prisma = getPrismaClient();

    if (!interaction.guild) return;

    let updateData: any = {};
    let roleName = '';

    switch (action) {
      case 'admin':
        const adminRole = interaction.options.getRole('role');
        if (!adminRole) {
          await ErrorHandler.invalidArgument(interaction, 'role', 'Role to set as admin');
          return;
        }
        updateData = { adminRoleId: adminRole.id };
        roleName = 'Admin';
        break;
      case 'mod':
        const modRole = interaction.options.getRole('role');
        if (!modRole) {
          await ErrorHandler.invalidArgument(interaction, 'role', 'Role to set as moderator');
          return;
        }
        updateData = { modRoleId: modRole.id };
        roleName = 'Moderator';
        break;
      case 'dj':
        const djRole = interaction.options.getRole('role');
        if (!djRole) {
          await ErrorHandler.invalidArgument(interaction, 'role', 'Role to set as DJ');
          return;
        }
        updateData = { djRoleId: djRole.id };
        roleName = 'DJ';
        break;
      case 'mute':
        const muteRole = interaction.options.getRole('role');
        if (!muteRole) {
          await ErrorHandler.invalidArgument(interaction, 'role', 'Role to set as mute');
          return;
        }
        updateData = { muteRoleId: muteRole.id };
        roleName = 'Mute';
        break;
      case 'bot':
        const botRole = interaction.options.getRole('role');
        if (!botRole) {
          await ErrorHandler.invalidArgument(interaction, 'role', 'Role to set as bot');
          return;
        }
        updateData = { botRoleId: botRole.id };
        roleName = 'Bot';
        break;
    }

    await prisma.guild.upsert({
      where: { guildId: interaction.guild.id },
      create: { guildId: interaction.guild.id, ...updateData },
      update: updateData,
    });

    const description = `**Role:** ${roleName}\n**Updated by:** ${interaction.user.tag}`;
    await SuccessHandler.configuration(interaction, `✅ ${roleName} Role Set`, description);
  }

  private async handleChannels(interaction: ChatInputCommandInteraction): Promise<void> {
    const action = interaction.options.getSubcommand(true);
    const prisma = getPrismaClient();

    if (!interaction.guild) return;

    let updateData: any = {};
    let channelName = '';

    switch (action) {
      case 'application':
        const appChannel = interaction.options.getChannel('channel');
        if (!appChannel) {
          await ErrorHandler.invalidArgument(interaction, 'channel', 'Channel for applications');
          return;
        }
        updateData = { applicationChannelId: appChannel.id };
        channelName = 'Application';
        break;
      case 'bot':
        const botChannel = interaction.options.getChannel('channel');
        if (!botChannel) {
          await ErrorHandler.invalidArgument(interaction, 'channel', 'Channel for bot commands');
          return;
        }
        updateData = { botChannelId: botChannel.id };
        channelName = 'Bot';
        break;
      case 'economy':
        const econChannel = interaction.options.getChannel('channel');
        if (!econChannel) {
          await ErrorHandler.invalidArgument(interaction, 'channel', 'Channel for economy');
          return;
        }
        updateData = { economyChannelId: econChannel.id };
        channelName = 'Economy';
        break;
      case 'giveaway':
        const gaChannel = interaction.options.getChannel('channel');
        if (!gaChannel) {
          await ErrorHandler.invalidArgument(interaction, 'channel', 'Channel for giveaways');
          return;
        }
        updateData = { giveawayChannelId: gaChannel.id };
        channelName = 'Giveaway';
        break;
      case 'levelup':
        const levelChannel = interaction.options.getChannel('channel');
        if (!levelChannel) {
          await ErrorHandler.invalidArgument(interaction, 'channel', 'Channel for level up messages');
          return;
        }
        updateData = { levelUpChannelId: levelChannel.id };
        channelName = 'Level Up';
        break;
      case 'logs':
        const logChannel = interaction.options.getChannel('channel');
        if (!logChannel) {
          await ErrorHandler.invalidArgument(interaction, 'channel', 'Channel for logs');
          return;
        }
        updateData = { modLogChannelId: logChannel.id };
        channelName = 'Logs';
        break;
      case 'music':
        const musicChannel = interaction.options.getChannel('channel');
        if (!musicChannel) {
          await ErrorHandler.invalidArgument(interaction, 'channel', 'Channel for music');
          return;
        }
        updateData = { musicChannelId: musicChannel.id };
        channelName = 'Music';
        break;
      case 'starboard':
        const starChannel = interaction.options.getChannel('channel');
        if (!starChannel) {
          await ErrorHandler.invalidArgument(interaction, 'channel', 'Channel for starboard');
          return;
        }
        updateData = { starboardChannelId: starChannel.id };
        channelName = 'Starboard';
        break;
    }

    await prisma.guild.upsert({
      where: { guildId: interaction.guild.id },
      create: { guildId: interaction.guild.id, ...updateData },
      update: updateData,
    });

    const description = `**Channel:** ${channelName}\n**Updated by:** ${interaction.user.tag}`;
    await SuccessHandler.configuration(interaction, `✅ ${channelName} Channel Set`, description);
  }

  private async handleGeneral(interaction: ChatInputCommandInteraction): Promise<void> {
    const action = interaction.options.getSubcommand(true);
    const prisma = getPrismaClient();

    if (!interaction.guild) return;

    let updateData: any = {};
    let settingName = '';

    switch (action) {
      case 'prefix':
        const prefix = interaction.options.getString('prefix');
        if (!prefix) {
          await ErrorHandler.invalidArgument(interaction, 'prefix', 'New prefix');
          return;
        }
        if (prefix.length > 5) {
          await ErrorHandler.generic(interaction, 'Prefix cannot exceed 5 characters.');
          return;
        }
        updateData = { prefix };
        settingName = 'Prefix';
        break;
      case 'language':
        const language = interaction.options.getString('language');
        if (!language) {
          await ErrorHandler.invalidArgument(interaction, 'language', 'Language code (en or fil)');
          return;
        }
        if (!['en', 'fil'].includes(language)) {
          await ErrorHandler.invalidArgument(interaction, 'language', 'Either "en" (English) or "fil" (Filipino)');
          return;
        }
        updateData = { language };
        settingName = 'Language';
        break;
    }

    await prisma.guild.upsert({
      where: { guildId: interaction.guild.id },
      create: { guildId: interaction.guild.id, ...updateData },
      update: updateData,
    });

    const description = `**Setting:** ${settingName}\n**Updated by:** ${interaction.user.tag}`;
    await SuccessHandler.configuration(interaction, `✅ ${settingName} Updated`, description);
  }

  private async handleIgnore(interaction: ChatInputCommandInteraction): Promise<void> {
    const action = interaction.options.getSubcommand(true);
    const prisma = getPrismaClient();

    if (!interaction.guild) return;

    switch (action) {
      case 'channel':
        const channel = interaction.options.getChannel('channel');
        const channelAction = interaction.options.getString('action');
        if (!channel) {
          await ErrorHandler.invalidArgument(interaction, 'channel', 'Channel to ignore/unignore');
          return;
        }
        if (!channelAction) {
          await ErrorHandler.invalidArgument(interaction, 'action', 'Either "add" or "remove"');
          return;
        }

        const ignoredChannels = interaction.guild.ignoredChannels || [];
        if (channelAction === 'add') {
          if (ignoredChannels.includes(channel.id)) {
            await ErrorHandler.generic(interaction, 'Channel is already ignored.');
            return;
          }
          ignoredChannels.push(channel.id);
        } else {
          const index = ignoredChannels.indexOf(channel.id);
          if (index === -1) {
            await ErrorHandler.generic(interaction, 'Channel is not ignored.');
            return;
          }
          ignoredChannels.splice(index, 1);
        }

        await prisma.guild.upsert({
          where: { guildId: interaction.guild.id },
          create: { guildId: interaction.guild.id, ignoredChannels },
          update: { ignoredChannels },
        });

        const actionText = channelAction === 'add' ? 'Ignored' : 'Unignored';
        await SuccessHandler.configuration(interaction, `✅ Channel ${actionText}`, `**Channel:** ${channel.toString()}\n**Updated by:** ${interaction.user.tag}`);
        break;

      case 'user':
        const user = interaction.options.getUser('user');
        const userAction = interaction.options.getString('action');
        if (!user) {
          await ErrorHandler.invalidArgument(interaction, 'user', 'User to ignore/unignore');
          return;
        }
        if (!userAction) {
          await ErrorHandler.invalidArgument(interaction, 'action', 'Either "add" or "remove"');
          return;
        }

        const ignoredUsers = interaction.guild.ignoredUsers || [];
        if (userAction === 'add') {
          if (ignoredUsers.includes(user.id)) {
            await ErrorHandler.generic(interaction, 'User is already ignored.');
            return;
          }
          ignoredUsers.push(user.id);
        } else {
          const index = ignoredUsers.indexOf(user.id);
          if (index === -1) {
            await ErrorHandler.generic(interaction, 'User is not ignored.');
            return;
          }
          ignoredUsers.splice(index, 1);
        }

        await prisma.guild.upsert({
          where: { guildId: interaction.guild.id },
          create: { guildId: interaction.guild.id, ignoredUsers },
          update: { ignoredUsers },
        });

        const userActionText = userAction === 'add' ? 'Ignored' : 'Unignored';
        await SuccessHandler.configuration(interaction, `✅ User ${userActionText}`, `**User:** ${user.toString()}\n**Updated by:** ${interaction.user.tag}`);
        break;
    }
  }

  private async handleRolesPrefix(message: Message, action: string, value: string[]): Promise<void> {
    const role = message.mentions.roles.first();
    if (!role) {
      await ErrorHandler.invalidArgument(message, 'role', 'Role mention');
      return;
    }

    if (!message.guild) return;

    const prisma = getPrismaClient();
    let updateData: any = {};
    let roleName = '';

    switch (action) {
      case 'admin':
        updateData = { adminRoleId: role.id };
        roleName = 'Admin';
        break;
      case 'mod':
      case 'moderator':
        updateData = { modRoleId: role.id };
        roleName = 'Moderator';
        break;
      case 'dj':
        updateData = { djRoleId: role.id };
        roleName = 'DJ';
        break;
      case 'mute':
      case 'muted':
        updateData = { muteRoleId: role.id };
        roleName = 'Mute';
        break;
      case 'bot':
        updateData = { botRoleId: role.id };
        roleName = 'Bot';
        break;
      default:
        await ErrorHandler.generic(message, 'Invalid role type. Use: admin, mod, dj, mute, bot');
        return;
    }

    await prisma.guild.upsert({
      where: { guildId: message.guild.id },
      create: { guildId: message.guild.id, ...updateData },
      update: updateData,
    });

    const description = `**Role:** ${role.toString()}\n**Updated by:** ${message.author.tag}`;
    const embed = EmbedManager.success(`✅ ${roleName} Role Set`, description);
    await message.reply({ embeds: [embed] });
  }

  private async handleChannelsPrefix(message: Message, action: string, value: string[]): Promise<void> {
    const channel = message.mentions.channels.first();
    if (!channel) {
      await ErrorHandler.invalidArgument(message, 'channel', 'Channel mention');
      return;
    }

    if (!message.guild) return;

    const prisma = getPrismaClient();
    let updateData: any = {};
    let channelName = '';

    switch (action) {
      case 'application':
        updateData = { applicationChannelId: channel.id };
        channelName = 'Application';
        break;
      case 'bot':
        updateData = { botChannelId: channel.id };
        channelName = 'Bot';
        break;
      case 'economy':
        updateData = { economyChannelId: channel.id };
        channelName = 'Economy';
        break;
      case 'giveaway':
        updateData = { giveawayChannelId: channel.id };
        channelName = 'Giveaway';
        break;
      case 'levelup':
        updateData = { levelUpChannelId: channel.id };
        channelName = 'Level Up';
        break;
      case 'logs':
      case 'log':
        updateData = { modLogChannelId: channel.id };
        channelName = 'Logs';
        break;
      case 'music':
        updateData = { musicChannelId: channel.id };
        channelName = 'Music';
        break;
      case 'starboard':
        updateData = { starboardChannelId: channel.id };
        channelName = 'Starboard';
        break;
      default:
        await ErrorHandler.generic(message, 'Invalid channel type. Use: application, bot, economy, giveaway, levelup, logs, music, starboard');
        return;
    }

    await prisma.guild.upsert({
      where: { guildId: message.guild.id },
      create: { guildId: message.guild.id, ...updateData },
      update: updateData,
    });

    const description = `**Channel:** ${channel.toString()}\n**Updated by:** ${message.author.tag}`;
    const embed = EmbedManager.success(`✅ ${channelName} Channel Set`, description);
    await message.reply({ embeds: [embed] });
  }

  private async handleGeneralPrefix(message: Message, action: string, value: string[]): Promise<void> {
    const prisma = getPrismaClient();

    if (!message.guild) return;

    let updateData: any = {};
    let settingName = '';

    switch (action) {
      case 'prefix':
        const prefix = value[0];
        if (!prefix) {
          await ErrorHandler.invalidArgument(message, 'prefix', 'New prefix');
          return;
        }
        if (prefix.length > 5) {
          await ErrorHandler.generic(message, 'Prefix cannot exceed 5 characters.');
          return;
        }
        updateData = { prefix };
        settingName = 'Prefix';
        break;
      case 'language':
      case 'lang':
        const language = value[0];
        if (!language) {
          await ErrorHandler.invalidArgument(message, 'language', 'Language code (en or fil)');
          return;
        }
        if (!['en', 'fil'].includes(language)) {
          await ErrorHandler.invalidArgument(message, 'language', 'Either "en" (English) or "fil" (Filipino)');
          return;
        }
        updateData = { language };
        settingName = 'Language';
        break;
      default:
        await ErrorHandler.generic(message, 'Invalid setting type. Use: prefix, language');
        return;
    }

    await prisma.guild.upsert({
      where: { guildId: message.guild.id },
      create: { guildId: message.guild.id, ...updateData },
      update: updateData,
    });

    const description = `**Setting:** ${settingName}\n**Updated by:** ${message.author.tag}`;
    const embed = EmbedManager.success(`✅ ${settingName} Updated`, description);
    await message.reply({ embeds: [embed] });
  }

  private async handleIgnorePrefix(message: Message, action: string, value: string[]): Promise<void> {
    const prisma = getPrismaClient();

    if (!message.guild) return;

    const ignoreAction = value[0];
    const target = action === 'channel' ? message.mentions.channels.first() : message.mentions.users.first();

    if (!target) {
      await ErrorHandler.invalidArgument(message, action, `${action} to ignore/unignore`);
      return;
    }

    if (!ignoreAction || !['add', 'remove'].includes(ignoreAction)) {
      await ErrorHandler.invalidArgument(message, 'action', 'Either "add" or "remove"');
      return;
    }

    const ignoredList = action === 'channel' ? (message.guild.ignoredChannels || []) : (message.guild.ignoredUsers || []);
    const targetId = target.id;

    if (ignoreAction === 'add') {
      if (ignoredList.includes(targetId)) {
        await ErrorHandler.generic(message, `${action} is already ignored.`);
        return;
      }
      ignoredList.push(targetId);
    } else {
      const index = ignoredList.indexOf(targetId);
      if (index === -1) {
        await ErrorHandler.generic(message, `${action} is not ignored.`);
        return;
      }
      ignoredList.splice(index, 1);
    }

    const updateData = action === 'channel' ? { ignoredChannels: ignoredList } : { ignoredUsers: ignoredList };

    await prisma.guild.upsert({
      where: { guildId: message.guild.id },
      create: { guildId: message.guild.id, ...updateData },
      update: updateData,
    });

    const actionText = ignoreAction === 'add' ? 'Ignored' : 'Unignored';
    const description = `**${action.charAt(0).toUpperCase() + action.slice(1)}:** ${target.toString()}\n**Updated by:** ${message.author.tag}`;
    const embed = EmbedManager.success(`✅ ${action.charAt(0).toUpperCase() + action.slice(1)} ${actionText}`, description);
    await message.reply({ embeds: [embed] });
  }
}

export default ConfigCommand;
