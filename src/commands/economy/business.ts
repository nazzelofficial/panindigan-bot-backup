import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';
import { getPrismaClient } from '../../database/postgresql/client';

export class BusinessCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'business',
      description: 'Manage your business',
      category: 'economy',
      cooldown: 30,
      userPermissions: [],
      botPermissions: [],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['company', 'mybusiness'],
      examples: ['/business', 'p!business'],
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
        const businessTypes = [
          { name: 'Small Shop', cost: 5000, income: 100 },
          { name: 'Restaurant', cost: 15000, income: 300 },
          { name: 'Tech Startup', cost: 50000, income: 1000 },
          { name: 'Manufacturing', cost: 100000, income: 2500 },
        ];

        const embed = new EmbedBuilder()
          .setTitle(`${EMOJIS.economy} Business Options`)
          .setColor(COLORS.info)
          .setDescription('You don\'t own a business. Start one:')
          .addFields(
            businessTypes.map((type) => ({
              name: type.name,
              value: `Cost: ${type.cost} ${guild.currencySymbol || '💰'} | Income: ${type.income} ${guild.currencySymbol || '💰'}/day`,
              inline: false,
            }))
          )
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });
        return;
      }

      const daysSinceLastClaim = Math.floor((Date.now() - business.lastClaim.getTime()) / (1000 * 60 * 60 * 24));
      const income = business.income * daysSinceLastClaim;

      if (income > 0) {
        await prisma.$transaction([
          prisma.business.update({
            where: { ownerId: interaction.user.id, guildId: interaction.guildId },
            update: { lastClaim: new Date() },
          }),
          prisma.economy.upsert({
            where: { userId_guildId: { userId: interaction.user.id, guildId: interaction.guildId } },
            update: { wallet: { increment: income } },
            create: { userId: interaction.user.id, guildId: interaction.guildId, wallet: income, bank: 0 },
          }),
        ]);

        const embed = new EmbedBuilder()
          .setTitle(`${EMOJIS.economy} Business Income`)
          .setColor(COLORS.success)
          .addFields([
            { name: 'Business', value: business.name, inline: true },
            { name: 'Days', value: daysSinceLastClaim.toString(), inline: true },
            { name: 'Income', value: `${income} ${guild.currencySymbol || '💰'}`, inline: true },
          ])
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });
      } else {
        const embed = new EmbedBuilder()
          .setTitle(`${EMOJIS.economy} Business Status`)
          .setColor(COLORS.info)
          .addFields([
            { name: 'Business', value: business.name, inline: true },
            { name: 'Daily Income', value: `${business.income} ${guild.currencySymbol || '💰'}`, inline: true },
            { name: 'Last Claim', value: business.lastClaim.toLocaleDateString(), inline: true },
          ])
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });
      }
    } catch (error) {
      await interaction.reply({ content: '❌ Failed to manage business.', ephemeral: true });
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
        const businessTypes = [
          { name: 'Small Shop', cost: 5000, income: 100 },
          { name: 'Restaurant', cost: 15000, income: 300 },
          { name: 'Tech Startup', cost: 50000, income: 1000 },
          { name: 'Manufacturing', cost: 100000, income: 2500 },
        ];

        const embed = new EmbedBuilder()
          .setTitle(`${EMOJIS.economy} Business Options`)
          .setColor(COLORS.info)
          .setDescription('You don\'t own a business. Start one:')
          .addFields(
            businessTypes.map((type) => ({
              name: type.name,
              value: `Cost: ${type.cost} ${guild.currencySymbol || '💰'} | Income: ${type.income} ${guild.currencySymbol || '💰'}/day`,
              inline: false,
            }))
          )
          .setTimestamp();

        await message.reply({ embeds: [embed] });
        return;
      }

      const daysSinceLastClaim = Math.floor((Date.now() - business.lastClaim.getTime()) / (1000 * 60 * 60 * 24));
      const income = business.income * daysSinceLastClaim;

      if (income > 0) {
        await prisma.$transaction([
          prisma.business.update({
            where: { ownerId: message.author.id, guildId: message.guildId },
            update: { lastClaim: new Date() },
          }),
          prisma.economy.upsert({
            where: { userId_guildId: { userId: message.author.id, guildId: message.guildId } },
            update: { wallet: { increment: income } },
            create: { userId: message.author.id, guildId: message.guildId, wallet: income, bank: 0 },
          }),
        ]);

        const embed = new EmbedBuilder()
          .setTitle(`${EMOJIS.economy} Business Income`)
          .setColor(COLORS.success)
          .addFields([
            { name: 'Business', value: business.name, inline: true },
            { name: 'Days', value: daysSinceLastClaim.toString(), inline: true },
            { name: 'Income', value: `${income} ${guild.currencySymbol || '💰'}`, inline: true },
          ])
          .setTimestamp();

        await message.reply({ embeds: [embed] });
      } else {
        const embed = new EmbedBuilder()
          .setTitle(`${EMOJIS.economy} Business Status`)
          .setColor(COLORS.info)
          .addFields([
            { name: 'Business', value: business.name, inline: true },
            { name: 'Daily Income', value: `${business.income} ${guild.currencySymbol || '💰'}`, inline: true },
            { name: 'Last Claim', value: business.lastClaim.toLocaleDateString(), inline: true },
          ])
          .setTimestamp();

        await message.reply({ embeds: [embed] });
      }
    } catch (error) {
      await message.reply('❌ Failed to manage business.');
    }
  }
}

export default BusinessCommand;
