// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';

export class WithdrawCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'withdraw',
      description: 'Withdraw money from bank to wallet',
      category: 'economy',
      cooldown: 3,
      userPermissions: [],
      botPermissions: [],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['with', 'wd'],
      examples: ['/withdraw 100', '/withdraw all', 'p!withdraw 100', 'p!withdraw all'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const amountInput = interaction.options.getString('amount');

    if (!amountInput) {
      await interaction.reply({ content: '❌ Please provide an amount or "all".', ephemeral: true });
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
        where: { userId_guildId: { userId: interaction.user.id, guildId: interaction.guildId } },
      });

      const bank = economy?.bank || 0;

      if (bank <= 0) {
        await interaction.reply({ content: '❌ You don\'t have any money in your bank.', ephemeral: true });
        return;
      }

      let amount: number;
      if (amountInput.toLowerCase() === 'all') {
        amount = bank;
      } else {
        amount = parseInt(amountInput);
        if (isNaN(amount) || amount <= 0) {
          await interaction.reply({ content: '❌ Please provide a valid amount.', ephemeral: true });
          return;
        }
      }

      if (amount > bank) {
        await interaction.reply({ content: '❌ You don\'t have enough money in your bank.', ephemeral: true });
        return;
      }

      await prisma.economy.upsert({
        where: { userId_guildId: { userId: interaction.user.id, guildId: interaction.guildId } },
        update: {
          bank: { decrement: amount },
          wallet: { increment: amount },
        },
        create: {
          userId: interaction.user.id,
          guildId: interaction.guildId,
          wallet: amount,
          bank: 0,
        },
      });

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.economy} Money Withdrawn`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Withdrawn', value: `${amount.toLocaleString()} ${guild.currencySymbol || '💰'}`, inline: true },
          { name: 'New Wallet Balance', value: `${((economy?.wallet || 0) + amount).toLocaleString()} ${guild.currencySymbol || '💰'}`, inline: true },
        ])
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ content: '❌ Failed to withdraw money.', ephemeral: true });
    }
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const amountInput = args[0];

    if (!amountInput) {
      await message.reply('❌ Please provide an amount or "all".');
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
        where: { userId_guildId: { userId: message.author.id, guildId: message.guildId } },
      });

      const bank = economy?.bank || 0;

      if (bank <= 0) {
        await message.reply('❌ You don\'t have any money in your bank.');
        return;
      }

      let amount: number;
      if (amountInput.toLowerCase() === 'all') {
        amount = bank;
      } else {
        amount = parseInt(amountInput);
        if (isNaN(amount) || amount <= 0) {
          await message.reply('❌ Please provide a valid amount.');
          return;
        }
      }

      if (amount > bank) {
        await message.reply('❌ You don\'t have enough money in your bank.');
        return;
      }

      await prisma.economy.upsert({
        where: { userId_guildId: { userId: message.author.id, guildId: message.guildId } },
        update: {
          bank: { decrement: amount },
          wallet: { increment: amount },
        },
        create: {
          userId: message.author.id,
          guildId: message.guildId,
          wallet: amount,
          bank: 0,
        },
      });

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.economy} Money Withdrawn`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Withdrawn', value: `${amount.toLocaleString()} ${guild.currencySymbol || '💰'}`, inline: true },
          { name: 'New Wallet Balance', value: `${((economy?.wallet || 0) + amount).toLocaleString()} ${guild.currencySymbol || '💰'}`, inline: true },
        ])
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      await message.reply('❌ Failed to withdraw money.');
    }
  }
}

export default WithdrawCommand;
