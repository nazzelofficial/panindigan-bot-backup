// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';

export class WorkCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'work',
      description: 'Work to earn money',
      category: 'economy',
      cooldown: 60,
      userPermissions: [],
      botPermissions: [],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['job', 'earn'],
      examples: ['/work', 'p!work'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guildId || !interaction.user) return;

    try {
      const prisma = getPrismaClient();
      const guild = await prisma.guild.upsert({
        where: { guildId: interaction.guildId },
        update: {},
        create: { guildId: interaction.guildId },
      });

      const jobs = [
        { name: 'Developer', min: 200, max: 500 },
        { name: 'Teacher', min: 150, max: 400 },
        { name: 'Doctor', min: 300, max: 600 },
        { name: 'Cashier', min: 100, max: 250 },
        { name: 'Chef', min: 180, max: 450 },
        { name: 'Artist', min: 120, max: 350 },
        { name: 'Writer', min: 140, max: 380 },
        { name: 'Engineer', min: 250, max: 550 },
      ];

      const job = jobs[Math.floor(Math.random() * jobs.length)];
      const earnings = Math.floor(Math.random() * (job.max - job.min + 1)) + job.min;

      await prisma.economy.upsert({
        where: { userId_guildId: { userId: interaction.user.id, guildId: interaction.guildId } },
        update: { wallet: { increment: earnings } },
        create: { userId: interaction.user.id, guildId: interaction.guildId, wallet: earnings, bank: 0 },
      });

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.economy} Work Completed`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Job', value: job.name, inline: true },
          { name: 'Earnings', value: `${earnings.toLocaleString()} ${guild.currencySymbol || '💰'}`, inline: true },
        ])
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ content: '❌ Failed to work.', ephemeral: true });
    }
  }

  public async executePrefix(message: Message): Promise<void> {
    if (!message.guildId || !message.author) return;

    try {
      const prisma = getPrismaClient();
      const guild = await prisma.guild.upsert({
        where: { guildId: message.guildId },
        update: {},
        create: { guildId: message.guildId },
      });

      const jobs = [
        { name: 'Developer', min: 200, max: 500 },
        { name: 'Teacher', min: 150, max: 400 },
        { name: 'Doctor', min: 300, max: 600 },
        { name: 'Cashier', min: 100, max: 250 },
        { name: 'Chef', min: 180, max: 450 },
        { name: 'Artist', min: 120, max: 350 },
        { name: 'Writer', min: 140, max: 380 },
        { name: 'Engineer', min: 250, max: 550 },
      ];

      const job = jobs[Math.floor(Math.random() * jobs.length)];
      const earnings = Math.floor(Math.random() * (job.max - job.min + 1)) + job.min;

      await prisma.economy.upsert({
        where: { userId_guildId: { userId: message.author.id, guildId: message.guildId } },
        update: { wallet: { increment: earnings } },
        create: { userId: message.author.id, guildId: message.guildId, wallet: earnings, bank: 0 },
      });

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.economy} Work Completed`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Job', value: job.name, inline: true },
          { name: 'Earnings', value: `${earnings.toLocaleString()} ${guild.currencySymbol || '💰'}`, inline: true },
        ])
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      await message.reply('❌ Failed to work.');
    }
  }
}

export default WorkCommand;
