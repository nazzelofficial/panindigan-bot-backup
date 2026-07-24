import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';
import { getPrismaClient } from '../../database/postgresql/client';

export class LoanCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'loan',
      description: 'Take out a loan from the bank',
      category: 'economy',
      cooldown: 60,
      userPermissions: [],
      botPermissions: [],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['borrow'],
      examples: ['/loan 5000', 'p!loan 5000'],
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

      const maxLoan = guild.maxLoan || 10000;

      if (amount > maxLoan) {
        await interaction.reply({ content: `❌ Maximum loan amount is ${maxLoan} ${guild.currencySymbol || '💰'}.`, ephemeral: true });
        return;
      }

      const existingLoan = await prisma.loan.findUnique({
        where: { userId_guildId: { userId: interaction.user.id, guildId: interaction.guildId } },
      });

      if (existingLoan && existingLoan.paid < existingLoan.amount) {
        await interaction.reply({ content: '❌ You already have an active loan. Pay it off first.', ephemeral: true });
        return;
      }

      await prisma.$transaction([
        prisma.economy.upsert({
          where: { userId_guildId: { userId: interaction.user.id, guildId: interaction.guildId } },
          update: { wallet: { increment: amount } },
          create: { userId: interaction.user.id, guildId: interaction.guildId, wallet: amount, bank: 0 },
        }),
        prisma.loan.upsert({
          where: { userId_guildId: { userId: interaction.user.id, guildId: interaction.guildId } },
          update: { amount, paid: 0, dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
          create: { userId: interaction.user.id, guildId: interaction.guildId, amount, paid: 0, dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
        }),
      ]);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.economy} Loan Approved`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Loan Amount', value: `${amount} ${guild.currencySymbol || '💰'}`, inline: true },
          { name: 'Interest Rate', value: '10%', inline: true },
          { name: 'Due Date', value: '7 days', inline: true },
          { name: 'Total Due', value: `${Math.floor(amount * 1.1)} ${guild.currencySymbol || '💰'}`, inline: true },
        ])
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ content: '❌ Failed to take loan.', ephemeral: true });
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

      const maxLoan = guild.maxLoan || 10000;

      if (amount > maxLoan) {
        await message.reply(`❌ Maximum loan amount is ${maxLoan} ${guild.currencySymbol || '💰'}.`);
        return;
      }

      const existingLoan = await prisma.loan.findUnique({
        where: { userId_guildId: { userId: message.author.id, guildId: message.guildId } },
      });

      if (existingLoan && existingLoan.paid < existingLoan.amount) {
        await message.reply('❌ You already have an active loan. Pay it off first.');
        return;
      }

      await prisma.$transaction([
        prisma.economy.upsert({
          where: { userId_guildId: { userId: message.author.id, guildId: message.guildId } },
          update: { wallet: { increment: amount } },
          create: { userId: message.author.id, guildId: message.guildId, wallet: amount, bank: 0 },
        }),
        prisma.loan.upsert({
          where: { userId_guildId: { userId: message.author.id, guildId: message.guildId } },
          update: { amount, paid: 0, dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
          create: { userId: message.author.id, guildId: message.guildId, amount, paid: 0, dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
        }),
      ]);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.economy} Loan Approved`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Loan Amount', value: `${amount} ${guild.currencySymbol || '💰'}`, inline: true },
          { name: 'Interest Rate', value: '10%', inline: true },
          { name: 'Due Date', value: '7 days', inline: true },
          { name: 'Total Due', value: `${Math.floor(amount * 1.1)} ${guild.currencySymbol || '💰'}`, inline: true },
        ])
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      await message.reply('❌ Failed to take loan.');
    }
  }
}

export default LoanCommand;
