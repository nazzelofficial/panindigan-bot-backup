// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';

export class RouletteCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'roulette',
      description: 'Play roulette',
      category: 'economy',
      cooldown: 10,
      userPermissions: [],
      botPermissions: [],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['spinwheel'],
      examples: ['/roulette 50 red', '/roulette 50 black', '/roulette 50 7', 'p!roulette 50 red'],
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

    if (!choice) {
      await interaction.reply({ content: '❌ Please provide a choice (red, black, or a number 0-36).', ephemeral: true });
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

      const result = Math.floor(Math.random() * 37);
      const isRed = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36].includes(result);
      const isBlack = [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35].includes(result);

      let won = false;
      let multiplier = 0;

      const choiceLower = choice.toLowerCase();

      if (choiceLower === 'red' && isRed) {
        won = true;
        multiplier = 2;
      } else if (choiceLower === 'black' && isBlack) {
        won = true;
        multiplier = 2;
      } else if (choiceLower === 'green' && result === 0) {
        won = true;
        multiplier = 35;
      } else if (!isNaN(parseInt(choice)) && parseInt(choice) === result) {
        won = true;
        multiplier = 35;
      }

      const winnings = won ? amount * multiplier : 0;

      await prisma.economy.update({
        where: { userId_guildId: { userId: interaction.user.id, guildId: interaction.guildId } },
        update: { wallet: { increment: winnings - amount } },
      });

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.economy} Roulette`)
        .setColor(won ? COLORS.success : COLORS.error)
        .addFields([
          { name: 'Result', value: result === 0 ? '🟢 0' : isRed ? `🔴 ${result}` : `⚫ ${result}`, inline: false },
          { name: 'Your Choice', value: choice, inline: true },
          { name: 'Bet', value: `${amount} ${guild.currencySymbol || '💰'}`, inline: true },
          { name: won ? 'Won' : 'Lost', value: `${winnings} ${guild.currencySymbol || '💰'}`, inline: true },
        ])
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ content: '❌ Failed to play roulette.', ephemeral: true });
    }
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const amount = parseInt(args[0]);
    const choice = args[1];

    if (isNaN(amount) || amount <= 0) {
      await message.reply('❌ Please provide a valid amount.');
      return;
    }

    if (!choice) {
      await message.reply('❌ Please provide a choice (red, black, or a number 0-36).');
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

      const result = Math.floor(Math.random() * 37);
      const isRed = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36].includes(result);
      const isBlack = [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35].includes(result);

      let won = false;
      let multiplier = 0;

      const choiceLower = choice.toLowerCase();

      if (choiceLower === 'red' && isRed) {
        won = true;
        multiplier = 2;
      } else if (choiceLower === 'black' && isBlack) {
        won = true;
        multiplier = 2;
      } else if (choiceLower === 'green' && result === 0) {
        won = true;
        multiplier = 35;
      } else if (!isNaN(parseInt(choice)) && parseInt(choice) === result) {
        won = true;
        multiplier = 35;
      }

      const winnings = won ? amount * multiplier : 0;

      await prisma.economy.update({
        where: { userId_guildId: { userId: message.author.id, guildId: message.guildId } },
        update: { wallet: { increment: winnings - amount } },
      });

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.economy} Roulette`)
        .setColor(won ? COLORS.success : COLORS.error)
        .addFields([
          { name: 'Result', value: result === 0 ? '🟢 0' : isRed ? `🔴 ${result}` : `⚫ ${result}`, inline: false },
          { name: 'Your Choice', value: choice, inline: true },
          { name: 'Bet', value: `${amount} ${guild.currencySymbol || '💰'}`, inline: true },
          { name: won ? 'Won' : 'Lost', value: `${winnings} ${guild.currencySymbol || '💰'}`, inline: true },
        ])
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      await message.reply('❌ Failed to play roulette.');
    }
  }
}

export default RouletteCommand;
