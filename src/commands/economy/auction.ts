// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';

export class AuctionCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'auction',
      description: 'Start an auction for an item',
      category: 'economy',
      cooldown: 30,
      userPermissions: [],
      botPermissions: [],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['bid', 'auctionitem'],
      examples: ['/auction Dice 100', 'p!auction Dice 100'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const item = interaction.options.getString('item');
    const startingBid = interaction.options.getInteger('startingbid');

    if (!item) {
      await interaction.reply({ content: '❌ Please provide an item name.', ephemeral: true });
      return;
    }

    if (startingBid === null || startingBid <= 0) {
      await interaction.reply({ content: '❌ Please provide a valid starting bid.', ephemeral: true });
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

      if (wallet < startingBid) {
        await interaction.reply({ content: '❌ You don\'t have enough money to set this starting bid.', ephemeral: true });
        return;
      }

      const auction = await prisma.auction.create({
        data: {
          guildId: interaction.guildId,
          sellerId: interaction.user.id,
          item: item,
          startingBid: startingBid,
          currentBid: startingBid,
          currentBidderId: interaction.user.id,
          endsAt: new Date(Date.now() + 5 * 60 * 1000),
        },
      });

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.economy} Auction Started`)
        .setColor(COLORS.info)
        .addFields([
          { name: 'Item', value: item, inline: true },
          { name: 'Starting Bid', value: `${startingBid} ${guild.currencySymbol || '💰'}`, inline: true },
          { name: 'Seller', value: interaction.user.tag, inline: true },
          { name: 'Ends In', value: '5 minutes', inline: true },
        ])
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ content: '❌ Failed to start auction.', ephemeral: true });
    }
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const item = args[0];
    const startingBid = parseInt(args[1]);

    if (!item) {
      await message.reply('❌ Please provide an item name.');
      return;
    }

    if (isNaN(startingBid) || startingBid <= 0) {
      await message.reply('❌ Please provide a valid starting bid.');
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

      if (wallet < startingBid) {
        await message.reply('❌ You don\'t have enough money to set this starting bid.');
        return;
      }

      const auction = await prisma.auction.create({
        data: {
          guildId: message.guildId,
          sellerId: message.author.id,
          item: item,
          startingBid: startingBid,
          currentBid: startingBid,
          currentBidderId: message.author.id,
          endsAt: new Date(Date.now() + 5 * 60 * 1000),
        },
      });

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.economy} Auction Started`)
        .setColor(COLORS.info)
        .addFields([
          { name: 'Item', value: item, inline: true },
          { name: 'Starting Bid', value: `${startingBid} ${guild.currencySymbol || '💰'}`, inline: true },
          { name: 'Seller', value: message.author.tag, inline: true },
          { name: 'Ends In', value: '5 minutes', inline: true },
        ])
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      await message.reply('❌ Failed to start auction.');
    }
  }
}

export default AuctionCommand;
