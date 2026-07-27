// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';

export class DepositCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'deposit',
      description: 'Deposit money from wallet to bank',
      category: 'economy',
      cooldown: 3,
      userPermissions: [],
      botPermissions: [],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['dep', 'bank'],
      examples: ['/deposit 100', '/deposit all', 'p!deposit 100', 'p!deposit all'],
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

      const wallet = economy?.wallet || 0;
      const bank = economy?.bank || 0;
      const maxBank = 1000000;

      if (bank >= maxBank) {
        await interaction.reply({ content: '❌ Your bank is full.', ephemeral: true });
        return;
      }

      let amount: number;
      if (amountInput.toLowerCase() === 'all') {
        amount = wallet;
      } else {
        amount = parseInt(amountInput);
        if (isNaN(amount) || amount <= 0) {
          await interaction.reply({ content: '❌ Please provide a valid amount.', ephemeral: true });
          return;
        }
      }

      if (amount > wallet) {
        await interaction.reply({ content: '❌ You don\'t have enough money in your wallet.', ephemeral: true });
        return;
      }

      const depositAmount = Math.min(amount, maxBank - bank);

      await prisma.economy.upsert({
        where: { userId_guildId: { userId: interaction.user.id, guildId: interaction.guildId } },
        update: {
          wallet: { decrement: depositAmount },
          bank: { increment: depositAmount },
        },
        create: {
          userId: interaction.user.id,
          guildId: interaction.guildId,
          wallet: 0,
          bank: depositAmount,
        },
      });

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.economy} Money Deposited`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Deposited', value: `${depositAmount.toLocaleString()} ${guild.currencySymbol || '💰'}`, inline: true },
          { name: 'New Bank Balance', value: `${(bank + depositAmount).toLocaleString()} ${guild.currencySymbol || '💰'}`, inline: true },
        ])
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ content: '❌ Failed to deposit money.', ephemeral: true });
    }
  }

  public async executePrefix(message: Message, _args: string[]): Promise<void> {
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

      const wallet = economy?.wallet || 0;
      const bank = economy?.bank || 0;
      const maxBank = 1000000;

      if (bank >= maxBank) {
        await message.reply('❌ Your bank is full.');
        return;
      }

      let amount: number;
      if (amountInput.toLowerCase() === 'all') {
        amount = wallet;
      } else {
        amount = parseInt(amountInput);
        if (isNaN(amount) || amount <= 0) {
          await message.reply('❌ Please provide a valid amount.');
          return;
        }
      }

      if (amount > wallet) {
        await message.reply('❌ You don\'t have enough money in your wallet.');
        return;
      }

      const depositAmount = Math.min(amount, maxBank - bank);

      await prisma.economy.upsert({
        where: { userId_guildId: { userId: message.author.id, guildId: message.guildId } },
        update: {
          wallet: { decrement: depositAmount },
          bank: { increment: depositAmount },
        },
        create: {
          userId: message.author.id,
          guildId: message.guildId,
          wallet: 0,
          bank: depositAmount,
        },
      });

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.economy} Money Deposited`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Deposited', value: `${depositAmount.toLocaleString()} ${guild.currencySymbol || '💰'}`, inline: true },
          { name: 'New Bank Balance', value: `${(bank + depositAmount).toLocaleString()} ${guild.currencySymbol || '💰'}`, inline: true },
        ])
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      await message.reply('❌ Failed to deposit money.');
    }
  }
}

export default DepositCommand;
