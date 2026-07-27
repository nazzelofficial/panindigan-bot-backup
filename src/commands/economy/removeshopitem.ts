// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';

export class RemoveShopItemCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'removeshopitem',
      description: 'Remove an item from the shop (Admin)',
      category: 'economy',
      cooldown: 5,
      userPermissions: [PermissionFlagsBits.Administrator],
      botPermissions: [],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['deleteitem', 'removeitem'],
      examples: ['/removeshopitem Sword', 'p!removeshopitem Sword'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const name = interaction.options.getString('name');

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

      await prisma.shopItem.delete({
        where: { id: item.id },
      });

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.economy} Shop Item Removed`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Item', value: item.name, inline: true },
        ])
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ content: '❌ Failed to remove shop item.', ephemeral: true });
    }
  }

  public async executePrefix(message: Message, _args: string[]): Promise<void> {
    const name = _args.join(' ');

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

      await prisma.shopItem.delete({
        where: { id: item.id },
      });

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.economy} Shop Item Removed`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Item', value: item.name, inline: true },
        ])
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      await message.reply('❌ Failed to remove shop item.');
    }
  }
}

export default RemoveShopItemCommand;
