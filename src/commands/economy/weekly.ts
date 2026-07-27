// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';

export class WeeklyCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'weekly',
      description: 'Claim your weekly reward',
      category: 'economy',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['weeklies', 'weeklyreward'],
      examples: ['/weekly', 'p!weekly'],
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
      const lastWeekly = economy?.lastWeekly ? new Date(economy.lastWeekly) : new Date(0);
      const cooldown = 7 * 24 * 60 * 60 * 1000; // 7 days

      if (now.getTime() - lastWeekly.getTime() < cooldown) {
        const remaining = cooldown - (now.getTime() - lastWeekly.getTime());
        const days = Math.floor(remaining / (24 * 60 * 60 * 1000));
        const hours = Math.floor((remaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
        await interaction.reply({ content: `❌ You can claim your weekly reward in ${days}d ${hours}h.`, ephemeral: true });
        return;
      }

      const weeklyAmount = 3000;
      await prisma.economy.upsert({
        where: { userId_guildId: { userId: interaction.user.id, guildId: interaction.guildId } },
        update: {
          wallet: { increment: weeklyAmount },
          lastWeekly: now,
        },
        create: {
          userId: interaction.user.id,
          guildId: interaction.guildId,
          wallet: weeklyAmount,
          bank: 0,
          lastWeekly: now,
        },
      });

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.economy} Weekly Reward Claimed`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Amount', value: `${weeklyAmount.toLocaleString()} ${guild.currencySymbol || '💰'}`, inline: true },
          { name: 'Claimed by', value: interaction.user.tag, inline: true },
        ])
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ content: '❌ Failed to claim weekly reward.', ephemeral: true });
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
      const lastWeekly = economy?.lastWeekly ? new Date(economy.lastWeekly) : new Date(0);
      const cooldown = 7 * 24 * 60 * 60 * 1000; // 7 days

      if (now.getTime() - lastWeekly.getTime() < cooldown) {
        const remaining = cooldown - (now.getTime() - lastWeekly.getTime());
        const days = Math.floor(remaining / (24 * 60 * 60 * 1000));
        const hours = Math.floor((remaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
        await message.reply(`❌ You can claim your weekly reward in ${days}d ${hours}h.`);
        return;
      }

      const weeklyAmount = 3000;
      await prisma.economy.upsert({
        where: { userId_guildId: { userId: message.author.id, guildId: message.guildId } },
        update: {
          wallet: { increment: weeklyAmount },
          lastWeekly: now,
        },
        create: {
          userId: message.author.id,
          guildId: message.guildId,
          wallet: weeklyAmount,
          bank: 0,
          lastWeekly: now,
        },
      });

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.economy} Weekly Reward Claimed`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Amount', value: `${weeklyAmount.toLocaleString()} ${guild.currencySymbol || '💰'}`, inline: true },
          { name: 'Claimed by', value: message.author.tag, inline: true },
        ])
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      await message.reply('❌ Failed to claim weekly reward.');
    }
  }
}

export default WeeklyCommand;
