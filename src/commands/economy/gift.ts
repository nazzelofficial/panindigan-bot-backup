// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';

export class GiftCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'gift',
      description: 'Gift an item to another user',
      category: 'economy',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['giveitem'],
      examples: ['/gift @user Dice', 'p!gift @user Dice'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const targetUser = interaction.options.getUser('user');
    const itemName = interaction.options.getString('item');

    if (!targetUser || targetUser.id === interaction.user.id) {
      await interaction.reply({ content: '❌ You cannot gift to yourself.', ephemeral: true });
      return;
    }

    if (!itemName) {
      await interaction.reply({ content: '❌ Please provide an item name.', ephemeral: true });
      return;
    }

    if (!interaction.guildId) return;

    try {
      const prisma = getPrismaClient();

      const shopItem = await prisma.shopItem.findFirst({
        where: { guildId: interaction.guildId, name: { equals: itemName, mode: 'insensitive' } },
      });

      if (!shopItem) {
        await interaction.reply({ content: '❌ Item not found.', ephemeral: true });
        return;
      }

      const inventory = await prisma.inventory.findUnique({
        where: { userId_itemId: { userId: interaction.user.id, itemId: shopItem.id } },
      });

      if (!inventory || inventory.quantity <= 0) {
        await interaction.reply({ content: '❌ You don\'t have this item.', ephemeral: true });
        return;
      }

      await prisma.$transaction([
        prisma.inventory.update({
          where: { userId_itemId: { userId: interaction.user.id, itemId: shopItem.id } },
          update: { quantity: { decrement: 1 } },
        }),
        prisma.inventory.upsert({
          where: { userId_itemId: { userId: targetUser.id, itemId: shopItem.id } },
          update: { quantity: { increment: 1 } },
          create: { userId: targetUser.id, itemId: shopItem.id, quantity: 1 },
        }),
      ]);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.economy} Gift Sent`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Item', value: shopItem.name, inline: true },
          { name: 'From', value: interaction.user.tag, inline: true },
          { name: 'To', value: targetUser.tag, inline: true },
        ])
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ content: '❌ Failed to gift item.', ephemeral: true });
    }
  }

  public async executePrefix(message: Message, _args: string[]): Promise<void> {
    const targetUser = message.mentions.users.first();
    const itemName = _args.slice(1).join(' ');

    if (!targetUser || targetUser.id === message.author.id) {
      await message.reply('❌ You cannot gift to yourself.');
      return;
    }

    if (!itemName) {
      await message.reply('❌ Please provide an item name.');
      return;
    }

    if (!message.guildId) return;

    try {
      const prisma = getPrismaClient();

      const shopItem = await prisma.shopItem.findFirst({
        where: { guildId: message.guildId, name: { equals: itemName, mode: 'insensitive' } },
      });

      if (!shopItem) {
        await message.reply('❌ Item not found.');
        return;
      }

      const inventory = await prisma.inventory.findUnique({
        where: { userId_itemId: { userId: message.author.id, itemId: shopItem.id } },
      });

      if (!inventory || inventory.quantity <= 0) {
        await message.reply('❌ You don\'t have this item.');
        return;
      }

      await prisma.$transaction([
        prisma.inventory.update({
          where: { userId_itemId: { userId: message.author.id, itemId: shopItem.id } },
          update: { quantity: { decrement: 1 } },
        }),
        prisma.inventory.upsert({
          where: { userId_itemId: { userId: targetUser.id, itemId: shopItem.id } },
          update: { quantity: { increment: 1 } },
          create: { userId: targetUser.id, itemId: shopItem.id, quantity: 1 },
        }),
      ]);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.economy} Gift Sent`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Item', value: shopItem.name, inline: true },
          { name: 'From', value: message.author.tag, inline: true },
          { name: 'To', value: targetUser.tag, inline: true },
        ])
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      await message.reply('❌ Failed to gift item.');
    }
  }
}

export default GiftCommand;
