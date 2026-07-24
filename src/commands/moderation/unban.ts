import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';
import { getPrismaClient } from '../../database/postgresql/client';

export class UnbanCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'unban',
      description: 'Unban a user from the server',
      category: 'moderation',
      cooldown: 3,
      userPermissions: [PermissionFlagsBits.BanMembers],
      botPermissions: [PermissionFlagsBits.BanMembers],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['pardon'],
      examples: ['/unban @user', 'p!unban @user'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const target = interaction.options.getUser('target');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    if (!target) {
      await interaction.reply({ content: '❌ Please provide a user to unban.', ephemeral: true });
      return;
    }

    if (!interaction.guild) return;

    try {
      const ban = await interaction.guild.bans.fetch(target.id).catch(() => null);
      if (!ban) {
        await interaction.reply({ content: '❌ This user is not banned.', ephemeral: true });
        return;
      }

      await interaction.guild.bans.remove(target.id, reason);

      const prisma = getPrismaClient();
      await prisma.moderation.upsert({
        where: { userId_guildId: { userId: target.id, guildId: interaction.guild.id } },
        update: {
          cases: {
            push: {
              action: 'unban',
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
            action: 'unban',
            moderatorId: interaction.user.id,
            reason,
            timestamp: new Date(),
          }],
        },
      });

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.success} User Unbanned`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'User', value: `${target.tag} (${target.id})`, inline: true },
          { name: 'Moderator', value: interaction.user.tag, inline: true },
          { name: 'Reason', value: reason, inline: false },
        ])
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ content: '❌ Failed to unban user.', ephemeral: true });
    }
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const target = message.mentions.users.first();
    const reason = args.slice(1).join(' ') || 'No reason provided';

    if (!target) {
      await message.reply('❌ Please mention a user to unban.');
      return;
    }

    if (!message.guild) return;

    try {
      const ban = await message.guild.bans.fetch(target.id).catch(() => null);
      if (!ban) {
        await message.reply('❌ This user is not banned.');
        return;
      }

      await message.guild.bans.remove(target.id, reason);

      const prisma = getPrismaClient();
      await prisma.moderation.upsert({
        where: { userId_guildId: { userId: target.id, guildId: message.guild.id } },
        update: {
          cases: {
            push: {
              action: 'unban',
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
            action: 'unban',
            moderatorId: message.author.id,
            reason,
            timestamp: new Date(),
          }],
        },
      });

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.success} User Unbanned`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'User', value: `${target.tag} (${target.id})`, inline: true },
          { name: 'Moderator', value: message.author.tag, inline: true },
          { name: 'Reason', value: reason, inline: false },
        ])
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      await message.reply('❌ Failed to unban user.');
    }
  }
}

export default UnbanCommand;
