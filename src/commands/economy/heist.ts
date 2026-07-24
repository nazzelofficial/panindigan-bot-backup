import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';
import { getPrismaClient } from '../../database/postgresql/client';

export class HeistCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'heist',
      description: 'Plan and execute a heist',
      category: 'economy',
      cooldown: 300,
      userPermissions: [],
      botPermissions: [],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['robbery', 'bigrob'],
      examples: ['/heist', 'p!heist'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guildId) return;

    try {
      const prisma = getPrismaClient();
      const guild = await prisma.guild.upsert({
        where: { guildId: interaction.guildId },
        update: {},
        create: { guildId: interaction.guildId },
      });

      const heistTargets = [
        { name: 'Bank', minLoot: 5000, maxLoot: 50000, failChance: 0.7 },
        { name: 'Jewelry Store', minLoot: 10000, maxLoot: 100000, failChance: 0.75 },
        { name: 'Casino', minLoot: 25000, maxLoot: 250000, failChance: 0.8 },
        { name: 'Museum', minLoot: 50000, maxLoot: 500000, failChance: 0.85 },
      ];

      const target = heistTargets[Math.floor(Math.random() * heistTargets.length)];
      const success = Math.random() > target.failChance;

      if (success) {
        const loot = Math.floor(Math.random() * (target.maxLoot - target.minLoot + 1)) + target.minLoot;

        await prisma.economy.upsert({
          where: { userId_guildId: { userId: interaction.user.id, guildId: interaction.guildId } },
          update: { wallet: { increment: loot } },
          create: { userId: interaction.user.id, guildId: interaction.guildId, wallet: loot, bank: 0 },
        });

        const embed = new EmbedBuilder()
          .setTitle(`${EMOJIS.economy} Heist Successful`)
          .setColor(COLORS.success)
          .addFields([
            { name: 'Target', value: target.name, inline: true },
            { name: 'Loot', value: `${loot.toLocaleString()} ${guild.currencySymbol || '💰'}`, inline: true },
          ])
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });
      } else {
        const penalty = Math.floor(target.minLoot * 0.3);

        await prisma.economy.upsert({
          where: { userId_guildId: { userId: interaction.user.id, guildId: interaction.guildId } },
          update: { wallet: { decrement: Math.min(penalty, target.minLoot) } },
          create: { userId: interaction.user.id, guildId: interaction.guildId, wallet: 0, bank: 0 },
        });

        const embed = new EmbedBuilder()
          .setTitle(`${EMOJIS.error} Heist Failed`)
          .setColor(COLORS.error)
          .addFields([
            { name: 'Target', value: target.name, inline: true },
            { name: 'Penalty', value: `${Math.min(penalty, target.minLoot).toLocaleString()} ${guild.currencySymbol || '💰'}`, inline: true },
            { name: 'Reason', value: 'Security caught you', inline: false },
          ])
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });
      }
    } catch (error) {
      await interaction.reply({ content: '❌ Failed to execute heist.', ephemeral: true });
    }
  }

  public async executePrefix(message: Message): Promise<void> {
    if (!message.guildId) return;

    try {
      const prisma = getPrismaClient();
      const guild = await prisma.guild.upsert({
        where: { guildId: message.guildId },
        update: {},
        create: { guildId: message.guildId },
      });

      const heistTargets = [
        { name: 'Bank', minLoot: 5000, maxLoot: 50000, failChance: 0.7 },
        { name: 'Jewelry Store', minLoot: 10000, maxLoot: 100000, failChance: 0.75 },
        { name: 'Casino', minLoot: 25000, maxLoot: 250000, failChance: 0.8 },
        { name: 'Museum', minLoot: 50000, maxLoot: 500000, failChance: 0.85 },
      ];

      const target = heistTargets[Math.floor(Math.random() * heistTargets.length)];
      const success = Math.random() > target.failChance;

      if (success) {
        const loot = Math.floor(Math.random() * (target.maxLoot - target.minLoot + 1)) + target.minLoot;

        await prisma.economy.upsert({
          where: { userId_guildId: { userId: message.author.id, guildId: message.guildId } },
          update: { wallet: { increment: loot } },
          create: { userId: message.author.id, guildId: message.guildId, wallet: loot, bank: 0 },
        });

        const embed = new EmbedBuilder()
          .setTitle(`${EMOJIS.economy} Heist Successful`)
          .setColor(COLORS.success)
          .addFields([
            { name: 'Target', value: target.name, inline: true },
            { name: 'Loot', value: `${loot.toLocaleString()} ${guild.currencySymbol || '💰'}`, inline: true },
          ])
          .setTimestamp();

        await message.reply({ embeds: [embed] });
      } else {
        const penalty = Math.floor(target.minLoot * 0.3);

        await prisma.economy.upsert({
          where: { userId_guildId: { userId: message.author.id, guildId: message.guildId } },
          update: { wallet: { decrement: Math.min(penalty, target.minLoot) } },
          create: { userId: message.author.id, guildId: message.guildId, wallet: 0, bank: 0 },
        });

        const embed = new EmbedBuilder()
          .setTitle(`${EMOJIS.error} Heist Failed`)
          .setColor(COLORS.error)
          .addFields([
            { name: 'Target', value: target.name, inline: true },
            { name: 'Penalty', value: `${Math.min(penalty, target.minLoot).toLocaleString()} ${guild.currencySymbol || '💰'}`, inline: true },
            { name: 'Reason', value: 'Security caught you', inline: false },
          ])
          .setTimestamp();

        await message.reply({ embeds: [embed] });
      }
    } catch (error) {
      await message.reply('❌ Failed to execute heist.');
    }
  }
}

export default HeistCommand;
