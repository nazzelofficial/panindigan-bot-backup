// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';

export class WarnCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'warn',
      description: 'Warn a user for rule violations',
      category: 'moderation',
      cooldown: 3,
      userPermissions: [PermissionFlagsBits.ModerateMembers],
      botPermissions: [PermissionFlagsBits.ModerateMembers],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['w'],
      examples: ['/warn @user spamming', 'p!warn @user breaking rules'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const target = interaction.options.getUser('target');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    if (!target) {
      await interaction.reply({ content: '❌ Please provide a user to warn.', ephemeral: true });
      return;
    }

    if (target.id === interaction.user.id) {
      await interaction.reply({ content: '❌ You cannot warn yourself.', ephemeral: true });
      return;
    }

    if (target.bot) {
      await interaction.reply({ content: '❌ You cannot warn bots.', ephemeral: true });
      return;
    }

    if (!interaction.guild) return;

    try {
      const prisma = getPrismaClient();
      const user = await prisma.user.findUnique({
        where: { userId_guildId: { userId: target.id, guildId: interaction.guild.id } },
        include: { moderation: true },
      });

      const currentWarnings = user?.moderation?.warnings || 0;
      const newWarnings = currentWarnings + 1;

      await prisma.moderation.upsert({
        where: { userId_guildId: { userId: target.id, guildId: interaction.guild.id } },
        update: {
          warnings: newWarnings,
          cases: {
            push: {
              action: 'warn',
              moderatorId: interaction.user.id,
              reason,
              timestamp: new Date(),
            },
          },
        },
        create: {
          userId: target.id,
          guildId: interaction.guild.id,
          warnings: 1,
          cases: [{
            action: 'warn',
            moderatorId: interaction.user.id,
            reason,
            timestamp: new Date(),
          }],
        },
      });

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.moderation} User Warned`)
        .setColor(COLORS.warning)
        .addFields([
          { name: 'User', value: `${target.tag} (${target.id})`, inline: true },
          { name: 'Moderator', value: interaction.user.tag, inline: true },
          { name: 'Reason', value: reason, inline: false },
          { name: 'Total Warnings', value: `${newWarnings}/10`, inline: true },
        ])
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });

      if (newWarnings >= 10) {
        await interaction.followUp({ content: `⚠️ User has reached 10 warnings. Consider taking further action.` });
      }
    } catch (error) {
      await interaction.reply({ content: '❌ Failed to warn user.', ephemeral: true });
    }
  }

  public async executePrefix(message: Message, _args: string[]): Promise<void> {
    const target = message.mentions.users.first();
    const reason = _args.slice(1).join(' ') || 'No reason provided';

    if (!target) {
      await message.reply('❌ Please mention a user to warn.');
      return;
    }

    if (target.id === message.author.id) {
      await message.reply('❌ You cannot warn yourself.');
      return;
    }

    if (target.bot) {
      await message.reply('❌ You cannot warn bots.');
      return;
    }

    if (!message.guild) return;

    try {
      const prisma = getPrismaClient();
      const user = await prisma.user.findUnique({
        where: { userId_guildId: { userId: target.id, guildId: message.guild.id } },
        include: { moderation: true },
      });

      const currentWarnings = user?.moderation?.warnings || 0;
      const newWarnings = currentWarnings + 1;

      await prisma.moderation.upsert({
        where: { userId_guildId: { userId: target.id, guildId: message.guild.id } },
        update: {
          warnings: newWarnings,
          cases: {
            push: {
              action: 'warn',
              moderatorId: message.author.id,
              reason,
              timestamp: new Date(),
            },
          },
        },
        create: {
          userId: target.id,
          guildId: message.guild.id,
          warnings: 1,
          cases: [{
            action: 'warn',
            moderatorId: message.author.id,
            reason,
            timestamp: new Date(),
          }],
        },
      });

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.moderation} User Warned`)
        .setColor(COLORS.warning)
        .addFields([
          { name: 'User', value: `${target.tag} (${target.id})`, inline: true },
          { name: 'Moderator', value: message.author.tag, inline: true },
          { name: 'Reason', value: reason, inline: false },
          { name: 'Total Warnings', value: `${newWarnings}/10`, inline: true },
        ])
        .setTimestamp();

      await message.reply({ embeds: [embed] });

      if (newWarnings >= 10) {
        await message.followUp('⚠️ User has reached 10 warnings. Consider taking further action.');
      }
    } catch (error) {
      await message.reply('❌ Failed to warn user.');
    }
  }
}

export default WarnCommand;
