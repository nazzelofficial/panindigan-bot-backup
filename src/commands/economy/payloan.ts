import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';
import { getPrismaClient } from '../../database/postgresql/client';

export class PayLoanCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'payloan',
      description: 'Pay off your loan',
      category: 'economy',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['repay', 'repayloan'],
      examples: ['/payloan 1000', 'p!payloan 1000'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const amount = interaction.options.getInteger('amount');

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

      const loan = await prisma.loan.findUnique({
        where: { userId_guildId: { userId: interaction.user.id, guildId: interaction.guildId } },
      });

      if (!loan || loan.paid >= loan.amount) {
        await interaction.reply({ content: '❌ You don\'t have an active loan.', ephemeral: true });
        return;
      }

      const remaining = loan.amount - loan.paid;

      if (amount > remaining) {
        await interaction.reply({ content: `❌ You only owe ${remaining} ${guild.currencySymbol || '💰'}.`, ephemeral: true });
        return;
      }

      const economy = await prisma.economy.findUnique({
        where: { userId_guildId: { userId: interaction.user.id, guildId: interaction.guildId } },
      });

      const wallet = economy?.wallet || 0;

      if (wallet < amount) {
        await interaction.reply({ content: '❌ You don\'t have enough money in your wallet.', ephemeral: true });
        return;
      }

      await prisma.$transaction([
        prisma.economy.update({
          where: { userId_guildId: { userId: interaction.user.id, guildId: interaction.guildId } },
          update: { wallet: { decrement: amount } },
        }),
        prisma.loan.update({
          where: { userId_guildId: { userId: interaction.user.id, guildId: interaction.guildId } },
          update: { paid: { increment: amount } },
        }),
      ]);

      const newRemaining = remaining - amount;
      const isPaidOff = newRemaining <= 0;

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.economy} Loan Payment`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Paid', value: `${amount} ${guild.currencySymbol || '💰'}`, inline: true },
          { name: 'Remaining', value: `${Math.max(0, newRemaining)} ${guild.currencySymbol || '💰'}`, inline: true },
          { name: 'Status', value: isPaidOff ? 'Loan Paid Off!' : 'Active', inline: true },
        ])
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ content: '❌ Failed to pay loan.', ephemeral: true });
    }
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const amount = parseInt(args[0]);

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

      const loan = await prisma.loan.findUnique({
        where: { userId_guildId: { userId: message.author.id, guildId: message.guildId } },
      });

      if (!loan || loan.paid >= loan.amount) {
        await message.reply('❌ You don\'t have an active loan.');
        return;
      }

      const remaining = loan.amount - loan.paid;

      if (amount > remaining) {
        await message.reply(`❌ You only owe ${remaining} ${guild.currencySymbol || '💰'}.`);
        return;
      }

      const economy = await prisma.economy.findUnique({
        where: { userId_guildId: { userId: message.author.id, guildId: message.guildId } },
      });

      const wallet = economy?.wallet || 0;

      if (wallet < amount) {
        await message.reply('❌ You don\'t have enough money in your wallet.');
        return;
      }

      await prisma.$transaction([
        prisma.economy.update({
          where: { userId_guildId: { userId: message.author.id, guildId: message.guildId } },
          update: { wallet: { decrement: amount } },
        }),
        prisma.loan.update({
          where: { userId_guildId: { userId: message.author.id, guildId: message.guildId } },
          update: { paid: { increment: amount } },
        }),
      ]);

      const newRemaining = remaining - amount;
      const isPaidOff = newRemaining <= 0;

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.economy} Loan Payment`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Paid', value: `${amount} ${guild.currencySymbol || '💰'}`, inline: true },
          { name: 'Remaining', value: `${Math.max(0, newRemaining)} ${guild.currencySymbol || '💰'}`, inline: true },
          { name: 'Status', value: isPaidOff ? 'Loan Paid Off!' : 'Active', inline: true },
        ])
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      await message.reply('❌ Failed to pay loan.');
    }
  }
}

export default PayLoanCommand;
