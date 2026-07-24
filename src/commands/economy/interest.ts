import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';
import { getPrismaClient } from '../../database/postgresql/client';

export class InterestCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'interest',
      description: 'Collect interest on your bank balance (Weekly)',
      category: 'economy',
      cooldown: 604800,
      userPermissions: [],
      botPermissions: [],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['collectinterest', 'bankinterest'],
      examples: ['/interest', 'p!interest'],
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

      const economy = await prisma.economy.findUnique({
        where: { userId_guildId: { userId: interaction.user.id, guildId: interaction.guildId } },
      });

      const bank = economy?.bank || 0;

      if (bank <= 0) {
        await interaction.reply({ content: '❌ You need money in your bank to collect interest.', ephemeral: true });
        return;
      }

      const now = new Date();
      const lastInterest = economy?.lastInterest || new Date(0);
      const cooldown = 7 * 24 * 60 * 60 * 1000;

      if (now.getTime() - lastInterest.getTime() < cooldown) {
        const remaining = Math.ceil((cooldown - (now.getTime() - lastInterest.getTime())) / (1000 * 60 * 60 * 24));
        await interaction.reply({ content: `❌ You can collect interest again in ${remaining} days.`, ephemeral: true });
        return;
      }

      const interestRate = 0.05;
      const interestAmount = Math.floor(bank * interestRate);

      await prisma.economy.update({
        where: { userId_guildId: { userId: interaction.user.id, guildId: interaction.guildId } },
        update: {
          bank: { increment: interestAmount },
          lastInterest: now,
        },
      });

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.economy} Interest Collected`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Interest Rate', value: '5%', inline: true },
          { name: 'Interest Earned', value: `${interestAmount.toLocaleString()} ${guild.currencySymbol || '💰'}`, inline: true },
          { name: 'New Bank Balance', value: `${(bank + interestAmount).toLocaleString()} ${guild.currencySymbol || '💰'}`, inline: true },
        ])
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ content: '❌ Failed to collect interest.', ephemeral: true });
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

      const economy = await prisma.economy.findUnique({
        where: { userId_guildId: { userId: message.author.id, guildId: message.guildId } },
      });

      const bank = economy?.bank || 0;

      if (bank <= 0) {
        await message.reply('❌ You need money in your bank to collect interest.');
        return;
      }

      const now = new Date();
      const lastInterest = economy?.lastInterest || new Date(0);
      const cooldown = 7 * 24 * 60 * 60 * 1000;

      if (now.getTime() - lastInterest.getTime() < cooldown) {
        const remaining = Math.ceil((cooldown - (now.getTime() - lastInterest.getTime())) / (1000 * 60 * 60 * 24));
        await message.reply(`❌ You can collect interest again in ${remaining} days.`);
        return;
      }

      const interestRate = 0.05;
      const interestAmount = Math.floor(bank * interestRate);

      await prisma.economy.update({
        where: { userId_guildId: { userId: message.author.id, guildId: message.guildId } },
        update: {
          bank: { increment: interestAmount },
          lastInterest: now,
        },
      });

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.economy} Interest Collected`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Interest Rate', value: '5%', inline: true },
          { name: 'Interest Earned', value: `${interestAmount.toLocaleString()} ${guild.currencySymbol || '💰'}`, inline: true },
          { name: 'New Bank Balance', value: `${(bank + interestAmount).toLocaleString()} ${guild.currencySymbol || '💰'}`, inline: true },
        ])
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      await message.reply('❌ Failed to collect interest.');
    }
  }
}

export default InterestCommand;
