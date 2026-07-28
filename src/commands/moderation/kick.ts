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

export class KickCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'kick',
      description: 'Kick a user from the server',
      category: 'moderation',
      cooldown: 3,
      userPermissions: [PermissionFlagsBits.KickMembers],
      botPermissions: [PermissionFlagsBits.KickMembers],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['k'],
      examples: ['/kick @user Spamming', 'p!kick @user'],
    };
    super(options);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .setDMPermission(false)
      .addUserOption(o => o.setName('target').setDescription('User to kick').setRequired(true))
      .addStringOption(o => o.setName('reason').setDescription('Reason for the kick').setRequired(false)) as SlashCommandBuilder;
  }

  private buildEmbed(target: any, mod: any, reason: string): EmbedBuilder {
    const now = Math.floor(Date.now() / 1000);
    return new EmbedBuilder()
      .setColor(PALETTE.warning)
      .setAuthor({ name: `${KIT.mod} Kick — ${target.username}`, iconURL: target.displayAvatarURL({ size: 64 }) })
      .addFields(
        { name: '👟 Kicked User',  value: `<@${target.id}> \`${target.id}\``, inline: true  },
        { name: '👮 Moderator',    value: `<@${mod.id}>`,                      inline: true  },
        { name: '📋 Reason',       value: reason,                              inline: false },
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
        update: { cases: { push: { action: 'kick', moderatorId: modId, reason, timestamp: new Date() } } },
        create: { userId, guildId, cases: [{ action: 'kick', moderatorId: modId, reason, timestamp: new Date() }] },
      });
    } catch {}
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const target = interaction.options.getUser('target', true);
    const reason = interaction.options.getString('reason') ?? 'No reason provided';

    if (target.id === interaction.user.id)
      return void interaction.reply({ embeds: [errorEmbed('Cannot Kick', 'You cannot kick yourself.')], ephemeral: true });
    if (target.id === interaction.client.user!.id)
      return void interaction.reply({ embeds: [errorEmbed('Cannot Kick', 'I cannot kick myself.')], ephemeral: true });

    const member = await interaction.guild!.members.fetch(target.id).catch(() => null);
    if (!member) return void interaction.reply({ embeds: [errorEmbed('Not Found', 'That user is not in this server.')], ephemeral: true });
    if (!member.kickable) return void interaction.reply({ embeds: [errorEmbed('Insufficient Permissions', 'I cannot kick this user — their role is higher than mine.')], ephemeral: true });

    try {
      await member.kick(reason);
      await this.saveCase(target.id, interaction.guild!.id, interaction.user.id, reason);
      await interaction.reply({ embeds: [this.buildEmbed(target, interaction.user, reason)] });
    } catch {
      await interaction.reply({ embeds: [errorEmbed('Kick Failed', 'Failed to kick the user.')], ephemeral: true });
    }
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const target = message.mentions.users.first();
    const reason = args.slice(1).join(' ') || 'No reason provided';

    if (!target) return void message.reply({ embeds: [errorEmbed('No User', 'Please mention a user to kick.')] });
    if (target.id === message.author.id) return void message.reply({ embeds: [errorEmbed('Cannot Kick', 'You cannot kick yourself.')] });

    const member = await message.guild!.members.fetch(target.id).catch(() => null);
    if (!member) return void message.reply({ embeds: [errorEmbed('Not Found', 'That user is not in this server.')] });
    if (!member.kickable) return void message.reply({ embeds: [errorEmbed('Insufficient Permissions', 'I cannot kick this user.')] });

    try {
      await member.kick(reason);
      await this.saveCase(target.id, message.guild!.id, message.author.id, reason);
      await message.reply({ embeds: [this.buildEmbed(target, message.author, reason)] });
    } catch {
      await message.reply({ embeds: [errorEmbed('Kick Failed', 'Failed to kick the user.')] });
    }
  }
}

export default KickCommand;
