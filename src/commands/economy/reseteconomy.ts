// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';

export class ResetEconomyCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'reseteconomy',
      description: 'Reset the economy for a user or the entire server (Admin only)',
      category: 'economy',
      cooldown: 5,
      userPermissions: [PermissionFlagsBits.Administrator],
      botPermissions: [],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['resetecon', 'wipeeconomy'],
      examples: ['/reseteconomy @user', '/reseteconomy all', 'p!reseteconomy @user'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const target = interaction.options.getString('target');

    if (!target) {
      await interaction.reply({ content: '❌ Please provide a target (@user or all).', ephemeral: true });
      return;
    }

    if (!interaction.guildId) return;

    try {
      const prisma = getPrismaClient();

      if (target.toLowerCase() === 'all') {
        await prisma.economy.deleteMany({
          where: { guildId: interaction.guildId },
        });

        const embed = new EmbedBuilder()
          .setTitle(`${EMOJIS.economy} Economy Reset`)
          .setColor(COLORS.success)
          .setDescription('All economy data for this server has been reset.')
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });
      } else {
        const targetUser = interaction.options.getUser('user');
        if (!targetUser) {
          await interaction.reply({ content: '❌ Please provide a user.', ephemeral: true });
          return;
        }

        await prisma.economy.deleteMany({
          where: { userId: targetUser.id, guildId: interaction.guildId },
        });

        const embed = new EmbedBuilder()
          .setTitle(`${EMOJIS.economy} Economy Reset`)
          .setColor(COLORS.success)
          .addFields([
            { name: 'User', value: targetUser.tag, inline: true },
          ])
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });
      }
    } catch (error) {
      await interaction.reply({ content: '❌ Failed to reset economy.', ephemeral: true });
    }
  }

  public async executePrefix(message: Message, _args: string[]): Promise<void> {
    const target = args[0]?.toLowerCase();

    if (!target) {
      await message.reply('❌ Please provide a target (@user or all).');
      return;
    }

    if (!message.guildId) return;

    try {
      const prisma = getPrismaClient();

      if (target === 'all') {
        await prisma.economy.deleteMany({
          where: { guildId: message.guildId },
        });

        const embed = new EmbedBuilder()
          .setTitle(`${EMOJIS.economy} Economy Reset`)
          .setColor(COLORS.success)
          .setDescription('All economy data for this server has been reset.')
          .setTimestamp();

        await message.reply({ embeds: [embed] });
      } else {
        const targetUser = message.mentions.users.first();
        if (!targetUser) {
          await message.reply('❌ Please provide a user.');
          return;
        }

        await prisma.economy.deleteMany({
          where: { userId: targetUser.id, guildId: message.guildId },
        });

        const embed = new EmbedBuilder()
          .setTitle(`${EMOJIS.economy} Economy Reset`)
          .setColor(COLORS.success)
          .addFields([
            { name: 'User', value: targetUser.tag, inline: true },
          ])
          .setTimestamp();

        await message.reply({ embeds: [embed] });
      }
    } catch (error) {
      await message.reply('❌ Failed to reset economy.');
    }
  }
}

export default ResetEconomyCommand;
