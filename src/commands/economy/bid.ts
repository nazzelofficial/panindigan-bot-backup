// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';

export class BidCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'bid',
      description: 'Bid on an active auction',
      category: 'economy',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['placebid'],
      examples: ['/bid 150', 'p!bid 150'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const amount = interaction.options.getInteger('amount');

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

      const auction = await prisma.auction.findFirst({
        where: { guildId: interaction.guildId, active: true },
      });

      if (!auction) {
        await interaction.reply({ content: '❌ No active auction found.', ephemeral: true });
        return;
      }

      if (auction.sellerId === interaction.user.id) {
        await interaction.reply({ content: '❌ You cannot bid on your own auction.', ephemeral: true });
        return;
      }

      if (amount <= auction.currentBid) {
        await interaction.reply({ content: `❌ Bid must be higher than current bid (${auction.currentBid}).`, ephemeral: true });
        return;
      }

      const economy = await prisma.economy.findUnique({
        where: { userId_guildId: { userId: interaction.user.id, guildId: interaction.guildId } },
      });

      const wallet = economy?.wallet || 0;

      if (wallet < amount) {
        await interaction.reply({ content: '❌ You don\'t have enough money.', ephemeral: true });
        return;
      }

      await prisma.auction.update({
        where: { id: auction.id },
        data: {
          currentBid: amount,
          currentBidderId: interaction.user.id,
        },
      });

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.economy} Bid Placed`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Item', value: auction.item, inline: true },
          { name: 'Your Bid', value: `${amount} ${guild.currencySymbol || '💰'}`, inline: true },
          { name: 'Previous Bid', value: `${auction.currentBid} ${guild.currencySymbol || '💰'}`, inline: true },
        ])
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ content: '❌ Failed to place bid.', ephemeral: true });
    }
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const amount = parseInt(args[0]);

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

      const auction = await prisma.auction.findFirst({
        where: { guildId: message.guildId, active: true },
      });

      if (!auction) {
        await message.reply('❌ No active auction found.');
        return;
      }

      if (auction.sellerId === message.author.id) {
        await message.reply('❌ You cannot bid on your own auction.');
        return;
      }

      if (amount <= auction.currentBid) {
        await message.reply(`❌ Bid must be higher than current bid (${auction.currentBid}).`);
        return;
      }

      const economy = await prisma.economy.findUnique({
        where: { userId_guildId: { userId: message.author.id, guildId: message.guildId } },
      });

      const wallet = economy?.wallet || 0;

      if (wallet < amount) {
        await message.reply('❌ You don\'t have enough money.');
        return;
      }

      await prisma.auction.update({
        where: { id: auction.id },
        data: {
          currentBid: amount,
          currentBidderId: message.author.id,
        },
      });

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.economy} Bid Placed`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Item', value: auction.item, inline: true },
          { name: 'Your Bid', value: `${amount} ${guild.currencySymbol || '💰'}`, inline: true },
          { name: 'Previous Bid', value: `${auction.currentBid} ${guild.currencySymbol || '💰'}`, inline: true },
        ])
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      await message.reply('❌ Failed to place bid.');
    }
  }
}

export default BidCommand;
