import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';
import { getPrismaClient } from '../../database/postgresql/client';
import { Formatter } from '../../utils/Formatter';

export class TempBanCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'tempban',
      description: 'Temporarily ban a user from the server',
      category: 'moderation',
      cooldown: 3,
      userPermissions: [PermissionFlagsBits.BanMembers],
      botPermissions: [PermissionFlagsBits.BanMembers],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['tb'],
      examples: ['/tempban @user 1d spamming', 'p!tempban @user 7d'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const target = interaction.options.getUser('target');
    const duration = interaction.options.getString('duration') || '1d';
    const reason = interaction.options.getString('reason') || 'No reason provided';

    if (!target) {
      await interaction.reply({ content: '❌ Please provide a user to tempban.', ephemeral: true });
      return;
    }

    if (target.id === interaction.user.id) {
      await interaction.reply({ content: '❌ You cannot tempban yourself.', ephemeral: true });
      return;
    }

    if (target.id === interaction.client.user.id) {
      await interaction.reply({ content: '❌ I cannot tempban myself.', ephemeral: true });
      return;
    }

    if (!interaction.guild) return;

    const member = await interaction.guild.members.fetch(target.id).catch(() => null);
    if (member && !member.bannable) {
      await interaction.reply({ content: '❌ I cannot tempban this user due to role hierarchy.', ephemeral: true });
      return;
    }

    const durationMs = Formatter.parseTime(duration);
    if (durationMs <= 0) {
      await interaction.reply({ content: '❌ Invalid duration format. Use format like 1d, 1w, 1m.', ephemeral: true });
      return;
    }

    if (durationMs > 365 * 24 * 60 * 60 * 1000) {
      await interaction.reply({ content: '❌ Duration cannot exceed 1 year.', ephemeral: true });
      return;
    }

    try {
      await interaction.guild.bans.create(target.id, { reason });

      const prisma = getPrismaClient();
      await prisma.moderation.upsert({
        where: { userId_guildId: { userId: target.id, guildId: interaction.guild.id } },
        update: {
          isBlacklisted: true,
          blacklistReason: reason,
          cases: {
            push: {
              action: 'tempban',
              moderatorId: interaction.user.id,
              reason: `${reason} (Duration: ${Formatter.formatDuration(Math.floor(durationMs / 1000))})`,
              timestamp: new Date(),
            },
          },
        },
        create: {
          userId: target.id,
          guildId: interaction.guild.id,
          isBlacklisted: true,
          blacklistReason: reason,
          cases: [{
            action: 'tempban',
            moderatorId: interaction.user.id,
            reason: `${reason} (Duration: ${Formatter.formatDuration(Math.floor(durationMs / 1000))})`,
            timestamp: new Date(),
          }],
        },
      });

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.moderation} User Temporarily Banned`)
        .setColor(COLORS.error)
        .addFields([
          { name: 'User', value: `${target.tag} (${target.id})`, inline: true },
          { name: 'Moderator', value: interaction.user.tag, inline: true },
          { name: 'Duration', value: Formatter.formatDuration(Math.floor(durationMs / 1000)), inline: true },
          { name: 'Reason', value: reason, inline: false },
        ])
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });

      setTimeout(async () => {
        try {
          await interaction.guild.bans.remove(target.id);
          await prisma.moderation.update({
            where: { userId_guildId: { userId: target.id, guildId: interaction.guild.id } },
            data: { isBlacklisted: false, blacklistReason: null },
          });
        } catch (error) {
          console.error(`Failed to unban ${target.id} after tempban:`, error);
        }
      }, durationMs);
    } catch (error) {
      await interaction.reply({ content: '❌ Failed to tempban user.', ephemeral: true });
    }
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const target = message.mentions.users.first();
    const duration = args[1] || '1d';
    const reason = args.slice(2).join(' ') || 'No reason provided';

    if (!target) {
      await message.reply('❌ Please mention a user to tempban.');
      return;
    }

    if (target.id === message.author.id) {
      await message.reply('❌ You cannot tempban yourself.');
      return;
    }

    if (!message.guild) return;

    const member = await message.guild.members.fetch(target.id).catch(() => null);
    if (member && !member.bannable) {
      await message.reply('❌ I cannot tempban this user due to role hierarchy.');
      return;
    }

    const durationMs = Formatter.parseTime(duration);
    if (durationMs <= 0) {
      await message.reply('❌ Invalid duration format. Use format like 1d, 1w, 1m.');
      return;
    }

    if (durationMs > 365 * 24 * 60 * 60 * 1000) {
      await message.reply('❌ Duration cannot exceed 1 year.');
      return;
    }

    try {
      await message.guild.bans.create(target.id, { reason });

      const prisma = getPrismaClient();
      await prisma.moderation.upsert({
        where: { userId_guildId: { userId: target.id, guildId: message.guild.id } },
        update: {
          isBlacklisted: true,
          blacklistReason: reason,
          cases: {
            push: {
              action: 'tempban',
              moderatorId: message.author.id,
              reason: `${reason} (Duration: ${Formatter.formatDuration(Math.floor(durationMs / 1000))})`,
              timestamp: new Date(),
            },
          },
        },
        create: {
          userId: target.id,
          guildId: message.guild.id,
          isBlacklisted: true,
          blacklistReason: reason,
          cases: [{
            action: 'tempban',
            moderatorId: message.author.id,
            reason: `${reason} (Duration: ${Formatter.formatDuration(Math.floor(durationMs / 1000))})`,
            timestamp: new Date(),
          }],
        },
      });

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.moderation} User Temporarily Banned`)
        .setColor(COLORS.error)
        .addFields([
          { name: 'User', value: `${target.tag} (${target.id})`, inline: true },
          { name: 'Moderator', value: message.author.tag, inline: true },
          { name: 'Duration', value: Formatter.formatDuration(Math.floor(durationMs / 1000)), inline: true },
          { name: 'Reason', value: reason, inline: false },
        ])
        .setTimestamp();

      await message.reply({ embeds: [embed] });

      setTimeout(async () => {
        try {
          await message.guild.bans.remove(target.id);
          await prisma.moderation.update({
            where: { userId_guildId: { userId: target.id, guildId: message.guild.id } },
            data: { isBlacklisted: false, blacklistReason: null },
          });
        } catch (error) {
          console.error(`Failed to unban ${target.id} after tempban:`, error);
        }
      }, durationMs);
    } catch (error) {
      await message.reply('❌ Failed to tempban user.');
    }
  }
}

export default TempBanCommand;
