// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';

export class DiceCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'dice',
      description: 'Roll dice and bet on the outcome',
      category: 'economy',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['roll', 'diceroll'],
      examples: ['/dice 50 high', '/dice 50 low', 'p!dice 50 high'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const amount = interaction.options.getInteger('amount');
    const choice = interaction.options.getString('choice');

    if (amount === null || amount <= 0) {
      await interaction.reply({ content: '❌ Please provide a valid amount.', ephemeral: true });
      return;
    }

    if (!choice || !['high', 'low'].includes(choice.toLowerCase())) {
      await interaction.reply({ content: '❌ Please choose high or low.', ephemeral: true });
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

      if (amount > wallet) {
        await interaction.reply({ content: '❌ You don\'t have enough money in your wallet.', ephemeral: true });
        return;
      }

      if (amount < 10) {
        await interaction.reply({ content: '❌ Minimum bet is 10.', ephemeral: true });
        return;
      }

      const dice1 = Math.floor(Math.random() * 6) + 1;
      const dice2 = Math.floor(Math.random() * 6) + 1;
      const total = dice1 + dice2;

      const isHigh = total >= 7;
      const won = (choice.toLowerCase() === 'high' && isHigh) || (choice.toLowerCase() === 'low' && !isHigh);
      const winnings = won ? amount : 0;

      await prisma.economy.update({
        where: { userId_guildId: { userId: interaction.user.id, guildId: interaction.guildId } },
        update: { wallet: { increment: winnings - amount } },
      });

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.economy} Dice Roll`)
        .setColor(won ? COLORS.success : COLORS.error)
        .addFields([
          { name: 'Roll', value: `🎲 ${dice1} + 🎲 ${dice2} = ${total}`, inline: false },
          { name: 'Your Choice', value: choice, inline: true },
          { name: 'Result', value: isHigh ? 'High' : 'Low', inline: true },
          { name: 'Bet', value: `${amount} ${guild.currencySymbol || '💰'}`, inline: true },
          { name: won ? 'Won' : 'Lost', value: `${winnings} ${guild.currencySymbol || '💰'}`, inline: true },
        ])
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ content: '❌ Failed to roll dice.', ephemeral: true });
    }
  }

  public async executePrefix(message: Message, _args: string[]): Promise<void> {
    const amount = parseInt(args[0]);
    const choice = args[1]?.toLowerCase();

    if (isNaN(amount) || amount <= 0) {
      await message.reply('❌ Please provide a valid amount.');
      return;
    }

    if (!choice || !['high', 'low'].includes(choice)) {
      await message.reply('❌ Please choose high or low.');
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

      if (amount > wallet) {
        await message.reply('❌ You don\'t have enough money in your wallet.');
        return;
      }

      if (amount < 10) {
        await message.reply('❌ Minimum bet is 10.');
        return;
      }

      const dice1 = Math.floor(Math.random() * 6) + 1;
      const dice2 = Math.floor(Math.random() * 6) + 1;
      const total = dice1 + dice2;

      const isHigh = total >= 7;
      const won = (choice === 'high' && isHigh) || (choice === 'low' && !isHigh);
      const winnings = won ? amount : 0;

      await prisma.economy.update({
        where: { userId_guildId: { userId: message.author.id, guildId: message.guildId } },
        update: { wallet: { increment: winnings - amount } },
      });

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.economy} Dice Roll`)
        .setColor(won ? COLORS.success : COLORS.error)
        .addFields([
          { name: 'Roll', value: `🎲 ${dice1} + 🎲 ${dice2} = ${total}`, inline: false },
          { name: 'Your Choice', value: choice, inline: true },
          { name: 'Result', value: isHigh ? 'High' : 'Low', inline: true },
          { name: 'Bet', value: `${amount} ${guild.currencySymbol || '💰'}`, inline: true },
          { name: won ? 'Won' : 'Lost', value: `${winnings} ${guild.currencySymbol || '💰'}`, inline: true },
        ])
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      await message.reply('❌ Failed to roll dice.');
    }
  }
}

export default DiceCommand;
