// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';

export class SetWeeklyAmountCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'setweeklyamount',
      description: 'Set the weekly reward amount (Admin)',
      category: 'economy',
      cooldown: 5,
      userPermissions: [PermissionFlagsBits.Administrator],
      botPermissions: [],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['weeklyreward', 'setweekly'],
      examples: ['/setweeklyamount 2000', 'p!setweeklyamount 2000'],
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

      await prisma.guild.update({
        where: { guildId: interaction.guildId },
        update: { weeklyReward: amount },
      });

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.economy} Weekly Reward Updated`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'New Weekly Reward', value: amount.toString(), inline: true },
        ])
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ content: '❌ Failed to set weekly reward.', ephemeral: true });
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

      await prisma.guild.update({
        where: { guildId: message.guildId },
        update: { weeklyReward: amount },
      });

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.economy} Weekly Reward Updated`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'New Weekly Reward', value: amount.toString(), inline: true },
        ])
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      await message.reply('❌ Failed to set weekly reward.');
    }
  }
}

export default SetWeeklyAmountCommand;
