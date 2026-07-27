// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';

export class BanCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'ban',
      description: 'Ban a user from the server',
      category: 'moderation',
      cooldown: 3,
      userPermissions: [PermissionFlagsBits.BanMembers],
      botPermissions: [PermissionFlagsBits.BanMembers],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['b'],
      examples: ['/ban @user', 'p!ban @user spamming'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const target = interaction.options.getUser('target');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const days = interaction.options.getInteger('days') || 0;

    if (!target) {
      await interaction.reply({ content: '❌ Please provide a user to ban.', ephemeral: true });
      return;
    }

    if (target.id === interaction.user.id) {
      await interaction.reply({ content: '❌ You cannot ban yourself.', ephemeral: true });
      return;
    }

    if (target.id === interaction.client.user.id) {
      await interaction.reply({ content: '❌ I cannot ban myself.', ephemeral: true });
      return;
    }

    if (!interaction.guild) return;

    const member = await interaction.guild.members.fetch(target.id).catch(() => null);
    if (member) {
      if (!member.bannable) {
        await interaction.reply({ content: '❌ I cannot ban this user due to role hierarchy.', ephemeral: true });
        return;
      }
    }

    try {
      await interaction.guild.bans.create(target.id, { reason, deleteMessageDays: days });

      const prisma = getPrismaClient();
      await prisma.moderation.upsert({
        where: { userId_guildId: { userId: target.id, guildId: interaction.guild.id } },
        update: {
          cases: {
            push: {
              action: 'ban',
              moderatorId: interaction.user.id,
              reason,
              timestamp: new Date(),
            },
          },
        },
        create: {
          userId: target.id,
          guildId: interaction.guild.id,
          cases: [{
            action: 'ban',
            moderatorId: interaction.user.id,
            reason,
            timestamp: new Date(),
          }],
        },
      });

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.moderation} User Banned`)
        .setColor(COLORS.error)
        .addFields([
          { name: 'User', value: `${target.tag} (${target.id})`, inline: true },
          { name: 'Moderator', value: interaction.user.tag, inline: true },
          { name: 'Reason', value: reason, inline: false },
          { name: 'Messages Deleted', value: `${days} days`, inline: true },
        ])
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ content: '❌ Failed to ban user.', ephemeral: true });
    }
  }

  public async executePrefix(message: Message, _args: string[]): Promise<void> {
    const target = message.mentions.users.first();
    const reason = _args.slice(1).join(' ') || 'No reason provided';

    if (!target) {
      await message.reply('❌ Please mention a user to ban.');
      return;
    }

    if (target.id === message.author.id) {
      await message.reply('❌ You cannot ban yourself.');
      return;
    }

    if (!message.guild) return;

    const member = await message.guild.members.fetch(target.id).catch(() => null);
    if (member && !member.bannable) {
      await message.reply('❌ I cannot ban this user due to role hierarchy.');
      return;
    }

    try {
      await message.guild.bans.create(target.id, { reason });

      const prisma = getPrismaClient();
      await prisma.moderation.upsert({
        where: { userId_guildId: { userId: target.id, guildId: message.guild.id } },
        update: {
          cases: {
            push: {
              action: 'ban',
              moderatorId: message.author.id,
              reason,
              timestamp: new Date(),
            },
          },
        },
        create: {
          userId: target.id,
          guildId: message.guild.id,
          cases: [{
            action: 'ban',
            moderatorId: message.author.id,
            reason,
            timestamp: new Date(),
          }],
        },
      });

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.moderation} User Banned`)
        .setColor(COLORS.error)
        .addFields([
          { name: 'User', value: `${target.tag} (${target.id})`, inline: true },
          { name: 'Moderator', value: message.author.tag, inline: true },
          { name: 'Reason', value: reason, inline: false },
        ])
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      await message.reply('❌ Failed to ban user.');
    }
  }
}

export default BanCommand;
