// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';

export class InventoryCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'inventory',
      description: 'View your inventory',
      category: 'economy',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['inv', 'items', 'bag'],
      examples: ['/inventory', 'p!inventory'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guildId) return;

    try {
      const prisma = getPrismaClient();

      const inventory = await prisma.inventory.findMany({
        where: { userId: interaction.user.id },
        include: { item: true },
      });

      if (inventory.length === 0) {
        await interaction.reply({ content: '❌ Your inventory is empty.', ephemeral: true });
        return;
      }

      const items = inventory.map((inv) => {
        const item = inv.item;
        return `${item?.name || 'Unknown'} x${inv.quantity}`;
      });

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.economy} ${interaction.user.tag}'s Inventory`)
        .setColor(COLORS.info)
        .setDescription(items.join('\n'))
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ content: '❌ Failed to fetch inventory.', ephemeral: true });
    }
  }

  public async executePrefix(message: Message): Promise<void> {
    if (!message.guildId) return;

    try {
      const prisma = getPrismaClient();

      const inventory = await prisma.inventory.findMany({
        where: { userId: message.author.id },
        include: { item: true },
      });

      if (inventory.length === 0) {
        await message.reply('❌ Your inventory is empty.');
        return;
      }

      const items = inventory.map((inv) => {
        const item = inv.item;
        return `${item?.name || 'Unknown'} x${inv.quantity}`;
      });

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.economy} ${message.author.tag}'s Inventory`)
        .setColor(COLORS.info)
        .setDescription(items.join('\n'))
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      await message.reply('❌ Failed to fetch inventory.');
    }
  }
}

export default InventoryCommand;
