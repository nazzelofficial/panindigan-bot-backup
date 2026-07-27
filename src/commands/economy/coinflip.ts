// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';

export class CoinflipCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'coinflip',
      description: 'Flip a coin and bet on the outcome',
      category: 'economy',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['flip', 'cf'],
      examples: ['/coinflip heads 50', '/coinflip tails 50', 'p!coinflip heads 50'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const choice = interaction.options.getString('choice');
    const amount = interaction.options.getInteger('amount');

    if (!choice || !['heads', 'tails'].includes(choice.toLowerCase())) {
      await interaction.reply({ content: '❌ Please choose heads or tails.', ephemeral: true });
      return;
    }

    if (amount === null || amount <= 0) {
      await interaction.reply({ content: '❌ Please provide a valid amount.', ephemeral: true });
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

      const result = Math.random() < 0.5 ? 'heads' : 'tails';
      const won = choice.toLowerCase() === result;
      const winnings = won ? amount : 0;

      await prisma.economy.update({
        where: { userId_guildId: { userId: interaction.user.id, guildId: interaction.guildId } },
        update: { wallet: { increment: winnings - amount } },
      });

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.economy} Coinflip`)
        .setColor(won ? COLORS.success : COLORS.error)
        .addFields([
          { name: 'Your Choice', value: choice, inline: true },
          { name: 'Result', value: result, inline: true },
          { name: 'Bet', value: `${amount} ${guild.currencySymbol || '💰'}`, inline: true },
          { name: won ? 'Won' : 'Lost', value: `${winnings} ${guild.currencySymbol || '💰'}`, inline: true },
        ])
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ content: '❌ Failed to flip coin.', ephemeral: true });
    }
  }

  public async executePrefix(message: Message, _args: string[]): Promise<void> {
    const choice = args[0]?.toLowerCase();
    const amount = parseInt(args[1]);

    if (!choice || !['heads', 'tails'].includes(choice)) {
      await message.reply('❌ Please choose heads or tails.');
      return;
    }

    if (isNaN(amount) || amount <= 0) {
      await message.reply('❌ Please provide a valid amount.');
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

      const result = Math.random() < 0.5 ? 'heads' : 'tails';
      const won = choice === result;
      const winnings = won ? amount : 0;

      await prisma.economy.update({
        where: { userId_guildId: { userId: message.author.id, guildId: message.guildId } },
        update: { wallet: { increment: winnings - amount } },
      });

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.economy} Coinflip`)
        .setColor(won ? COLORS.success : COLORS.error)
        .addFields([
          { name: 'Your Choice', value: choice, inline: true },
          { name: 'Result', value: result, inline: true },
          { name: 'Bet', value: `${amount} ${guild.currencySymbol || '💰'}`, inline: true },
          { name: won ? 'Won' : 'Lost', value: `${winnings} ${guild.currencySymbol || '💰'}`, inline: true },
        ])
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      await message.reply('❌ Failed to flip coin.');
    }
  }
}

export default CoinflipCommand;
