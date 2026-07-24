import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';
import { getPrismaClient } from '../../database/postgresql/client';

export class CraftCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'craft',
      description: 'Craft items using materials',
      category: 'economy',
      cooldown: 10,
      userPermissions: [],
      botPermissions: [],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['create', 'make'],
      examples: ['/craft Sword', 'p!craft Sword'],
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

      const recipe = await prisma.recipe.findFirst({
        where: { guildId: interaction.guildId, resultItem: { equals: itemName, mode: 'insensitive' } },
      });

      if (!recipe) {
        await interaction.reply({ content: '❌ No recipe found for this item.', ephemeral: true });
        return;
      }

      const inventory = await prisma.inventory.findMany({
        where: { userId: interaction.user.id },
      });

      const hasMaterials = recipe.materials.every((material) => {
        const invItem = inventory.find((inv) => inv.itemId === material.itemId);
        return invItem && invItem.quantity >= material.quantity;
      });

      if (!hasMaterials) {
        await interaction.reply({ content: '❌ You don\'t have the required materials.', ephemeral: true });
        return;
      }

      await prisma.$transaction([
        ...recipe.materials.map((material) =>
          prisma.inventory.update({
            where: { userId_itemId: { userId: interaction.user.id, itemId: material.itemId } },
            update: { quantity: { decrement: material.quantity } },
          })
        ),
        prisma.inventory.upsert({
          where: { userId_itemId: { userId: interaction.user.id, itemId: recipe.resultItemId } },
          update: { quantity: { increment: 1 } },
          create: { userId: interaction.user.id, itemId: recipe.resultItemId, quantity: 1 },
        }),
      ]);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.economy} Crafting Successful`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Crafted', value: itemName, inline: true },
        ])
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ content: '❌ Failed to craft item.', ephemeral: true });
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

      const recipe = await prisma.recipe.findFirst({
        where: { guildId: message.guildId, resultItem: { equals: itemName, mode: 'insensitive' } },
      });

      if (!recipe) {
        await message.reply('❌ No recipe found for this item.');
        return;
      }

      const inventory = await prisma.inventory.findMany({
        where: { userId: message.author.id },
      });

      const hasMaterials = recipe.materials.every((material) => {
        const invItem = inventory.find((inv) => inv.itemId === material.itemId);
        return invItem && invItem.quantity >= material.quantity;
      });

      if (!hasMaterials) {
        await message.reply('❌ You don\'t have the required materials.');
        return;
      }

      await prisma.$transaction([
        ...recipe.materials.map((material) =>
          prisma.inventory.update({
            where: { userId_itemId: { userId: message.author.id, itemId: material.itemId } },
            update: { quantity: { decrement: material.quantity } },
          })
        ),
        prisma.inventory.upsert({
          where: { userId_itemId: { userId: message.author.id, itemId: recipe.resultItemId } },
          update: { quantity: { increment: 1 } },
          create: { userId: message.author.id, itemId: recipe.resultItemId, quantity: 1 },
        }),
      ]);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.economy} Crafting Successful`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Crafted', value: itemName, inline: true },
        ])
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      await message.reply('❌ Failed to craft item.');
    }
  }
}

export default CraftCommand;
