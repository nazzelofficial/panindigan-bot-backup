import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';
import { getPrismaClient } from '../../database/postgresql/client';

export class ShopCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'shop',
      description: 'View the shop',
      category: 'economy',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['store', 'market'],
      examples: ['/shop', 'p!shop'],
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

      const shopItems = await prisma.shopItem.findMany({
        where: { guildId: interaction.guildId },
      });

      if (shopItems.length === 0) {
        const defaultItems = [
          { name: '🎲 Dice', price: 100, description: 'Use for gambling games' },
          { name: '🎫 Lottery Ticket', price: 50, description: 'Enter the lottery' },
          { name: '🎁 Gift Box', price: 200, description: 'Contains random items' },
          { name: '🛡️ Shield', price: 500, description: 'Protects from robbery' },
          { name: '⚔️ Sword', price: 750, description: 'Increases robbery success rate' },
        ];

        const embed = new EmbedBuilder()
          .setTitle(`${EMOJIS.economy} Shop`)
          .setColor(COLORS.info)
          .setDescription('Default shop items:')
          .addFields(
            defaultItems.map((item) => ({
              name: `${item.name} - ${item.price} ${guild.currencySymbol || '💰'}`,
              value: item.description,
              inline: false,
            }))
          )
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });
        return;
      }

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.economy} Shop`)
        .setColor(COLORS.info)
        .addFields(
          shopItems.map((item) => ({
            name: `${item.name} - ${item.price} ${guild.currencySymbol || '💰'}`,
            value: item.description || 'No description',
            inline: false,
          }))
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ content: '❌ Failed to fetch shop.', ephemeral: true });
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

      const shopItems = await prisma.shopItem.findMany({
        where: { guildId: message.guildId },
      });

      if (shopItems.length === 0) {
        const defaultItems = [
          { name: '🎲 Dice', price: 100, description: 'Use for gambling games' },
          { name: '🎫 Lottery Ticket', price: 50, description: 'Enter the lottery' },
          { name: '🎁 Gift Box', price: 200, description: 'Contains random items' },
          { name: '🛡️ Shield', price: 500, description: 'Protects from robbery' },
          { name: '⚔️ Sword', price: 750, description: 'Increases robbery success rate' },
        ];

        const embed = new EmbedBuilder()
          .setTitle(`${EMOJIS.economy} Shop`)
          .setColor(COLORS.info)
          .setDescription('Default shop items:')
          .addFields(
            defaultItems.map((item) => ({
              name: `${item.name} - ${item.price} ${guild.currencySymbol || '💰'}`,
              value: item.description,
              inline: false,
            }))
          )
          .setTimestamp();

        await message.reply({ embeds: [embed] });
        return;
      }

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.economy} Shop`)
        .setColor(COLORS.info)
        .addFields(
          shopItems.map((item) => ({
            name: `${item.name} - ${item.price} ${guild.currencySymbol || '💰'}`,
            value: item.description || 'No description',
            inline: false,
          }))
        )
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      await message.reply('❌ Failed to fetch shop.');
    }
  }
}

export default ShopCommand;
