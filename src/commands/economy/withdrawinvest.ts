import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';
import { getPrismaClient } from '../../database/postgresql/client';

export class WithdrawInvestCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'withdrawinvest',
      description: 'Withdraw your investments',
      category: 'economy',
      cooldown: 60,
      userPermissions: [],
      botPermissions: [],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['sellinvestment', 'cashout'],
      examples: ['/withdrawinvest Gold', 'p!withdrawinvest Gold'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const item = interaction.options.getString('item');

    if (!item) {
      await interaction.reply({ content: '❌ Please provide an investment item to withdraw.', ephemeral: true });
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

      const investment = await prisma.investment.findUnique({
        where: { userId_item: { userId: interaction.user.id, item } },
      });

      if (!investment || investment.amount <= 0) {
        await interaction.reply({ content: '❌ You don\'t have this investment.', ephemeral: true });
        return;
      }

      const returnRate = 0.8 + Math.random() * 0.4;
      const returnedAmount = Math.floor(investment.amount * returnRate);

      await prisma.$transaction([
        prisma.investment.delete({
          where: { userId_item: { userId: interaction.user.id, item } },
        }),
        prisma.economy.upsert({
          where: { userId_guildId: { userId: interaction.user.id, guildId: interaction.guildId } },
          update: { wallet: { increment: returnedAmount } },
          create: { userId: interaction.user.id, guildId: interaction.guildId, wallet: returnedAmount, bank: 0 },
        }),
      ]);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.economy} Investment Withdrawn`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Item', value: item, inline: true },
          { name: 'Invested', value: `${investment.amount} ${guild.currencySymbol || '💰'}`, inline: true },
          { name: 'Returned', value: `${returnedAmount} ${guild.currencySymbol || '💰'}`, inline: true },
          { name: 'Return Rate', value: `${(returnRate * 100).toFixed(1)}%`, inline: true },
        ])
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ content: '❌ Failed to withdraw investment.', ephemeral: true });
    }
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const item = args[0];

    if (!item) {
      await message.reply('❌ Please provide an investment item to withdraw.');
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

      const investment = await prisma.investment.findUnique({
        where: { userId_item: { userId: message.author.id, item } },
      });

      if (!investment || investment.amount <= 0) {
        await message.reply('❌ You don\'t have this investment.');
        return;
      }

      const returnRate = 0.8 + Math.random() * 0.4;
      const returnedAmount = Math.floor(investment.amount * returnRate);

      await prisma.$transaction([
        prisma.investment.delete({
          where: { userId_item: { userId: message.author.id, item } },
        }),
        prisma.economy.upsert({
          where: { userId_guildId: { userId: message.author.id, guildId: message.guildId } },
          update: { wallet: { increment: returnedAmount } },
          create: { userId: message.author.id, guildId: message.guildId, wallet: returnedAmount, bank: 0 },
        }),
      ]);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.economy} Investment Withdrawn`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Item', value: item, inline: true },
          { name: 'Invested', value: `${investment.amount} ${guild.currencySymbol || '💰'}`, inline: true },
          { name: 'Returned', value: `${returnedAmount} ${guild.currencySymbol || '💰'}`, inline: true },
          { name: 'Return Rate', value: `${(returnRate * 100).toFixed(1)}%`, inline: true },
        ])
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      await message.reply('❌ Failed to withdraw investment.');
    }
  }
}

export default WithdrawInvestCommand;
