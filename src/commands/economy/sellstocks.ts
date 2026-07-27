// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';

export class SellStocksCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'sellstocks',
      description: 'Sell stocks',
      category: 'economy',
      cooldown: 30,
      userPermissions: [],
      botPermissions: [],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['sellstock', 'sellshares'],
      examples: ['/sellstocks AAPL 10', 'p!sellstocks AAPL 10'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const symbol = interaction.options.getString('symbol');
    const shares = interaction.options.getInteger('shares');

    if (!symbol) {
      await interaction.reply({ content: '❌ Please provide a stock symbol.', ephemeral: true });
      return;
    }

    if (shares === null || shares <= 0) {
      await interaction.reply({ content: '❌ Please provide a valid number of shares.', ephemeral: true });
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

      const stock = await prisma.stock.findUnique({
        where: { userId_symbol: { userId: interaction.user.id, symbol: symbol.toUpperCase() } },
      });

      if (!stock || stock.shares < shares) {
        await interaction.reply({ content: '❌ You don\'t have enough shares.', ephemeral: true });
        return;
      }

      const currentPrice = stock.avgPrice * (0.8 + Math.random() * 0.4);
      const totalValue = Math.floor(currentPrice * shares);

      await prisma.$transaction([
        prisma.stock.update({
          where: { userId_symbol: { userId: interaction.user.id, symbol: symbol.toUpperCase() } },
          update: { shares: { decrement: shares } },
        }),
        prisma.economy.upsert({
          where: { userId_guildId: { userId: interaction.user.id, guildId: interaction.guildId } },
          update: { wallet: { increment: totalValue } },
          create: { userId: interaction.user.id, guildId: interaction.guildId, wallet: totalValue, bank: 0 },
        }),
      ]);

      if (stock.shares - shares === 0) {
        await prisma.stock.delete({
          where: { userId_symbol: { userId: interaction.user.id, symbol: symbol.toUpperCase() } },
        });
      }

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.economy} Stocks Sold`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Stock', value: symbol.toUpperCase(), inline: true },
          { name: 'Shares', value: shares.toString(), inline: true },
          { name: 'Price per Share', value: `$${currentPrice.toFixed(2)}`, inline: true },
          { name: 'Total Value', value: `${totalValue} ${guild.currencySymbol || '💰'}`, inline: true },
        ])
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ content: '❌ Failed to sell stocks.', ephemeral: true });
    }
  }

  public async executePrefix(message: Message, _args: string[]): Promise<void> {
    const symbol = args[0];
    const shares = parseInt(args[1]);

    if (!symbol) {
      await message.reply('❌ Please provide a stock symbol.');
      return;
    }

    if (isNaN(shares) || shares <= 0) {
      await message.reply('❌ Please provide a valid number of shares.');
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

      const stock = await prisma.stock.findUnique({
        where: { userId_symbol: { userId: message.author.id, symbol: symbol.toUpperCase() } },
      });

      if (!stock || stock.shares < shares) {
        await message.reply('❌ You don\'t have enough shares.');
        return;
      }

      const currentPrice = stock.avgPrice * (0.8 + Math.random() * 0.4);
      const totalValue = Math.floor(currentPrice * shares);

      await prisma.$transaction([
        prisma.stock.update({
          where: { userId_symbol: { userId: message.author.id, symbol: symbol.toUpperCase() } },
          update: { shares: { decrement: shares } },
        }),
        prisma.economy.upsert({
          where: { userId_guildId: { userId: message.author.id, guildId: message.guildId } },
          update: { wallet: { increment: totalValue } },
          create: { userId: message.author.id, guildId: message.guildId, wallet: totalValue, bank: 0 },
        }),
      ]);

      if (stock.shares - shares === 0) {
        await prisma.stock.delete({
          where: { userId_symbol: { userId: message.author.id, symbol: symbol.toUpperCase() } },
        });
      }

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.economy} Stocks Sold`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Stock', value: symbol.toUpperCase(), inline: true },
          { name: 'Shares', value: shares.toString(), inline: true },
          { name: 'Price per Share', value: `$${currentPrice.toFixed(2)}`, inline: true },
          { name: 'Total Value', value: `${totalValue} ${guild.currencySymbol || '💰'}`, inline: true },
        ])
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      await message.reply('❌ Failed to sell stocks.');
    }
  }
}

export default SellStocksCommand;
