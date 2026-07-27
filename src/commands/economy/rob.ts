// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';

export class RobCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'rob',
      description: 'Attempt to rob another user',
      category: 'economy',
      cooldown: 60,
      userPermissions: [],
      botPermissions: [],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['steal'],
      examples: ['/rob @user', 'p!rob @user'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const targetUser = interaction.options.getUser('user');

    if (!targetUser || targetUser.id === interaction.user.id) {
      await interaction.reply({ content: '❌ You cannot rob yourself.', ephemeral: true });
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

      if (targetWallet < 100) {
        await interaction.reply({ content: '❌ This user doesn\'t have enough money to rob.', ephemeral: true });
        return;
      }

      const successChance = Math.random();
      const successThreshold = 0.4; // 40% success rate

      if (successChance < successThreshold) {
        const stealAmount = Math.floor(targetWallet * 0.1); // Steal 10% of their wallet
        const maxSteal = 1000;
        const finalSteal = Math.min(stealAmount, maxSteal);

        await prisma.$transaction([
          prisma.economy.update({
            where: { userId_guildId: { userId: targetUser.id, guildId: interaction.guildId } },
            update: { wallet: { decrement: finalSteal } },
          }),
          prisma.economy.upsert({
            where: { userId_guildId: { userId: interaction.user.id, guildId: interaction.guildId } },
            update: { wallet: { increment: finalSteal } },
            create: { userId: interaction.user.id, guildId: interaction.guildId, wallet: finalSteal, bank: 0 },
          }),
        ]);

        const embed = new EmbedBuilder()
          .setTitle(`${EMOJIS.economy} Successful Robbery`)
          .setColor(COLORS.success)
          .addFields([
            { name: 'Victim', value: targetUser.tag, inline: true },
            { name: 'Stolen', value: `${finalSteal.toLocaleString()} ${guild.currencySymbol || '💰'}`, inline: true },
          ])
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });
      } else {
        const fineAmount = 100;
        await prisma.economy.upsert({
          where: { userId_guildId: { userId: interaction.user.id, guildId: interaction.guildId } },
          update: { wallet: { decrement: fineAmount } },
          create: { userId: interaction.user.id, guildId: interaction.guildId, wallet: 0, bank: 0 },
        });

        const embed = new EmbedBuilder()
          .setTitle(`${EMOJIS.error} Robbery Failed`)
          .setColor(COLORS.error)
          .addFields([
            { name: 'Fine', value: `${fineAmount.toLocaleString()} ${guild.currencySymbol || '💰'}`, inline: true },
            { name: 'Reason', value: 'You got caught!', inline: true },
          ])
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });
      }
    } catch (error) {
      await interaction.reply({ content: '❌ Failed to rob user.', ephemeral: true });
    }
  }

  public async executePrefix(message: Message, _args: string[]): Promise<void> {
    const targetUser = message.mentions.users.first();

    if (!targetUser || targetUser.id === message.author.id) {
      await message.reply('❌ You cannot rob yourself.');
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

      if (targetWallet < 100) {
        await message.reply('❌ This user doesn\'t have enough money to rob.');
        return;
      }

      const successChance = Math.random();
      const successThreshold = 0.4;

      if (successChance < successThreshold) {
        const stealAmount = Math.floor(targetWallet * 0.1);
        const maxSteal = 1000;
        const finalSteal = Math.min(stealAmount, maxSteal);

        await prisma.$transaction([
          prisma.economy.update({
            where: { userId_guildId: { userId: targetUser.id, guildId: message.guildId } },
            update: { wallet: { decrement: finalSteal } },
          }),
          prisma.economy.upsert({
            where: { userId_guildId: { userId: message.author.id, guildId: message.guildId } },
            update: { wallet: { increment: finalSteal } },
            create: { userId: message.author.id, guildId: message.guildId, wallet: finalSteal, bank: 0 },
          }),
        ]);

        const embed = new EmbedBuilder()
          .setTitle(`${EMOJIS.economy} Successful Robbery`)
          .setColor(COLORS.success)
          .addFields([
            { name: 'Victim', value: targetUser.tag, inline: true },
            { name: 'Stolen', value: `${finalSteal.toLocaleString()} ${guild.currencySymbol || '💰'}`, inline: true },
          ])
          .setTimestamp();

        await message.reply({ embeds: [embed] });
      } else {
        const fineAmount = 100;
        await prisma.economy.upsert({
          where: { userId_guildId: { userId: message.author.id, guildId: message.guildId } },
          update: { wallet: { decrement: fineAmount } },
          create: { userId: message.author.id, guildId: message.guildId, wallet: 0, bank: 0 },
        });

        const embed = new EmbedBuilder()
          .setTitle(`${EMOJIS.error} Robbery Failed`)
          .setColor(COLORS.error)
          .addFields([
            { name: 'Fine', value: `${fineAmount.toLocaleString()} ${guild.currencySymbol || '💰'}`, inline: true },
            { name: 'Reason', value: 'You got caught!', inline: true },
          ])
          .setTimestamp();

        await message.reply({ embeds: [embed] });
      }
    } catch (error) {
      await message.reply('❌ Failed to rob user.');
    }
  }
}

export default RobCommand;
