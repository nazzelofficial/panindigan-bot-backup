// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';

export class BuyStocksCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'buystocks',
      description: 'Buy stocks',
      category: 'economy',
      cooldown: 30,
      userPermissions: [],
      botPermissions: [],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['buystock', 'investstock'],
      examples: ['/buystocks AAPL 10', 'p!buystocks AAPL 10'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const symbol = interaction.options.getString('symbol');
    const shares = interaction.options.getInteger('shares');

    if (!symbol) {
      await interaction.reply({ content: '❌ Please provide a stock symbol (AAPL, GOOGL, MSFT, AMZN, TSLA).', ephemeral: true });
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

      const stockPrices: Record<string, number> = {
        AAPL: 150 + Math.floor(Math.random() * 200),
        GOOGL: 120 + Math.floor(Math.random() * 150),
        MSFT: 280 + Math.floor(Math.random() * 180),
        AMZN: 130 + Math.floor(Math.random() * 100),
        TSLA: 200 + Math.floor(Math.random() * 300),
      };

      const price = stockPrices[symbol.toUpperCase()];

      if (!price) {
        await interaction.reply({ content: '❌ Invalid stock symbol.', ephemeral: true });
        return;
      }

      const totalCost = price * shares;

      const economy = await prisma.economy.findUnique({
        where: { userId_guildId: { userId: interaction.user.id, guildId: interaction.guildId } },
      });

      const wallet = economy?.wallet || 0;

      if (wallet < totalCost) {
        await interaction.reply({ content: `❌ You need ${totalCost} ${guild.currencySymbol || '💰'} to buy ${shares} shares.`, ephemeral: true });
        return;
      }

      await prisma.$transaction([
        prisma.economy.update({
          where: { userId_guildId: { userId: interaction.user.id, guildId: interaction.guildId } },
          update: { wallet: { decrement: totalCost } },
        }),
        prisma.stock.upsert({
          where: { userId_symbol: { userId: interaction.user.id, symbol: symbol.toUpperCase() } },
          update: { shares: { increment: shares }, avgPrice: { set: price } },
          create: { userId: interaction.user.id, symbol: symbol.toUpperCase(), shares, avgPrice: price, guildId: interaction.guildId },
        }),
      ]);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.economy} Stocks Purchased`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Stock', value: symbol.toUpperCase(), inline: true },
          { name: 'Shares', value: shares.toString(), inline: true },
          { name: 'Price per Share', value: `$${price.toFixed(2)}`, inline: true },
          { name: 'Total Cost', value: `${totalCost} ${guild.currencySymbol || '💰'}`, inline: true },
        ])
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ content: '❌ Failed to buy stocks.', ephemeral: true });
    }
  }

  public async executePrefix(message: Message, _args: string[]): Promise<void> {
    const symbol = args[0];
    const shares = parseInt(args[1]);

    if (!symbol) {
      await message.reply('❌ Please provide a stock symbol (AAPL, GOOGL, MSFT, AMZN, TSLA).');
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

      const stockPrices: Record<string, number> = {
        AAPL: 150 + Math.floor(Math.random() * 200),
        GOOGL: 120 + Math.floor(Math.random() * 150),
        MSFT: 280 + Math.floor(Math.random() * 180),
        AMZN: 130 + Math.floor(Math.random() * 100),
        TSLA: 200 + Math.floor(Math.random() * 300),
      };

      const price = stockPrices[symbol.toUpperCase()];

      if (!price) {
        await message.reply('❌ Invalid stock symbol.');
        return;
      }

      const totalCost = price * shares;

      const economy = await prisma.economy.findUnique({
        where: { userId_guildId: { userId: message.author.id, guildId: message.guildId } },
      });

      const wallet = economy?.wallet || 0;

      if (wallet < totalCost) {
        await message.reply(`❌ You need ${totalCost} ${guild.currencySymbol || '💰'} to buy ${shares} shares.`);
        return;
      }

      await prisma.$transaction([
        prisma.economy.update({
          where: { userId_guildId: { userId: message.author.id, guildId: message.guildId } },
          update: { wallet: { decrement: totalCost } },
        }),
        prisma.stock.upsert({
          where: { userId_symbol: { userId: message.author.id, symbol: symbol.toUpperCase() } },
          update: { shares: { increment: shares }, avgPrice: { set: price } },
          create: { userId: message.author.id, symbol: symbol.toUpperCase(), shares, avgPrice: price, guildId: message.guildId },
        }),
      ]);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.economy} Stocks Purchased`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Stock', value: symbol.toUpperCase(), inline: true },
          { name: 'Shares', value: shares.toString(), inline: true },
          { name: 'Price per Share', value: `$${price.toFixed(2)}`, inline: true },
          { name: 'Total Cost', value: `${totalCost} ${guild.currencySymbol || '💰'}`, inline: true },
        ])
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      await message.reply('❌ Failed to buy stocks.');
    }
  }
}

export default BuyStocksCommand;
