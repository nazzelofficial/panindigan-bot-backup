// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';

export class ConvertCurrencyCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'convertcurrency',
      description: 'Convert wallet to bank or vice versa',
      category: 'economy',
      cooldown: 10,
      userPermissions: [],
      botPermissions: [],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['convert', 'swap'],
      examples: ['/convertcurrency wallet 1000', 'p!convertcurrency wallet 1000'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const from = interaction.options.getString('from');
    const amount = interaction.options.getInteger('amount');

    if (!from || !['wallet', 'bank'].includes(from)) {
      await interaction.reply({ content: '❌ Please specify "wallet" or "bank".', ephemeral: true });
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
      const bank = economy?.bank || 0;

      if (from === 'wallet') {
        if (wallet < amount) {
          await interaction.reply({ content: '❌ You don\'t have enough in your wallet.', ephemeral: true });
          return;
        }

        await prisma.economy.update({
          where: { userId_guildId: { userId: interaction.user.id, guildId: interaction.guildId } },
          update: { wallet: { decrement: amount }, bank: { increment: amount } },
        });

        const embed = new EmbedBuilder()
          .setTitle(`${EMOJIS.economy} Currency Converted`)
          .setColor(COLORS.success)
          .addFields([
            { name: 'From', value: 'Wallet', inline: true },
            { name: 'To', value: 'Bank', inline: true },
            { name: 'Amount', value: `${amount} ${guild.currencySymbol || '💰'}`, inline: true },
          ])
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });
      } else {
        if (bank < amount) {
          await interaction.reply({ content: '❌ You don\'t have enough in your bank.', ephemeral: true });
          return;
        }

        await prisma.economy.update({
          where: { userId_guildId: { userId: interaction.user.id, guildId: interaction.guildId } },
          update: { bank: { decrement: amount }, wallet: { increment: amount } },
        });

        const embed = new EmbedBuilder()
          .setTitle(`${EMOJIS.economy} Currency Converted`)
          .setColor(COLORS.success)
          .addFields([
            { name: 'From', value: 'Bank', inline: true },
            { name: 'To', value: 'Wallet', inline: true },
            { name: 'Amount', value: `${amount} ${guild.currencySymbol || '💰'}`, inline: true },
          ])
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });
      }
    } catch (error) {
      await interaction.reply({ content: '❌ Failed to convert currency.', ephemeral: true });
    }
  }

  public async executePrefix(message: Message, _args: string[]): Promise<void> {
    const from = args[0];
    const amount = parseInt(args[1]);

    if (!from || !['wallet', 'bank'].includes(from)) {
      await message.reply('❌ Please specify "wallet" or "bank".');
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
      const bank = economy?.bank || 0;

      if (from === 'wallet') {
        if (wallet < amount) {
          await message.reply('❌ You don\'t have enough in your wallet.');
          return;
        }

        await prisma.economy.update({
          where: { userId_guildId: { userId: message.author.id, guildId: message.guildId } },
          update: { wallet: { decrement: amount }, bank: { increment: amount } },
        });

        const embed = new EmbedBuilder()
          .setTitle(`${EMOJIS.economy} Currency Converted`)
          .setColor(COLORS.success)
          .addFields([
            { name: 'From', value: 'Wallet', inline: true },
            { name: 'To', value: 'Bank', inline: true },
            { name: 'Amount', value: `${amount} ${guild.currencySymbol || '💰'}`, inline: true },
          ])
          .setTimestamp();

        await message.reply({ embeds: [embed] });
      } else {
        if (bank < amount) {
          await message.reply('❌ You don\'t have enough in your bank.');
          return;
        }

        await prisma.economy.update({
          where: { userId_guildId: { userId: message.author.id, guildId: message.guildId } },
          update: { bank: { decrement: amount }, wallet: { increment: amount } },
        });

        const embed = new EmbedBuilder()
          .setTitle(`${EMOJIS.economy} Currency Converted`)
          .setColor(COLORS.success)
          .addFields([
            { name: 'From', value: 'Bank', inline: true },
            { name: 'To', value: 'Wallet', inline: true },
            { name: 'Amount', value: `${amount} ${guild.currencySymbol || '💰'}`, inline: true },
          ])
          .setTimestamp();

        await message.reply({ embeds: [embed] });
      }
    } catch (error) {
      await message.reply('❌ Failed to convert currency.');
    }
  }
}

export default ConvertCurrencyCommand;
