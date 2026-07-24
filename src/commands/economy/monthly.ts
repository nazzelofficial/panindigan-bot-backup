import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';
import { getPrismaClient } from '../../database/postgresql/client';

export class MonthlyCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'monthly',
      description: 'Claim your monthly reward',
      category: 'economy',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['monthlies', 'monthlyreward'],
      examples: ['/monthly', 'p!monthly'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guildId || !interaction.user) return;

    try {
      const prisma = getPrismaClient();
      const user = await prisma.user.upsert({
        where: { userId: interaction.user.id },
        update: {},
        create: { userId: interaction.user.id },
      });

      const guild = await prisma.guild.upsert({
        where: { guildId: interaction.guildId },
        update: {},
        create: { guildId: interaction.guildId },
      });

      const economy = await prisma.economy.findUnique({
        where: { userId_guildId: { userId: interaction.user.id, guildId: interaction.guildId } },
      });

      const now = new Date();
      const lastMonthly = economy?.lastMonthly ? new Date(economy.lastMonthly) : new Date(0);
      const cooldown = 30 * 24 * 60 * 60 * 1000; // 30 days

      if (now.getTime() - lastMonthly.getTime() < cooldown) {
        const remaining = cooldown - (now.getTime() - lastMonthly.getTime());
        const days = Math.floor(remaining / (24 * 60 * 60 * 1000));
        await interaction.reply({ content: `❌ You can claim your monthly reward in ${days} days.`, ephemeral: true });
        return;
      }

      const monthlyAmount = 10000;
      await prisma.economy.upsert({
        where: { userId_guildId: { userId: interaction.user.id, guildId: interaction.guildId } },
        update: {
          wallet: { increment: monthlyAmount },
          lastMonthly: now,
        },
        create: {
          userId: interaction.user.id,
          guildId: interaction.guildId,
          wallet: monthlyAmount,
          bank: 0,
          lastMonthly: now,
        },
      });

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.economy} Monthly Reward Claimed`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Amount', value: `${monthlyAmount.toLocaleString()} ${guild.currencySymbol || '💰'}`, inline: true },
          { name: 'Claimed by', value: interaction.user.tag, inline: true },
        ])
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ content: '❌ Failed to claim monthly reward.', ephemeral: true });
    }
  }

  public async executePrefix(message: Message): Promise<void> {
    if (!message.guildId || !message.author) return;

    try {
      const prisma = getPrismaClient();
      const user = await prisma.user.upsert({
        where: { userId: message.author.id },
        update: {},
        create: { userId: message.author.id },
      });

      const guild = await prisma.guild.upsert({
        where: { guildId: message.guildId },
        update: {},
        create: { guildId: message.guildId },
      });

      const economy = await prisma.economy.findUnique({
        where: { userId_guildId: { userId: message.author.id, guildId: message.guildId } },
      });

      const now = new Date();
      const lastMonthly = economy?.lastMonthly ? new Date(economy.lastMonthly) : new Date(0);
      const cooldown = 30 * 24 * 60 * 60 * 1000; // 30 days

      if (now.getTime() - lastMonthly.getTime() < cooldown) {
        const remaining = cooldown - (now.getTime() - lastMonthly.getTime());
        const days = Math.floor(remaining / (24 * 60 * 60 * 1000));
        await message.reply(`❌ You can claim your monthly reward in ${days} days.`);
        return;
      }

      const monthlyAmount = 10000;
      await prisma.economy.upsert({
        where: { userId_guildId: { userId: message.author.id, guildId: message.guildId } },
        update: {
          wallet: { increment: monthlyAmount },
          lastMonthly: now,
        },
        create: {
          userId: message.author.id,
          guildId: message.guildId,
          wallet: monthlyAmount,
          bank: 0,
          lastMonthly: now,
        },
      });

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.economy} Monthly Reward Claimed`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Amount', value: `${monthlyAmount.toLocaleString()} ${guild.currencySymbol || '💰'}`, inline: true },
          { name: 'Claimed by', value: message.author.tag, inline: true },
        ])
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      await message.reply('❌ Failed to claim monthly reward.');
    }
  }
}

export default MonthlyCommand;
