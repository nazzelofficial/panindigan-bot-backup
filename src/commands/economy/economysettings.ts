import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';
import { getPrismaClient } from '../../database/postgresql/client';

export class EconomySettingsCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'economysettings',
      description: 'View economy settings (Admin)',
      category: 'economy',
      cooldown: 10,
      userPermissions: [PermissionFlagsBits.Administrator],
      botPermissions: [],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['econsettings', 'economyconfig'],
      examples: ['/economysettings', 'p!economysettings'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guildId) return;

    try {
      const prisma = getPrismaClient();

      const guild = await prisma.guild.findUnique({
        where: { guildId: interaction.guildId },
      });

      if (!guild) {
        await interaction.reply({ content: '❌ Guild settings not found.', ephemeral: true });
        return;
      }

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.economy} Economy Settings`)
        .setColor(COLORS.info)
        .addFields([
          { name: 'Currency Symbol', value: guild.currencySymbol || '💰', inline: true },
          { name: 'Daily Reward', value: guild.dailyReward?.toString() || '500', inline: true },
          { name: 'Weekly Reward', value: guild.weeklyReward?.toString() || '2000', inline: true },
          { name: 'Monthly Reward', value: guild.monthlyReward?.toString() || '5000', inline: true },
          { name: 'Work Reward', value: guild.workReward?.toString() || '300', inline: true },
          { name: 'Beg Reward', value: guild.begReward?.toString() || '50', inline: true },
          { name: 'Max Bank', value: guild.maxBank?.toLocaleString() || '1,000,000', inline: true },
          { name: 'Max Loan', value: guild.maxLoan?.toLocaleString() || '10,000', inline: true },
        ])
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ content: '❌ Failed to fetch economy settings.', ephemeral: true });
    }
  }

  public async executePrefix(message: Message): Promise<void> {
    if (!message.guildId) return;

    try {
      const prisma = getPrismaClient();

      const guild = await prisma.guild.findUnique({
        where: { guildId: message.guildId },
      });

      if (!guild) {
        await message.reply('❌ Guild settings not found.');
        return;
      }

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.economy} Economy Settings`)
        .setColor(COLORS.info)
        .addFields([
          { name: 'Currency Symbol', value: guild.currencySymbol || '💰', inline: true },
          { name: 'Daily Reward', value: guild.dailyReward?.toString() || '500', inline: true },
          { name: 'Weekly Reward', value: guild.weeklyReward?.toString() || '2000', inline: true },
          { name: 'Monthly Reward', value: guild.monthlyReward?.toString() || '5000', inline: true },
          { name: 'Work Reward', value: guild.workReward?.toString() || '300', inline: true },
          { name: 'Beg Reward', value: guild.begReward?.toString() || '50', inline: true },
          { name: 'Max Bank', value: guild.maxBank?.toLocaleString() || '1,000,000', inline: true },
          { name: 'Max Loan', value: guild.maxLoan?.toLocaleString() || '10,000', inline: true },
        ])
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      await message.reply('❌ Failed to fetch economy settings.');
    }
  }
}

export default EconomySettingsCommand;
