// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';

export class UseItemCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'useitem',
      description: 'Use an item from your inventory',
      category: 'economy',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['use', 'activate'],
      examples: ['/useitem Shield', 'p!useitem Shield'],
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

      await prisma.inventory.update({
        where: { userId_itemId: { userId: interaction.user.id, itemId: shopItem.id } },
        update: { quantity: { decrement: 1 } },
      });

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.economy} Item Used`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Item', value: shopItem.name, inline: true },
          { name: 'Effect', value: shopItem.description || 'No effect description', inline: false },
        ])
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ content: '❌ Failed to use item.', ephemeral: true });
    }
  }

  public async executePrefix(message: Message, _args: string[]): Promise<void> {
    const itemName = _args.join(' ');

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

      await prisma.inventory.update({
        where: { userId_itemId: { userId: message.author.id, itemId: shopItem.id } },
        update: { quantity: { decrement: 1 } },
      });

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.economy} Item Used`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Item', value: shopItem.name, inline: true },
          { name: 'Effect', value: shopItem.description || 'No effect description', inline: false },
        ])
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      await message.reply('❌ Failed to use item.');
    }
  }
}

export default UseItemCommand;
