import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';
import { getPrismaClient } from '../../database/postgresql/client';

export class PortfolioCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'portfolio',
      description: 'View your investment portfolio',
      category: 'economy',
      cooldown: 10,
      userPermissions: [],
      botPermissions: [],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['investments', 'myinvestments'],
      examples: ['/portfolio', 'p!portfolio'],
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

      const investments = await prisma.investment.findMany({
        where: { userId: interaction.user.id, guildId: interaction.guildId },
      });

      if (investments.length === 0) {
        await interaction.reply({ content: '❌ You have no investments.', ephemeral: true });
        return;
      }

      const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.economy} Investment Portfolio`)
        .setColor(COLORS.info)
        .addFields(
          investments.map((inv) => ({
            name: inv.item,
            value: `${inv.amount.toLocaleString()} ${guild.currencySymbol || '💰'}`,
            inline: true,
          }))
        )
        .addFields([
          { name: 'Total Invested', value: `${totalInvested.toLocaleString()} ${guild.currencySymbol || '💰'}`, inline: false },
        ])
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ content: '❌ Failed to fetch portfolio.', ephemeral: true });
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

      const investments = await prisma.investment.findMany({
        where: { userId: message.author.id, guildId: message.guildId },
      });

      if (investments.length === 0) {
        await message.reply('❌ You have no investments.');
        return;
      }

      const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.economy} Investment Portfolio`)
        .setColor(COLORS.info)
        .addFields(
          investments.map((inv) => ({
            name: inv.item,
            value: `${inv.amount.toLocaleString()} ${guild.currencySymbol || '💰'}`,
            inline: true,
          }))
        )
        .addFields([
          { name: 'Total Invested', value: `${totalInvested.toLocaleString()} ${guild.currencySymbol || '💰'}`, inline: false },
        ])
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      await message.reply('❌ Failed to fetch portfolio.');
    }
  }
}

export default PortfolioCommand;
