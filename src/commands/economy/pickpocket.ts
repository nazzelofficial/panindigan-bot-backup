// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';

export class PickpocketCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'pickpocket',
      description: 'Pickpocket another user',
      category: 'economy',
      cooldown: 60,
      userPermissions: [],
      botPermissions: [],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['pick', 'pocket'],
      examples: ['/pickpocket @user', 'p!pickpocket @user'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const targetUser = interaction.options.getUser('user');

    if (!targetUser || targetUser.id === interaction.user.id) {
      await interaction.reply({ content: '❌ You cannot pickpocket yourself.', ephemeral: true });
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

      const targetEconomy = await prisma.economy.findUnique({
        where: { userId_guildId: { userId: targetUser.id, guildId: interaction.guildId } },
      });

      const targetWallet = targetEconomy?.wallet || 0;

      if (targetWallet < 50) {
        await interaction.reply({ content: '❌ This user doesn\'t have enough money to pickpocket.', ephemeral: true });
        return;
      }

      const successChance = Math.random();
      const successThreshold = 0.35;

      if (successChance < successThreshold) {
        const stolenAmount = Math.floor(Math.random() * Math.min(targetWallet * 0.2, 200)) + 10;

        await prisma.$transaction([
          prisma.economy.update({
            where: { userId_guildId: { userId: targetUser.id, guildId: interaction.guildId } },
            update: { wallet: { decrement: stolenAmount } },
          }),
          prisma.economy.upsert({
            where: { userId_guildId: { userId: interaction.user.id, guildId: interaction.guildId } },
            update: { wallet: { increment: stolenAmount } },
            create: { userId: interaction.user.id, guildId: interaction.guildId, wallet: stolenAmount, bank: 0 },
          }),
        ]);

        const embed = new EmbedBuilder()
          .setTitle(`${EMOJIS.economy} Pickpocket Successful`)
          .setColor(COLORS.success)
          .addFields([
            { name: 'Victim', value: targetUser.tag, inline: true },
            { name: 'Stolen', value: `${stolenAmount} ${guild.currencySymbol || '💰'}`, inline: true },
          ])
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });
      } else {
        const fineAmount = 50;
        await prisma.economy.upsert({
          where: { userId_guildId: { userId: interaction.user.id, guildId: interaction.guildId } },
          update: { wallet: { decrement: fineAmount } },
          create: { userId: interaction.user.id, guildId: interaction.guildId, wallet: 0, bank: 0 },
        });

        const embed = new EmbedBuilder()
          .setTitle(`${EMOJIS.error} Pickpocket Failed`)
          .setColor(COLORS.error)
          .addFields([
            { name: 'Fine', value: `${fineAmount} ${guild.currencySymbol || '💰'}`, inline: true },
            { name: 'Reason', value: 'You got caught!', inline: true },
          ])
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });
      }
    } catch (error) {
      await interaction.reply({ content: '❌ Failed to pickpocket.', ephemeral: true });
    }
  }

  public async executePrefix(message: Message, _args: string[]): Promise<void> {
    const targetUser = message.mentions.users.first();

    if (!targetUser || targetUser.id === message.author.id) {
      await message.reply('❌ You cannot pickpocket yourself.');
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

      const targetEconomy = await prisma.economy.findUnique({
        where: { userId_guildId: { userId: targetUser.id, guildId: message.guildId } },
      });

      const targetWallet = targetEconomy?.wallet || 0;

      if (targetWallet < 50) {
        await message.reply('❌ This user doesn\'t have enough money to pickpocket.');
        return;
      }

      const successChance = Math.random();
      const successThreshold = 0.35;

      if (successChance < successThreshold) {
        const stolenAmount = Math.floor(Math.random() * Math.min(targetWallet * 0.2, 200)) + 10;

        await prisma.$transaction([
          prisma.economy.update({
            where: { userId_guildId: { userId: targetUser.id, guildId: message.guildId } },
            update: { wallet: { decrement: stolenAmount } },
          }),
          prisma.economy.upsert({
            where: { userId_guildId: { userId: message.author.id, guildId: message.guildId } },
            update: { wallet: { increment: stolenAmount } },
            create: { userId: message.author.id, guildId: message.guildId, wallet: stolenAmount, bank: 0 },
          }),
        ]);

        const embed = new EmbedBuilder()
          .setTitle(`${EMOJIS.economy} Pickpocket Successful`)
          .setColor(COLORS.success)
          .addFields([
            { name: 'Victim', value: targetUser.tag, inline: true },
            { name: 'Stolen', value: `${stolenAmount} ${guild.currencySymbol || '💰'}`, inline: true },
          ])
          .setTimestamp();

        await message.reply({ embeds: [embed] });
      } else {
        const fineAmount = 50;
        await prisma.economy.upsert({
          where: { userId_guildId: { userId: message.author.id, guildId: message.guildId } },
          update: { wallet: { decrement: fineAmount } },
          create: { userId: message.author.id, guildId: message.guildId, wallet: 0, bank: 0 },
        });

        const embed = new EmbedBuilder()
          .setTitle(`${EMOJIS.error} Pickpocket Failed`)
          .setColor(COLORS.error)
          .addFields([
            { name: 'Fine', value: `${fineAmount} ${guild.currencySymbol || '💰'}`, inline: true },
            { name: 'Reason', value: 'You got caught!', inline: true },
          ])
          .setTimestamp();

        await message.reply({ embeds: [embed] });
      }
    } catch (error) {
      await message.reply('❌ Failed to pickpocket.');
    }
  }
}

export default PickpocketCommand;
