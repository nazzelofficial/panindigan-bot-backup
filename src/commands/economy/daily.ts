// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';

export class DailyCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'daily',
      description: 'Claim your daily reward',
      category: 'economy',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['dailies', 'dailyreward'],
      examples: ['/daily', 'p!daily'],
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
      const lastDaily = economy?.lastDaily ? new Date(economy.lastDaily) : new Date(0);
      const cooldown = 24 * 60 * 60 * 1000; // 24 hours

      if (now.getTime() - lastDaily.getTime() < cooldown) {
        const remaining = cooldown - (now.getTime() - lastDaily.getTime());
        const hours = Math.floor(remaining / (60 * 60 * 1000));
        const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
        await interaction.reply({ content: `❌ You can claim your daily reward in ${hours}h ${minutes}m.`, ephemeral: true });
        return;
      }

      const dailyAmount = 500;
      await prisma.economy.upsert({
        where: { userId_guildId: { userId: interaction.user.id, guildId: interaction.guildId } },
        update: {
          wallet: { increment: dailyAmount },
          lastDaily: now,
        },
        create: {
          userId: interaction.user.id,
          guildId: interaction.guildId,
          wallet: dailyAmount,
          bank: 0,
          lastDaily: now,
        },
      });

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.economy} Daily Reward Claimed`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Amount', value: `${dailyAmount.toLocaleString()} ${guild.currencySymbol || '💰'}`, inline: true },
          { name: 'Claimed by', value: interaction.user.tag, inline: true },
        ])
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ content: '❌ Failed to claim daily reward.', ephemeral: true });
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
      const lastDaily = economy?.lastDaily ? new Date(economy.lastDaily) : new Date(0);
      const cooldown = 24 * 60 * 60 * 1000; // 24 hours

      if (now.getTime() - lastDaily.getTime() < cooldown) {
        const remaining = cooldown - (now.getTime() - lastDaily.getTime());
        const hours = Math.floor(remaining / (60 * 60 * 1000));
        const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
        await message.reply(`❌ You can claim your daily reward in ${hours}h ${minutes}m.`);
        return;
      }

      const dailyAmount = 500;
      await prisma.economy.upsert({
        where: { userId_guildId: { userId: message.author.id, guildId: message.guildId } },
        update: {
          wallet: { increment: dailyAmount },
          lastDaily: now,
        },
        create: {
          userId: message.author.id,
          guildId: message.guildId,
          wallet: dailyAmount,
          bank: 0,
          lastDaily: now,
        },
      });

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.economy} Daily Reward Claimed`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Amount', value: `${dailyAmount.toLocaleString()} ${guild.currencySymbol || '💰'}`, inline: true },
          { name: 'Claimed by', value: message.author.tag, inline: true },
        ])
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      await message.reply('❌ Failed to claim daily reward.');
    }
  }
}

export default DailyCommand;
