import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';
import { getPrismaClient } from '../../database/postgresql/client';

export class RemoveBalanceCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'removebalance',
      description: 'Remove money from a user\'s balance (Admin only)',
      category: 'economy',
      cooldown: 5,
      userPermissions: [PermissionFlagsBits.ManageGuild],
      botPermissions: [],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['removebal', 'removemoney'],
      examples: ['/removebalance @user 100', 'p!removebalance @user 100'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const targetUser = interaction.options.getUser('user');
    const amount = interaction.options.getInteger('amount');

    if (!targetUser) {
      await interaction.reply({ content: '❌ Please provide a user.', ephemeral: true });
      return;
    }

    if (amount === null || amount <= 0) {
      await interaction.reply({ content: '❌ Please provide a valid amount.', ephemeral: true });
      return;
    }

    if (!interaction.guildId) return;

    try {
      const prisma = getPrismaClient();
      const guild = await prisma.guild.upsert({
        where: { guildId: interaction.guildId },
        update: {},
        create: { guildId: interaction.guildId },
      });

      const economy = await prisma.economy.findUnique({
        where: { userId_guildId: { userId: targetUser.id, guildId: interaction.guildId } },
      });

      const currentBalance = economy?.wallet || 0;

      if (currentBalance < amount) {
        await interaction.reply({ content: '❌ User doesn\'t have enough money to remove.', ephemeral: true });
        return;
      }

      await prisma.economy.update({
        where: { userId_guildId: { userId: targetUser.id, guildId: interaction.guildId } },
        update: { wallet: { decrement: amount } },
      });

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.economy} Balance Removed`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'User', value: targetUser.tag, inline: true },
          { name: 'Removed', value: `${amount} ${guild.currencySymbol || '💰'}`, inline: true },
        ])
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ content: '❌ Failed to remove balance.', ephemeral: true });
    }
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const targetUser = message.mentions.users.first();
    const amount = parseInt(args[1]);

    if (!targetUser) {
      await message.reply('❌ Please provide a user.');
      return;
    }

    if (isNaN(amount) || amount <= 0) {
      await message.reply('❌ Please provide a valid amount.');
      return;
    }

    if (!message.guildId) return;

    try {
      const prisma = getPrismaClient();
      const guild = await prisma.guild.upsert({
        where: { guildId: message.guildId },
        update: {},
        create: { guildId: message.guildId },
      });

      const economy = await prisma.economy.findUnique({
        where: { userId_guildId: { userId: targetUser.id, guildId: message.guildId } },
      });

      const currentBalance = economy?.wallet || 0;

      if (currentBalance < amount) {
        await message.reply('❌ User doesn\'t have enough money to remove.');
        return;
      }

      await prisma.economy.update({
        where: { userId_guildId: { userId: targetUser.id, guildId: message.guildId } },
        update: { wallet: { decrement: amount } },
      });

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.economy} Balance Removed`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'User', value: targetUser.tag, inline: true },
          { name: 'Removed', value: `${amount} ${guild.currencySymbol || '💰'}`, inline: true },
        ])
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      await message.reply('❌ Failed to remove balance.');
    }
  }
}

export default RemoveBalanceCommand;
