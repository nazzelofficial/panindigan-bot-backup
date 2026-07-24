import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';
import { getPrismaClient } from '../../database/postgresql/client';

export class BankCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'bank',
      description: 'View bank information',
      category: 'economy',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['bankinfo', 'bankbalance'],
      examples: ['/bank', 'p!bank'],
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

      const economy = await prisma.economy.findUnique({
        where: { userId_guildId: { userId: interaction.user.id, guildId: interaction.guildId } },
      });

      const bank = economy?.bank || 0;
      const maxBank = guild.maxBank || 1000000;
      const bankPercentage = Math.min((bank / maxBank) * 100, 100);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.economy} Bank Information`)
        .setColor(COLORS.info)
        .addFields([
          { name: 'Current Balance', value: `${bank.toLocaleString()} ${guild.currencySymbol || '💰'}`, inline: true },
          { name: 'Maximum Capacity', value: `${maxBank.toLocaleString()} ${guild.currencySymbol || '💰'}`, inline: true },
          { name: 'Capacity Used', value: `${bankPercentage.toFixed(1)}%`, inline: true },
          { name: 'Interest Rate', value: '5% per week', inline: true },
        ])
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ content: '❌ Failed to fetch bank information.', ephemeral: true });
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

      const economy = await prisma.economy.findUnique({
        where: { userId_guildId: { userId: message.author.id, guildId: message.guildId } },
      });

      const bank = economy?.bank || 0;
      const maxBank = guild.maxBank || 1000000;
      const bankPercentage = Math.min((bank / maxBank) * 100, 100);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.economy} Bank Information`)
        .setColor(COLORS.info)
        .addFields([
          { name: 'Current Balance', value: `${bank.toLocaleString()} ${guild.currencySymbol || '💰'}`, inline: true },
          { name: 'Maximum Capacity', value: `${maxBank.toLocaleString()} ${guild.currencySymbol || '💰'}`, inline: true },
          { name: 'Capacity Used', value: `${bankPercentage.toFixed(1)}%`, inline: true },
          { name: 'Interest Rate', value: '5% per week', inline: true },
        ])
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      await message.reply('❌ Failed to fetch bank information.');
    }
  }
}

export default BankCommand;
