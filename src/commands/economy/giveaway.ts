// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';

export class GiveawayCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'giveaway',
      description: 'Start a money giveaway',
      category: 'economy',
      cooldown: 60,
      userPermissions: [],
      botPermissions: [],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['gstart', 'startgiveaway'],
      examples: ['/giveaway 1000', 'p!giveaway 1000'],
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

      const economy = await prisma.economy.findUnique({
        where: { userId_guildId: { userId: interaction.user.id, guildId: interaction.guildId } },
      });

      const wallet = economy?.wallet || 0;

      if (wallet < amount) {
        await interaction.reply({ content: '❌ You don\'t have enough money in your wallet.', ephemeral: true });
        return;
      }

      await prisma.economy.update({
        where: { userId_guildId: { userId: interaction.user.id, guildId: interaction.guildId } },
        update: { wallet: { decrement: amount } },
      });

      const giveaway = await prisma.economyGiveaway.create({
        data: {
          guildId: interaction.guildId,
          hostId: interaction.user.id,
          prize: amount,
          endsAt: new Date(Date.now() + 5 * 60 * 1000),
        },
      });

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.economy} Money Giveaway`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Prize', value: `${amount} ${guild.currencySymbol || '💰'}`, inline: true },
          { name: 'Host', value: interaction.user.tag, inline: true },
          { name: 'Ends In', value: '5 minutes', inline: true },
          { name: 'How to Enter', value: 'React with 🎉 to enter!', inline: false },
        ])
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ content: '❌ Failed to start giveaway.', ephemeral: true });
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

      const economy = await prisma.economy.findUnique({
        where: { userId_guildId: { userId: message.author.id, guildId: message.guildId } },
      });

      const wallet = economy?.wallet || 0;

      if (wallet < amount) {
        await message.reply('❌ You don\'t have enough money in your wallet.');
        return;
      }

      await prisma.economy.update({
        where: { userId_guildId: { userId: message.author.id, guildId: message.guildId } },
        update: { wallet: { decrement: amount } },
      });

      const giveaway = await prisma.economyGiveaway.create({
        data: {
          guildId: message.guildId,
          hostId: message.author.id,
          prize: amount,
          endsAt: new Date(Date.now() + 5 * 60 * 1000),
        },
      });

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.economy} Money Giveaway`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Prize', value: `${amount} ${guild.currencySymbol || '💰'}`, inline: true },
          { name: 'Host', value: message.author.tag, inline: true },
          { name: 'Ends In', value: '5 minutes', inline: true },
          { name: 'How to Enter', value: 'React with 🎉 to enter!', inline: false },
        ])
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      await message.reply('❌ Failed to start giveaway.');
    }
  }
}

export default GiveawayCommand;
