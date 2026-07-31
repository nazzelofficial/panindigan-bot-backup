// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, PermissionFlagsBits, PresenceStatusData, SlashCommandBuilder } from 'discord.js';
import { EmbedManager } from '../../structures/EmbedManager.js';
import { ErrorHandler } from '../../handlers/ErrorHandler.js';
import { SuccessHandler } from '../../handlers/SuccessHandler.js';
import { getPrismaClient } from '../../database/postgresql/client.js';

export class BotCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'bot',
      description: 'Manage bot profile and server operations',
      category: 'admin',
      cooldown: 5,
      userPermissions: [PermissionFlagsBits.Administrator],
      botPermissions: [PermissionFlagsBits.ManageGuild],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['botprofile', 'managebot'],
      examples: ['/bot profile avatar https://example.com/image.png', '/bot server leave', '/bot profile status online'],
    };
    super(options);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addSubcommandGroup(g => g.setName('profile').setDescription('Manage bot profile settings')
        .addSubcommand(s => s.setName('avatar').setDescription('Change the bot avatar')
          .addStringOption(o => o.setName('url').setDescription('Image URL for the new avatar').setRequired(true)))
        .addSubcommand(s => s.setName('name').setDescription('Change the bot username')
          .addStringOption(o => o.setName('name').setDescription('New bot username (2-32 characters)').setRequired(true)))
        .addSubcommand(s => s.setName('status').setDescription('Change the bot online status')
          .addStringOption(o => o.setName('status').setDescription('New status').setRequired(true)
            .addChoices(
              { name: 'Online', value: 'online' },
              { name: 'Idle', value: 'idle' },
              { name: 'Do Not Disturb', value: 'dnd' },
              { name: 'Invisible', value: 'invisible' },
            )))
        .addSubcommand(s => s.setName('presence').setDescription('Change the bot activity/presence text')
          .addStringOption(o => o.setName('presence').setDescription('Activity text (max 128 characters)').setRequired(true))))
      .addSubcommandGroup(g => g.setName('server').setDescription('Manage server operations')
        .addSubcommand(s => s.setName('leave').setDescription('Make the bot leave this server')
          .addBooleanOption(o => o.setName('confirm').setDescription('Confirm the action').setRequired(true)))
        .addSubcommand(s => s.setName('reset').setDescription('Reset all server data for this server')
          .addBooleanOption(o => o.setName('confirm').setDescription('Confirm the action').setRequired(true))))
      .setDMPermission(false)) as SlashCommandBuilder;
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const group = interaction.options.getSubcommandGroup(false);

    if (!interaction.guild) return;

    if (group === 'profile') {
      await this.handleProfile(interaction);
    } else if (group === 'server') {
      await this.handleServer(interaction);
    }
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    if (args.length < 2) {
      await ErrorHandler.invalidArgument(message, 'action', 'profile or server');
      return;
    }

    const [group, action, ...value] = args;

    if (!message.guild) return;

    if (group === 'profile') {
      await this.handleProfilePrefix(message, action, value.join(' '));
    } else if (group === 'server') {
      await this.handleServerPrefix(message, action, value.join(' '));
    } else {
      await ErrorHandler.invalidArgument(message, 'group', 'profile or server');
    }
  }

  private async handleProfile(interaction: ChatInputCommandInteraction): Promise<void> {
    const action = interaction.options.getSubcommand(true);

    switch (action) {
      case 'avatar':
        const avatarUrl = interaction.options.getString('url');
        if (!avatarUrl) {
          await ErrorHandler.invalidArgument(interaction, 'url', 'Avatar image URL');
          return;
        }

        try {
          await interaction.client.user.setAvatar(avatarUrl);
          const description = `**Avatar URL:** ${avatarUrl}\n**Updated by:** ${interaction.user.tag}`;
          await SuccessHandler.configuration(interaction, '✅ Bot Avatar Updated', description);
        } catch (error) {
          await ErrorHandler.generic(interaction, 'Failed to update avatar. Check the URL and try again.');
        }
        break;

      case 'name':
        const newName = interaction.options.getString('name');
        if (!newName) {
          await ErrorHandler.invalidArgument(interaction, 'name', 'New bot name');
          return;
        }

        if (newName.length < 2 || newName.length > 32) {
          await ErrorHandler.generic(interaction, 'Bot name must be between 2 and 32 characters.');
          return;
        }

        try {
          await interaction.client.user.setUsername(newName);
          const description = `**New Name:** ${newName}\n**Updated by:** ${interaction.user.tag}`;
          await SuccessHandler.configuration(interaction, '✅ Bot Name Updated', description);
        } catch (error) {
          await ErrorHandler.generic(interaction, 'Failed to update name. It may be changing too frequently.');
        }
        break;

      case 'status':
        const status = interaction.options.getString('status') as PresenceStatusData;
        if (!status) {
          await ErrorHandler.invalidArgument(interaction, 'status', 'online, idle, dnd, or invisible');
          return;
        }

        if (!['online', 'idle', 'dnd', 'invisible'].includes(status)) {
          await ErrorHandler.invalidArgument(interaction, 'status', 'online, idle, dnd, or invisible');
          return;
        }

        try {
          await interaction.client.user.setStatus(status);
          const description = `**Status:** ${status}\n**Updated by:** ${interaction.user.tag}`;
          await SuccessHandler.configuration(interaction, '✅ Bot Status Updated', description);
        } catch (error) {
          await ErrorHandler.generic(interaction, 'Failed to update status.');
        }
        break;

      case 'presence':
        const presence = interaction.options.getString('presence');
        if (!presence) {
          await ErrorHandler.invalidArgument(interaction, 'presence', 'Activity text');
          return;
        }

        if (presence.length > 128) {
          await ErrorHandler.generic(interaction, 'Presence text cannot exceed 128 characters.');
          return;
        }

        try {
          await interaction.client.user.setActivity(presence, { type: 0 });
          const description = `**Presence:** ${presence}\n**Updated by:** ${interaction.user.tag}`;
          await SuccessHandler.configuration(interaction, '✅ Bot Presence Updated', description);
        } catch (error) {
          await ErrorHandler.generic(interaction, 'Failed to update presence.');
        }
        break;
    }
  }

  private async handleServer(interaction: ChatInputCommandInteraction): Promise<void> {
    const action = interaction.options.getSubcommand(true);

    if (!interaction.guild) return;

    switch (action) {
      case 'leave':
        const confirm = interaction.options.getBoolean('confirm');
        if (!confirm) {
          await ErrorHandler.generic(interaction, 'You must confirm with --confirm to leave the server.');
          return;
        }

        try {
          await interaction.guild.leave();
          // This won't execute as the bot leaves
          await SuccessHandler.configuration(interaction, '✅ Left Server', `**Server:** ${interaction.guild.name}\n**Left by:** ${interaction.user.tag}`);
        } catch (error) {
          await ErrorHandler.generic(interaction, 'Failed to leave server.');
        }
        break;

      case 'reset':
        const resetConfirm = interaction.options.getBoolean('confirm');
        if (!resetConfirm) {
          await ErrorHandler.generic(interaction, 'You must confirm with --confirm to reset server data.');
          return;
        }

        try {
          const prisma = getPrismaClient();
          await prisma.guild.delete({
            where: { guildId: interaction.guild.id },
          });

          const description = `**Server:** ${interaction.guild.name}\n**Reset by:** ${interaction.user.tag}\n\n⚠️ All server data has been deleted. Run setup to reconfigure the bot.`;
          await SuccessHandler.configuration(interaction, '✅ Server Data Reset', description);
        } catch (error) {
          await ErrorHandler.generic(interaction, 'Failed to reset server data.');
        }
        break;
    }
  }

  private async handleProfilePrefix(message: Message, action: string, value: string): Promise<void> {
    switch (action) {
      case 'avatar':
        if (!value) {
          await ErrorHandler.invalidArgument(message, 'url', 'Avatar image URL');
          return;
        }

        try {
          await message.client.user.setAvatar(value);
          const description = `**Avatar URL:** ${value}\n**Updated by:** ${message.author.tag}`;
          const embed = EmbedManager.success('✅ Bot Avatar Updated', description);
          await message.reply({ embeds: [embed] });
        } catch (error) {
          await ErrorHandler.generic(message, 'Failed to update avatar. Check the URL and try again.');
        }
        break;

      case 'name':
        if (!value) {
          await ErrorHandler.invalidArgument(message, 'name', 'New bot name');
          return;
        }

        if (value.length < 2 || value.length > 32) {
          await ErrorHandler.generic(message, 'Bot name must be between 2 and 32 characters.');
          return;
        }

        try {
          await message.client.user.setUsername(value);
          const description = `**New Name:** ${value}\n**Updated by:** ${message.author.tag}`;
          const embed = EmbedManager.success('✅ Bot Name Updated', description);
          await message.reply({ embeds: [embed] });
        } catch (error) {
          await ErrorHandler.generic(message, 'Failed to update name. It may be changing too frequently.');
        }
        break;

      case 'status':
        if (!value) {
          await ErrorHandler.invalidArgument(message, 'status', 'online, idle, dnd, or invisible');
          return;
        }

        if (!['online', 'idle', 'dnd', 'invisible'].includes(value)) {
          await ErrorHandler.invalidArgument(message, 'status', 'online, idle, dnd, or invisible');
          return;
        }

        try {
          await message.client.user.setStatus(value as PresenceStatusData);
          const description = `**Status:** ${value}\n**Updated by:** ${message.author.tag}`;
          const embed = EmbedManager.success('✅ Bot Status Updated', description);
          await message.reply({ embeds: [embed] });
        } catch (error) {
          await ErrorHandler.generic(message, 'Failed to update status.');
        }
        break;

      case 'presence':
        if (!value) {
          await ErrorHandler.invalidArgument(message, 'presence', 'Activity text');
          return;
        }

        if (value.length > 128) {
          await ErrorHandler.generic(message, 'Presence text cannot exceed 128 characters.');
          return;
        }

        try {
          await message.client.user.setActivity(value, { type: 0 });
          const description = `**Presence:** ${value}\n**Updated by:** ${message.author.tag}`;
          const embed = EmbedManager.success('✅ Bot Presence Updated', description);
          await message.reply({ embeds: [embed] });
        } catch (error) {
          await ErrorHandler.generic(message, 'Failed to update presence.');
        }
        break;

      default:
        await ErrorHandler.invalidArgument(message, 'action', 'avatar, name, status, or presence');
        break;
    }
  }

  private async handleServerPrefix(message: Message, action: string, value: string): Promise<void> {
    if (!message.guild) return;

    switch (action) {
      case 'leave':
        if (value !== 'confirm') {
          await ErrorHandler.generic(message, 'You must confirm with "confirm" to leave the server.');
          return;
        }

        try {
          await message.guild.leave();
        } catch (error) {
          await ErrorHandler.generic(message, 'Failed to leave server.');
        }
        break;

      case 'reset':
        if (value !== 'confirm') {
          await ErrorHandler.generic(message, 'You must confirm with "confirm" to reset server data.');
          return;
        }

        try {
          const prisma = getPrismaClient();
          await prisma.guild.delete({
            where: { guildId: message.guild.id },
          });

          const description = `**Server:** ${message.guild.name}\n**Reset by:** ${message.author.tag}\n\n⚠️ All server data has been deleted. Run setup to reconfigure the bot.`;
          const embed = EmbedManager.success('✅ Server Data Reset', description);
          await message.reply({ embeds: [embed] });
        } catch (error) {
          await ErrorHandler.generic(message, 'Failed to reset server data.');
        }
        break;

      default:
        await ErrorHandler.invalidArgument(message, 'action', 'leave or reset');
        break;
    }
  }
}

export default BotCommand;
