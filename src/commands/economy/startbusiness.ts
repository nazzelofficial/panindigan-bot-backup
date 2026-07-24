import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';
import { getPrismaClient } from '../../database/postgresql/client';

export class StartBusinessCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'startbusiness',
      description: 'Start a business',
      category: 'economy',
      cooldown: 60,
      userPermissions: [],
      botPermissions: [],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['createbusiness', 'openbusiness'],
      examples: ['/startbusiness Small Shop', 'p!startbusiness Small Shop'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const businessType = interaction.options.getString('type');

    if (!businessType) {
      await interaction.reply({ content: '❌ Please provide a business type (Small Shop, Restaurant, Tech Startup, Manufacturing).', ephemeral: true });
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

      const existingBusiness = await prisma.business.findUnique({
        where: { ownerId: interaction.user.id, guildId: interaction.guildId },
      });

      if (existingBusiness) {
        await interaction.reply({ content: '❌ You already own a business.', ephemeral: true });
        return;
      }

      const businessTypes: Record<string, { cost: number; income: number }> = {
        'Small Shop': { cost: 5000, income: 100 },
        'Restaurant': { cost: 15000, income: 300 },
        'Tech Startup': { cost: 50000, income: 1000 },
        'Manufacturing': { cost: 100000, income: 2500 },
      };

      const type = businessTypes[businessType];

      if (!type) {
        await interaction.reply({ content: '❌ Invalid business type.', ephemeral: true });
        return;
      }

      const economy = await prisma.economy.findUnique({
        where: { userId_guildId: { userId: interaction.user.id, guildId: interaction.guildId } },
      });

      const wallet = economy?.wallet || 0;

      if (wallet < type.cost) {
        await interaction.reply({ content: `❌ You need ${type.cost} ${guild.currencySymbol || '💰'} to start this business.`, ephemeral: true });
        return;
      }

      await prisma.$transaction([
        prisma.economy.update({
          where: { userId_guildId: { userId: interaction.user.id, guildId: interaction.guildId } },
          update: { wallet: { decrement: type.cost } },
        }),
        prisma.business.create({
          data: {
            ownerId: interaction.user.id,
            guildId: interaction.guildId,
            name: businessType,
            income: type.income,
            lastClaim: new Date(),
          },
        }),
      ]);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.economy} Business Started`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Business', value: businessType, inline: true },
          { name: 'Cost', value: `${type.cost} ${guild.currencySymbol || '💰'}`, inline: true },
          { name: 'Daily Income', value: `${type.income} ${guild.currencySymbol || '💰'}`, inline: true },
        ])
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ content: '❌ Failed to start business.', ephemeral: true });
    }
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const businessType = args.join(' ');

    if (!businessType) {
      await message.reply('❌ Please provide a business type (Small Shop, Restaurant, Tech Startup, Manufacturing).');
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

      const existingBusiness = await prisma.business.findUnique({
        where: { ownerId: message.author.id, guildId: message.guildId },
      });

      if (existingBusiness) {
        await message.reply('❌ You already own a business.');
        return;
      }

      const businessTypes: Record<string, { cost: number; income: number }> = {
        'Small Shop': { cost: 5000, income: 100 },
        'Restaurant': { cost: 15000, income: 300 },
        'Tech Startup': { cost: 50000, income: 1000 },
        'Manufacturing': { cost: 100000, income: 2500 },
      };

      const type = businessTypes[businessType];

      if (!type) {
        await message.reply('❌ Invalid business type.');
        return;
      }

      const economy = await prisma.economy.findUnique({
        where: { userId_guildId: { userId: message.author.id, guildId: message.guildId } },
      });

      const wallet = economy?.wallet || 0;

      if (wallet < type.cost) {
        await message.reply(`❌ You need ${type.cost} ${guild.currencySymbol || '💰'} to start this business.`);
        return;
      }

      await prisma.$transaction([
        prisma.economy.update({
          where: { userId_guildId: { userId: message.author.id, guildId: message.guildId } },
          update: { wallet: { decrement: type.cost } },
        }),
        prisma.business.create({
          data: {
            ownerId: message.author.id,
            guildId: message.guildId,
            name: businessType,
            income: type.income,
            lastClaim: new Date(),
          },
        }),
      ]);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.economy} Business Started`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Business', value: businessType, inline: true },
          { name: 'Cost', value: `${type.cost} ${guild.currencySymbol || '💰'}`, inline: true },
          { name: 'Daily Income', value: `${type.income} ${guild.currencySymbol || '💰'}`, inline: true },
        ])
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      await message.reply('❌ Failed to start business.');
    }
  }
}

export default StartBusinessCommand;
