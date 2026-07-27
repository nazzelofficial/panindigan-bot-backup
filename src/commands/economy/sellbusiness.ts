// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';

export class SellBusinessCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'sellbusiness',
      description: 'Sell your business',
      category: 'economy',
      cooldown: 60,
      userPermissions: [],
      botPermissions: [],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['closebusiness', 'sellcompany'],
      examples: ['/sellbusiness', 'p!sellbusiness'],
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

      const business = await prisma.business.findUnique({
        where: { ownerId: interaction.user.id, guildId: interaction.guildId },
      });

      if (!business) {
        await interaction.reply({ content: '❌ You don\'t own a business.', ephemeral: true });
        return;
      }

      const businessTypes: Record<string, { cost: number; income: number }> = {
        'Small Shop': { cost: 5000, income: 100 },
        'Restaurant': { cost: 15000, income: 300 },
        'Tech Startup': { cost: 50000, income: 1000 },
        'Manufacturing': { cost: 100000, income: 2500 },
      };

      const type = businessTypes[business.name];
      const sellValue = Math.floor(type.cost * 0.6);

      await prisma.$transaction([
        prisma.business.delete({
          where: { ownerId: interaction.user.id, guildId: interaction.guildId },
        }),
        prisma.economy.upsert({
          where: { userId_guildId: { userId: interaction.user.id, guildId: interaction.guildId } },
          update: { wallet: { increment: sellValue } },
          create: { userId: interaction.user.id, guildId: interaction.guildId, wallet: sellValue, bank: 0 },
        }),
      ]);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.economy} Business Sold`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Business', value: business.name, inline: true },
          { name: 'Sell Value', value: `${sellValue} ${guild.currencySymbol || '💰'}`, inline: true },
          { name: 'Original Cost', value: `${type.cost} ${guild.currencySymbol || '💰'}`, inline: true },
        ])
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ content: '❌ Failed to sell business.', ephemeral: true });
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

      const business = await prisma.business.findUnique({
        where: { ownerId: message.author.id, guildId: message.guildId },
      });

      if (!business) {
        await message.reply('❌ You don\'t own a business.');
        return;
      }

      const businessTypes: Record<string, { cost: number; income: number }> = {
        'Small Shop': { cost: 5000, income: 100 },
        'Restaurant': { cost: 15000, income: 300 },
        'Tech Startup': { cost: 50000, income: 1000 },
        'Manufacturing': { cost: 100000, income: 2500 },
      };

      const type = businessTypes[business.name];
      const sellValue = Math.floor(type.cost * 0.6);

      await prisma.$transaction([
        prisma.business.delete({
          where: { ownerId: message.author.id, guildId: message.guildId },
        }),
        prisma.economy.upsert({
          where: { userId_guildId: { userId: message.author.id, guildId: message.guildId } },
          update: { wallet: { increment: sellValue } },
          create: { userId: message.author.id, guildId: message.guildId, wallet: sellValue, bank: 0 },
        }),
      ]);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.economy} Business Sold`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Business', value: business.name, inline: true },
          { name: 'Sell Value', value: `${sellValue} ${guild.currencySymbol || '💰'}`, inline: true },
          { name: 'Original Cost', value: `${type.cost} ${guild.currencySymbol || '💰'}`, inline: true },
        ])
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      await message.reply('❌ Failed to sell business.');
    }
  }
}

export default SellBusinessCommand;
