import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';
import { getPrismaClient } from '../../database/postgresql/client';

export class BuyCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'buy',
      description: 'Buy an item from the shop',
      category: 'economy',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['purchase'],
      examples: ['/buy Dice', 'p!buy Dice'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const itemName = interaction.options.getString('item');

    if (!itemName) {
      await interaction.reply({ content: '❌ Please provide an item name.', ephemeral: true });
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

      const shopItem = await prisma.shopItem.findFirst({
        where: { guildId: interaction.guildId, name: { equals: itemName, mode: 'insensitive' } },
      });

      if (!shopItem) {
        await interaction.reply({ content: '❌ Item not found in shop.', ephemeral: true });
        return;
      }

      if (wallet < shopItem.price) {
        await interaction.reply({ content: `❌ You don't have enough money. You need ${shopItem.price} ${guild.currencySymbol || '💰'}.`, ephemeral: true });
        return;
      }

      await prisma.$transaction([
        prisma.economy.update({
          where: { userId_guildId: { userId: interaction.user.id, guildId: interaction.guildId } },
          update: { wallet: { decrement: shopItem.price } },
        }),
        prisma.inventory.upsert({
          where: { userId_itemId: { userId: interaction.user.id, itemId: shopItem.id } },
          update: { quantity: { increment: 1 } },
          create: { userId: interaction.user.id, itemId: shopItem.id, quantity: 1 },
        }),
      ]);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.economy} Purchase Successful`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Item', value: shopItem.name, inline: true },
          { name: 'Price', value: `${shopItem.price} ${guild.currencySymbol || '💰'}`, inline: true },
        ])
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ content: '❌ Failed to buy item.', ephemeral: true });
    }
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const itemName = args.join(' ');

    if (!itemName) {
      await message.reply('❌ Please provide an item name.');
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

      const shopItem = await prisma.shopItem.findFirst({
        where: { guildId: message.guildId, name: { equals: itemName, mode: 'insensitive' } },
      });

      if (!shopItem) {
        await message.reply('❌ Item not found in shop.');
        return;
      }

      if (wallet < shopItem.price) {
        await message.reply(`❌ You don't have enough money. You need ${shopItem.price} ${guild.currencySymbol || '💰'}.`);
        return;
      }

      await prisma.$transaction([
        prisma.economy.update({
          where: { userId_guildId: { userId: message.author.id, guildId: message.guildId } },
          update: { wallet: { decrement: shopItem.price } },
        }),
        prisma.inventory.upsert({
          where: { userId_itemId: { userId: message.author.id, itemId: shopItem.id } },
          update: { quantity: { increment: 1 } },
          create: { userId: message.author.id, itemId: shopItem.id, quantity: 1 },
        }),
      ]);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.economy} Purchase Successful`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Item', value: shopItem.name, inline: true },
          { name: 'Price', value: `${shopItem.price} ${guild.currencySymbol || '💰'}`, inline: true },
        ])
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      await message.reply('❌ Failed to buy item.');
    }
  }
}

export default BuyCommand;
