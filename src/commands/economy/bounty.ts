// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';

export class BountyCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'bounty',
      description: 'Place a bounty on a user',
      category: 'economy',
      cooldown: 60,
      userPermissions: [],
      botPermissions: [],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['placebounty', 'hit'],
      examples: ['/bounty @user 1000', 'p!bounty @user 1000'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const targetUser = interaction.options.getUser('user');
    const amount = interaction.options.getInteger('amount');

    if (!targetUser || targetUser.id === interaction.user.id) {
      await interaction.reply({ content: '❌ You cannot place a bounty on yourself.', ephemeral: true });
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

      if (wallet < amount) {
        await interaction.reply({ content: '❌ You don\'t have enough money.', ephemeral: true });
        return;
      }

      await prisma.$transaction([
        prisma.economy.update({
          where: { userId_guildId: { userId: interaction.user.id, guildId: interaction.guildId } },
          update: { wallet: { decrement: amount } },
        }),
        prisma.bounty.upsert({
          where: { targetId_guildId: { targetId: targetUser.id, guildId: interaction.guildId } },
          update: { amount: { increment: amount }, hunterId: interaction.user.id },
          create: { targetId: targetUser.id, guildId: interaction.guildId, amount, hunterId: interaction.user.id },
        }),
      ]);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.economy} Bounty Placed`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Target', value: targetUser.tag, inline: true },
          { name: 'Bounty', value: `${amount} ${guild.currencySymbol || '💰'}`, inline: true },
          { name: 'Placed By', value: interaction.user.tag, inline: true },
        ])
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ content: '❌ Failed to place bounty.', ephemeral: true });
    }
  }

  public async executePrefix(message: Message, _args: string[]): Promise<void> {
    const targetUser = message.mentions.users.first();
    const amount = parseInt(args[1]);

    if (!targetUser || targetUser.id === message.author.id) {
      await message.reply('❌ You cannot place a bounty on yourself.');
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

      if (wallet < amount) {
        await message.reply('❌ You don\'t have enough money.');
        return;
      }

      await prisma.$transaction([
        prisma.economy.update({
          where: { userId_guildId: { userId: message.author.id, guildId: message.guildId } },
          update: { wallet: { decrement: amount } },
        }),
        prisma.bounty.upsert({
          where: { targetId_guildId: { targetId: targetUser.id, guildId: message.guildId } },
          update: { amount: { increment: amount }, hunterId: message.author.id },
          create: { targetId: targetUser.id, guildId: message.guildId, amount, hunterId: message.author.id },
        }),
      ]);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.economy} Bounty Placed`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Target', value: targetUser.tag, inline: true },
          { name: 'Bounty', value: `${amount} ${guild.currencySymbol || '💰'}`, inline: true },
          { name: 'Placed By', value: message.author.tag, inline: true },
        ])
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      await message.reply('❌ Failed to place bounty.');
    }
  }
}

export default BountyCommand;
