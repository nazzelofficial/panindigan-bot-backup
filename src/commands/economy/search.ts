// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';

export class SearchCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'moneysearch',
      description: 'Search for money in various locations',
      category: 'economy',
      cooldown: 30,
      userPermissions: [],
      botPermissions: [],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['look', 'find'],
      examples: ['/search', 'p!search'],
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

      const locations = [
        { name: 'Under the couch', min: 10, max: 50 },
        { name: 'In a vending machine', min: 20, max: 100 },
        { name: 'In a park bench', min: 5, max: 30 },
        { name: 'In an old car', min: 15, max: 75 },
        { name: 'In a dumpster', min: 5, max: 25 },
        { name: 'Under a tree', min: 10, max: 40 },
        { name: 'In a fountain', min: 20, max: 80 },
        { name: 'Behind a painting', min: 50, max: 200 },
      ];

      const location = locations[Math.floor(Math.random() * locations.length)];
      const found = Math.floor(Math.random() * (location.max - location.min + 1)) + location.min;

      await prisma.economy.upsert({
        where: { userId_guildId: { userId: interaction.user.id, guildId: interaction.guildId } },
        update: { wallet: { increment: found } },
        create: { userId: interaction.user.id, guildId: interaction.guildId, wallet: found, bank: 0 },
      });

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.economy} Search Results`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Location', value: location.name, inline: true },
          { name: 'Found', value: `${found} ${guild.currencySymbol || '💰'}`, inline: true },
        ])
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ content: '❌ Failed to search.', ephemeral: true });
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

      const locations = [
        { name: 'Under the couch', min: 10, max: 50 },
        { name: 'In a vending machine', min: 20, max: 100 },
        { name: 'In a park bench', min: 5, max: 30 },
        { name: 'In an old car', min: 15, max: 75 },
        { name: 'In a dumpster', min: 5, max: 25 },
        { name: 'Under a tree', min: 10, max: 40 },
        { name: 'In a fountain', min: 20, max: 80 },
        { name: 'Behind a painting', min: 50, max: 200 },
      ];

      const location = locations[Math.floor(Math.random() * locations.length)];
      const found = Math.floor(Math.random() * (location.max - location.min + 1)) + location.min;

      await prisma.economy.upsert({
        where: { userId_guildId: { userId: message.author.id, guildId: message.guildId } },
        update: { wallet: { increment: found } },
        create: { userId: message.author.id, guildId: message.guildId, wallet: found, bank: 0 },
      });

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.economy} Search Results`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Location', value: location.name, inline: true },
          { name: 'Found', value: `${found} ${guild.currencySymbol || '💰'}`, inline: true },
        ])
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      await message.reply('❌ Failed to search.');
    }
  }
}

export default SearchCommand;
