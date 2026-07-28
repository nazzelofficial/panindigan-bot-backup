// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';

export class EditShopItemCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'editshopitem',
      description: 'Edit a shop item (Admin)',
      category: 'economy',
      cooldown: 5,
      userPermissions: [PermissionFlagsBits.Administrator],
      botPermissions: [],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['modifyitem', 'updateitem'],
      examples: ['/editshopitem Sword 600', 'p!editshopitem Sword 600'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const name = interaction.options.getString('name');
    const price = interaction.options.getInteger('price');
    const description = interaction.options.getString('description');

    if (!name) {
      await interaction.reply({ content: '❌ Please provide an item name.', ephemeral: true });
      return;
    }

    if (!interaction.guildId) return;

    try {
      const prisma = getPrismaClient();

      const item = await prisma.shopItem.findFirst({
        where: { guildId: interaction.guildId, name: { equals: name, mode: 'insensitive' } },
      });

      if (!item) {
        await interaction.reply({ content: '❌ Item not found in the shop.', ephemeral: true });
        return;
      }

      const updateData: any = {};
      if (price !== null && price > 0) updateData.price = price;
      if (description) updateData.description = description;

      if (Object.keys(updateData).length === 0) {
        await interaction.reply({ content: '❌ Please provide at least one field to update (price or description).', ephemeral: true });
        return;
      }

      await prisma.shopItem.update({
        where: { id: item.id },
        data: updateData,
      });

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.economy} Shop Item Updated`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Item', value: item.name, inline: true },
          { name: 'New Price', value: updateData.price ? updateData.price.toString() : item.price.toString(), inline: true },
          { name: 'New Description', value: updateData.description || item.description, inline: false },
        ])
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ content: '❌ Failed to edit shop item.', ephemeral: true });
    }
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const name = args[0];
    const price = parseInt(args[1]);
    const description = args.slice(2).join(' ');

    if (!name) {
      await message.reply('❌ Please provide an item name.');
      return;
    }

    if (!message.guildId) return;

    try {
      const prisma = getPrismaClient();

      const item = await prisma.shopItem.findFirst({
        where: { guildId: message.guildId, name: { equals: name, mode: 'insensitive' } },
      });

      if (!item) {
        await message.reply('❌ Item not found in the shop.');
        return;
      }

      const updateData: any = {};
      if (!isNaN(price) && price > 0) updateData.price = price;
      if (description) updateData.description = description;

      if (Object.keys(updateData).length === 0) {
        await message.reply('❌ Please provide at least one field to update (price or description).');
        return;
      }

      await prisma.shopItem.update({
        where: { id: item.id },
        data: updateData,
      });

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.economy} Shop Item Updated`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Item', value: item.name, inline: true },
          { name: 'New Price', value: updateData.price ? updateData.price.toString() : item.price.toString(), inline: true },
          { name: 'New Description', value: updateData.description || item.description, inline: false },
        ])
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      await message.reply('❌ Failed to edit shop item.');
    }
  }
}

export default EditShopItemCommand;
