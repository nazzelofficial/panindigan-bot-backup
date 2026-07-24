import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';
import { getPrismaClient } from '../../database/postgresql/client';

export class MyStocksCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'mystocks',
      description: 'View your stock portfolio',
      category: 'economy',
      cooldown: 10,
      userPermissions: [],
      botPermissions: [],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['stockportfolio', 'myshares'],
      examples: ['/mystocks', 'p!mystocks'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guildId) return;

    try {
      const prisma = getPrismaClient();
      const guild = await prisma.guild.upsert({
        where: { guildId: interaction.guildId },
        update: {},
        create: { guildId: interaction.guildId },
      });

      const stocks = await prisma.stock.findMany({
        where: { userId: interaction.user.id, guildId: interaction.guildId },
      });

      if (stocks.length === 0) {
        await interaction.reply({ content: '❌ You don\'t own any stocks.', ephemeral: true });
        return;
      }

      const totalValue = stocks.reduce((sum, stock) => sum + (stock.shares * stock.avgPrice), 0);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.economy} Stock Portfolio`)
        .setColor(COLORS.info)
        .addFields(
          stocks.map((stock) => ({
            name: stock.symbol,
            value: `${stock.shares} shares @ $${stock.avgPrice.toFixed(2)} = $${(stock.shares * stock.avgPrice).toFixed(2)}`,
            inline: false,
          }))
        )
        .addFields([
          { name: 'Total Portfolio Value', value: `$${totalValue.toFixed(2)}`, inline: false },
        ])
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ content: '❌ Failed to fetch stocks.', ephemeral: true });
    }
  }

  public async executePrefix(message: Message): Promise<void> {
    if (!message.guildId) return;

    try {
      const prisma = getPrismaClient();
      const guild = await prisma.guild.upsert({
        where: { guildId: message.guildId },
        update: {},
        create: { guildId: message.guildId },
      });

      const stocks = await prisma.stock.findMany({
        where: { userId: message.author.id, guildId: message.guildId },
      });

      if (stocks.length === 0) {
        await message.reply('❌ You don\'t own any stocks.');
        return;
      }

      const totalValue = stocks.reduce((sum, stock) => sum + (stock.shares * stock.avgPrice), 0);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.economy} Stock Portfolio`)
        .setColor(COLORS.info)
        .addFields(
          stocks.map((stock) => ({
            name: stock.symbol,
            value: `${stock.shares} shares @ $${stock.avgPrice.toFixed(2)} = $${(stock.shares * stock.avgPrice).toFixed(2)}`,
            inline: false,
          }))
        )
        .addFields([
          { name: 'Total Portfolio Value', value: `$${totalValue.toFixed(2)}`, inline: false },
        ])
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      await message.reply('❌ Failed to fetch stocks.');
    }
  }
}

export default MyStocksCommand;
