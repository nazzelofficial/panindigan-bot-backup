// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import {
  ChatInputCommandInteraction,
  Message,
  EmbedBuilder,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from 'discord.js';
import { PALETTE, KIT, errorEmbed } from '../../utils/EmbedSystem.js';
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
      examples: ['/ban @user Spamming', 'p!ban @user Spamming'],
    };
    super(options);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .setDMPermission(false)
      .addUserOption(o => o.setName('target').setDescription('User to ban').setRequired(true))
      .addStringOption(o => o.setName('reason').setDescription('Reason for the ban').setRequired(false))
      .addIntegerOption(o =>
        o.setName('days').setDescription('Days of messages to delete (0–7)').setMinValue(0).setMaxValue(7).setRequired(false),
      ) as SlashCommandBuilder;
  }

  private buildEmbed(target: any, mod: any, reason: string, days: number): EmbedBuilder {
    const now = Math.floor(Date.now() / 1000);
    return new EmbedBuilder()
      .setColor(PALETTE.error)
      .setAuthor({ name: `${KIT.mod} Ban — ${target.username}`, iconURL: target.displayAvatarURL({ size: 64 }) })
      .addFields(
        { name: '🔨 Banned User',  value: `<@${target.id}> \`${target.id}\``, inline: true  },
        { name: '👮 Moderator',    value: `<@${mod.id}>`,                      inline: true  },
        { name: '📋 Reason',       value: reason,                              inline: false },
        { name: '🗑️ Msgs Deleted', value: `${days} day${days !== 1 ? 's' : ''}`, inline: true  },
        { name: '📅 Timestamp',    value: `<t:${now}:F>`,                      inline: true  },
      )
      .setFooter({ text: 'Panindigan Moderation' })
      .setTimestamp();
  }

  private async saveCase(userId: string, guildId: string, modId: string, reason: string): Promise<void> {
    try {
      const prisma = getPrismaClient();
      await prisma.moderation.upsert({
        where: { userId_guildId: { userId, guildId } },
        update: { cases: { push: { action: 'ban', moderatorId: modId, reason, timestamp: new Date() } } },
        create: { userId, guildId, cases: [{ action: 'ban', moderatorId: modId, reason, timestamp: new Date() }] },
      });
    } catch {}
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const target = interaction.options.getUser('target', true);
    const reason = interaction.options.getString('reason') ?? 'No reason provided';
    const days   = interaction.options.getInteger('days') ?? 0;

    if (target.id === interaction.user.id)
      return void interaction.reply({ embeds: [errorEmbed('Cannot Ban', 'You cannot ban yourself.')], ephemeral: true });
    if (target.id === interaction.client.user!.id)
      return void interaction.reply({ embeds: [errorEmbed('Cannot Ban', 'I cannot ban myself.')], ephemeral: true });

    const member = await interaction.guild!.members.fetch(target.id).catch(() => null);
    if (member && !member.bannable)
      return void interaction.reply({ embeds: [errorEmbed('Insufficient Permissions', 'I cannot ban this user — their role is higher than mine.')], ephemeral: true });

    try {
      await interaction.guild!.bans.create(target.id, { reason, deleteMessageSeconds: days * 86400 });
      await this.saveCase(target.id, interaction.guild!.id, interaction.user.id, reason);
      await interaction.reply({ embeds: [this.buildEmbed(target, interaction.user, reason, days)] });
    } catch {
      await interaction.reply({ embeds: [errorEmbed('Ban Failed', 'Failed to ban the user. Check my permissions.')], ephemeral: true });
    }
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const target = message.mentions.users.first();
    const reason = args.slice(1).join(' ') || 'No reason provided';

    if (!target) return void message.reply({ embeds: [errorEmbed('No User', 'Please mention a user to ban.')] });
    if (target.id === message.author.id) return void message.reply({ embeds: [errorEmbed('Cannot Ban', 'You cannot ban yourself.')] });

    const member = await message.guild!.members.fetch(target.id).catch(() => null);
    if (member && !member.bannable)
      return void message.reply({ embeds: [errorEmbed('Insufficient Permissions', 'I cannot ban this user.')] });

    try {
      await message.guild!.bans.create(target.id, { reason });
      await this.saveCase(target.id, message.guild!.id, message.author.id, reason);
      await message.reply({ embeds: [this.buildEmbed(target, message.author, reason, 0)] });
    } catch {
      await message.reply({ embeds: [errorEmbed('Ban Failed', 'Failed to ban the user.')] });
    }
  }
}

export default BanCommand;
