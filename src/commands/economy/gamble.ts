import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';
import { getPrismaClient } from '../../database/postgresql/client';

export class GambleCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'gamble',
      description: 'Gamble your money',
      category: 'economy',
      cooldown: 10,
      userPermissions: [],
      botPermissions: [],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['bet', 'wager'],
      examples: ['/gamble 100', 'p!gamble 100'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const amountInput = interaction.options.getString('amount');

    if (!amountInput) {
      await interaction.reply({ content: '❌ Please provide an amount.', ephemeral: true });
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

      const economy = await prisma.economy.findUnique({
        where: { userId_guildId: { userId: interaction.user.id, guildId: interaction.guildId } },
      });

      const wallet = economy?.wallet || 0;

      let amount: number;
      if (amountInput.toLowerCase() === 'all') {
        amount = wallet;
      } else {
        amount = parseInt(amountInput);
        if (isNaN(amount) || amount <= 0) {
          await interaction.reply({ content: '❌ Please provide a valid amount.', ephemeral: true });
          return;
        }
      }

      if (amount > wallet) {
        await interaction.reply({ content: '❌ You don\'t have enough money in your wallet.', ephemeral: true });
        return;
      }

      if (amount < 10) {
        await interaction.reply({ content: '❌ Minimum bet is 10.', ephemeral: true });
        return;
      }

      const winChance = Math.random();
      const winThreshold = 0.45;

      if (winChance < winThreshold) {
        const winnings = Math.floor(amount * 1.5);
        await prisma.economy.update({
          where: { userId_guildId: { userId: interaction.user.id, guildId: interaction.guildId } },
          update: { wallet: { increment: winnings } },
        });

        const embed = new EmbedBuilder()
          .setTitle(`${EMOJIS.economy} You Won!`)
          .setColor(COLORS.success)
          .addFields([
            { name: 'Bet', value: `${amount} ${guild.currencySymbol || '💰'}`, inline: true },
            { name: 'Won', value: `${winnings} ${guild.currencySymbol || '💰'}`, inline: true },
          ])
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });
      } else {
        await prisma.economy.update({
          where: { userId_guildId: { userId: interaction.user.id, guildId: interaction.guildId } },
          update: { wallet: { decrement: amount } },
        });

        const embed = new EmbedBuilder()
          .setTitle(`${EMOJIS.error} You Lost`)
          .setColor(COLORS.error)
          .addFields([
            { name: 'Lost', value: `${amount} ${guild.currencySymbol || '💰'}`, inline: true },
          ])
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });
      }
    } catch (error) {
      await interaction.reply({ content: '❌ Failed to gamble.', ephemeral: true });
    }
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const amountInput = args[0];

    if (!amountInput) {
      await message.reply('❌ Please provide an amount.');
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

      const economy = await prisma.economy.findUnique({
        where: { userId_guildId: { userId: message.author.id, guildId: message.guildId } },
      });

      const wallet = economy?.wallet || 0;

      let amount: number;
      if (amountInput.toLowerCase() === 'all') {
        amount = wallet;
      } else {
        amount = parseInt(amountInput);
        if (isNaN(amount) || amount <= 0) {
          await message.reply('❌ Please provide a valid amount.');
          return;
        }
      }

      if (amount > wallet) {
        await message.reply('❌ You don\'t have enough money in your wallet.');
        return;
      }

      if (amount < 10) {
        await message.reply('❌ Minimum bet is 10.');
        return;
      }

      const winChance = Math.random();
      const winThreshold = 0.45;

      if (winChance < winThreshold) {
        const winnings = Math.floor(amount * 1.5);
        await prisma.economy.update({
          where: { userId_guildId: { userId: message.author.id, guildId: message.guildId } },
          update: { wallet: { increment: winnings } },
        });

        const embed = new EmbedBuilder()
          .setTitle(`${EMOJIS.economy} You Won!`)
          .setColor(COLORS.success)
          .addFields([
            { name: 'Bet', value: `${amount} ${guild.currencySymbol || '💰'}`, inline: true },
            { name: 'Won', value: `${winnings} ${guild.currencySymbol || '💰'}`, inline: true },
          ])
          .setTimestamp();

        await message.reply({ embeds: [embed] });
      } else {
        await prisma.economy.update({
          where: { userId_guildId: { userId: message.author.id, guildId: message.guildId } },
          update: { wallet: { decrement: amount } },
        });

        const embed = new EmbedBuilder()
          .setTitle(`${EMOJIS.error} You Lost`)
          .setColor(COLORS.error)
          .addFields([
            { name: 'Lost', value: `${amount} ${guild.currencySymbol || '💰'}`, inline: true },
          ])
          .setTimestamp();

        await message.reply({ embeds: [embed] });
      }
    } catch (error) {
      await message.reply('❌ Failed to gamble.');
    }
  }
}

export default GambleCommand;
