import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';
import { getPrismaClient } from '../../database/postgresql/client';

export class SmuggleCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'smuggle',
      description: 'Smuggle goods for profit',
      category: 'economy',
      cooldown: 120,
      userPermissions: [],
      botPermissions: [],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['smugglegoods', 'tradeillegal'],
      examples: ['/smuggle', 'p!smuggle'],
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

      const goods = [
        { name: 'Electronics', minProfit: 500, maxProfit: 2000, failChance: 0.3 },
        { name: 'Jewelry', minProfit: 1000, maxProfit: 5000, failChance: 0.4 },
        { name: 'Art', minProfit: 2000, maxProfit: 10000, failChance: 0.5 },
        { name: 'Rare Items', minProfit: 5000, maxProfit: 25000, failChance: 0.6 },
      ];

      const good = goods[Math.floor(Math.random() * goods.length)];
      const success = Math.random() > good.failChance;

      if (success) {
        const profit = Math.floor(Math.random() * (good.maxProfit - good.minProfit + 1)) + good.minProfit;

        await prisma.economy.upsert({
          where: { userId_guildId: { userId: interaction.user.id, guildId: interaction.guildId } },
          update: { wallet: { increment: profit } },
          create: { userId: interaction.user.id, guildId: interaction.guildId, wallet: profit, bank: 0 },
        });

        const embed = new EmbedBuilder()
          .setTitle(`${EMOJIS.economy} Smuggling Successful`)
          .setColor(COLORS.success)
          .addFields([
            { name: 'Goods', value: good.name, inline: true },
            { name: 'Profit', value: `${profit} ${guild.currencySymbol || '💰'}`, inline: true },
          ])
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });
      } else {
        const loss = Math.floor(good.minProfit * 0.5);

        await prisma.economy.upsert({
          where: { userId_guildId: { userId: interaction.user.id, guildId: interaction.guildId } },
          update: { wallet: { decrement: Math.min(loss, good.minProfit) } },
          create: { userId: interaction.user.id, guildId: interaction.guildId, wallet: 0, bank: 0 },
        });

        const embed = new EmbedBuilder()
          .setTitle(`${EMOJIS.error} Smuggling Failed`)
          .setColor(COLORS.error)
          .addFields([
            { name: 'Goods', value: good.name, inline: true },
            { name: 'Loss', value: `${Math.min(loss, good.minProfit)} ${guild.currencySymbol || '💰'}`, inline: true },
            { name: 'Reason', value: 'Caught by authorities', inline: false },
          ])
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });
      }
    } catch (error) {
      await interaction.reply({ content: '❌ Failed to smuggle.', ephemeral: true });
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

      const goods = [
        { name: 'Electronics', minProfit: 500, maxProfit: 2000, failChance: 0.3 },
        { name: 'Jewelry', minProfit: 1000, maxProfit: 5000, failChance: 0.4 },
        { name: 'Art', minProfit: 2000, maxProfit: 10000, failChance: 0.5 },
        { name: 'Rare Items', minProfit: 5000, maxProfit: 25000, failChance: 0.6 },
      ];

      const good = goods[Math.floor(Math.random() * goods.length)];
      const success = Math.random() > good.failChance;

      if (success) {
        const profit = Math.floor(Math.random() * (good.maxProfit - good.minProfit + 1)) + good.minProfit;

        await prisma.economy.upsert({
          where: { userId_guildId: { userId: message.author.id, guildId: message.guildId } },
          update: { wallet: { increment: profit } },
          create: { userId: message.author.id, guildId: message.guildId, wallet: profit, bank: 0 },
        });

        const embed = new EmbedBuilder()
          .setTitle(`${EMOJIS.economy} Smuggling Successful`)
          .setColor(COLORS.success)
          .addFields([
            { name: 'Goods', value: good.name, inline: true },
            { name: 'Profit', value: `${profit} ${guild.currencySymbol || '💰'}`, inline: true },
          ])
          .setTimestamp();

        await message.reply({ embeds: [embed] });
      } else {
        const loss = Math.floor(good.minProfit * 0.5);

        await prisma.economy.upsert({
          where: { userId_guildId: { userId: message.author.id, guildId: message.guildId } },
          update: { wallet: { decrement: Math.min(loss, good.minProfit) } },
          create: { userId: message.author.id, guildId: message.guildId, wallet: 0, bank: 0 },
        });

        const embed = new EmbedBuilder()
          .setTitle(`${EMOJIS.error} Smuggling Failed`)
          .setColor(COLORS.error)
          .addFields([
            { name: 'Goods', value: good.name, inline: true },
            { name: 'Loss', value: `${Math.min(loss, good.minProfit)} ${guild.currencySymbol || '💰'}`, inline: true },
            { name: 'Reason', value: 'Caught by authorities', inline: false },
          ])
          .setTimestamp();

        await message.reply({ embeds: [embed] });
      }
    } catch (error) {
      await message.reply('❌ Failed to smuggle.');
    }
  }
}

export default SmuggleCommand;
