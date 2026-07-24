import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';
import { getPrismaClient } from '../../database/postgresql/client';

export class AddShopItemCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'addshopitem',
      description: 'Add an item to the shop (Admin)',
      category: 'economy',
      cooldown: 5,
      userPermissions: [PermissionFlagsBits.Administrator],
      botPermissions: [],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['createitem', 'additem'],
      examples: ['/addshopitem Sword 500', 'p!addshopitem Sword 500'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const name = interaction.options.getString('name');
    const price = interaction.options.getInteger('price');
    const description = interaction.options.getString('description') || 'No description';

    if (!name) {
      await interaction.reply({ content: '❌ Please provide an item name.', ephemeral: true });
      return;
    }

    if (price === null || price <= 0) {
      await interaction.reply({ content: '❌ Please provide a valid price.', ephemeral: true });
      return;
    }

    if (!interaction.guildId) return;

    try {
      const prisma = getPrismaClient();

      const existingItem = await prisma.shopItem.findFirst({
        where: { guildId: interaction.guildId, name: { equals: name, mode: 'insensitive' } },
      });

      if (existingItem) {
        await interaction.reply({ content: '❌ Item already exists in the shop.', ephemeral: true });
        return;
      }

      await prisma.shopItem.create({
        data: {
          guildId: interaction.guildId,
          name,
          price,
          description,
        },
      });

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.economy} Shop Item Added`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Item', value: name, inline: true },
          { name: 'Price', value: price.toString(), inline: true },
          { name: 'Description', value: description, inline: false },
        ])
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ content: '❌ Failed to add shop item.', ephemeral: true });
    }
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const name = args[0];
    const price = parseInt(args[1]);
    const description = args.slice(2).join(' ') || 'No description';

    if (!name) {
      await message.reply('❌ Please provide an item name.');
      return;
    }

    if (isNaN(price) || price <= 0) {
      await message.reply('❌ Please provide a valid price.');
      return;
    }

    if (!message.guildId) return;

    try {
      const prisma = getPrismaClient();

      const existingItem = await prisma.shopItem.findFirst({
        where: { guildId: message.guildId, name: { equals: name, mode: 'insensitive' } },
      });

      if (existingItem) {
        await message.reply('❌ Item already exists in the shop.');
        return;
      }

      await prisma.shopItem.create({
        data: {
          guildId: message.guildId,
          name,
          price,
          description,
        },
      });

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.economy} Shop Item Added`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Item', value: name, inline: true },
          { name: 'Price', value: price.toString(), inline: true },
          { name: 'Description', value: description, inline: false },
        ])
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      await message.reply('❌ Failed to add shop item.');
    }
  }
}

export default AddShopItemCommand;
