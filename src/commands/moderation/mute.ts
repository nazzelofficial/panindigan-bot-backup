// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';
import { Formatter } from '../../utils/Formatter.js';

export class MuteCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'mute',
      description: 'Mute a user in the server',
      category: 'moderation',
      cooldown: 3,
      userPermissions: [PermissionFlagsBits.ModerateMembers],
      botPermissions: [PermissionFlagsBits.ModerateMembers],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['silence', 'timeout'],
      examples: ['/mute @user 10m spamming', 'p!mute @user 1h'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const target = interaction.options.getUser('target');
    const duration = interaction.options.getString('duration') || '10m';
    const reason = interaction.options.getString('reason') || 'No reason provided';

    if (!target) {
      await interaction.reply({ content: '❌ Please provide a user to mute.', ephemeral: true });
      return;
    }

    if (target.id === interaction.user.id) {
      await interaction.reply({ content: '❌ You cannot mute yourself.', ephemeral: true });
      return;
    }

    if (target.id === interaction.client.user.id) {
      await interaction.reply({ content: '❌ I cannot mute myself.', ephemeral: true });
      return;
    }

    if (!interaction.guild) return;

    const member = await interaction.guild.members.fetch(target.id).catch(() => null);
    if (!member) {
      await interaction.reply({ content: '❌ User not found in server.', ephemeral: true });
      return;
    }

    if (!member.moderatable) {
      await interaction.reply({ content: '❌ I cannot mute this user due to role hierarchy.', ephemeral: true });
      return;
    }

    const durationMs = Formatter.parseTime(duration);
    if (durationMs <= 0) {
      await interaction.reply({ content: '❌ Invalid duration format. Use format like 10m, 1h, 1d.', ephemeral: true });
      return;
    }

    if (durationMs > 28 * 24 * 60 * 60 * 1000) {
      await interaction.reply({ content: '❌ Duration cannot exceed 28 days.', ephemeral: true });
      return;
    }

    try {
      await member.timeout(durationMs, reason);

      const prisma = getPrismaClient();
      await prisma.moderation.upsert({
        where: { userId_guildId: { userId: target.id, guildId: interaction.guild.id } },
        update: {
          isMuted: true,
          muteExpiresAt: new Date(Date.now() + durationMs),
          cases: {
            push: {
              action: 'mute',
              moderatorId: interaction.user.id,
              reason,
              timestamp: new Date(),
            },
          },
        },
        create: {
          userId: target.id,
          guildId: interaction.guild.id,
          isMuted: true,
          muteExpiresAt: new Date(Date.now() + durationMs),
          cases: [{
            action: 'mute',
            moderatorId: interaction.user.id,
            reason,
            timestamp: new Date(),
          }],
        },
      });

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.moderation} User Muted`)
        .setColor(COLORS.warning)
        .addFields([
          { name: 'User', value: `${target.tag} (${target.id})`, inline: true },
          { name: 'Moderator', value: interaction.user.tag, inline: true },
          { name: 'Duration', value: Formatter.formatDuration(Math.floor(durationMs / 1000)), inline: true },
          { name: 'Reason', value: reason, inline: false },
        ])
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ content: '❌ Failed to mute user.', ephemeral: true });
    }
  }

  public async executePrefix(message: Message, _args: string[]): Promise<void> {
    const target = message.mentions.users.first();
    const duration = args[1] || '10m';
    const reason = _args.slice(2).join(' ') || 'No reason provided';

    if (!target) {
      await message.reply('❌ Please mention a user to mute.');
      return;
    }

    if (target.id === message.author.id) {
      await message.reply('❌ You cannot mute yourself.');
      return;
    }

    if (!message.guild) return;

    const member = await message.guild.members.fetch(target.id).catch(() => null);
    if (!member) {
      await message.reply('❌ User not found in server.');
      return;
    }

    if (!member.moderatable) {
      await message.reply('❌ I cannot mute this user due to role hierarchy.');
      return;
    }

    const durationMs = Formatter.parseTime(duration);
    if (durationMs <= 0) {
      await message.reply('❌ Invalid duration format. Use format like 10m, 1h, 1d.');
      return;
    }

    if (durationMs > 28 * 24 * 60 * 60 * 1000) {
      await message.reply('❌ Duration cannot exceed 28 days.');
      return;
    }

    try {
      await member.timeout(durationMs, reason);

      const prisma = getPrismaClient();
      await prisma.moderation.upsert({
        where: { userId_guildId: { userId: target.id, guildId: message.guild.id } },
        update: {
          isMuted: true,
          muteExpiresAt: new Date(Date.now() + durationMs),
          cases: {
            push: {
              action: 'mute',
              moderatorId: message.author.id,
              reason,
              timestamp: new Date(),
            },
          },
        },
        create: {
          userId: target.id,
          guildId: message.guild.id,
          isMuted: true,
          muteExpiresAt: new Date(Date.now() + durationMs),
          cases: [{
            action: 'mute',
            moderatorId: message.author.id,
            reason,
            timestamp: new Date(),
          }],
        },
      });

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.moderation} User Muted`)
        .setColor(COLORS.warning)
        .addFields([
          { name: 'User', value: `${target.tag} (${target.id})`, inline: true },
          { name: 'Moderator', value: message.author.tag, inline: true },
          { name: 'Duration', value: Formatter.formatDuration(Math.floor(durationMs / 1000)), inline: true },
          { name: 'Reason', value: reason, inline: false },
        ])
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      await message.reply('❌ Failed to mute user.');
    }
  }
}

export default MuteCommand;
