// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';

export class SetCurrencyCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'setcurrency',
      description: 'Set the server currency symbol (Admin)',
      category: 'economy',
      cooldown: 5,
      userPermissions: [PermissionFlagsBits.Administrator],
      botPermissions: [],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['currency', 'setmoney'],
      examples: ['/setcurrency 💰', 'p!setcurrency 💰'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const symbol = interaction.options.getString('symbol');

    if (!symbol) {
      await interaction.reply({ content: '❌ Please provide a currency symbol.', ephemeral: true });
      return;
    }

    if (!interaction.guildId) return;

    try {
      const prisma = getPrismaClient();

      await prisma.guild.update({
        where: { guildId: interaction.guildId },
        update: { currencySymbol: symbol },
      });

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.economy} Currency Symbol Updated`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'New Symbol', value: symbol, inline: true },
        ])
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ content: '❌ Failed to set currency symbol.', ephemeral: true });
    }
  }

  public async executePrefix(message: Message, _args: string[]): Promise<void> {
    const symbol = args[0];

    if (!symbol) {
      await message.reply('❌ Please provide a currency symbol.');
      return;
    }

    if (!message.guildId) return;

    try {
      const prisma = getPrismaClient();

      await prisma.guild.update({
        where: { guildId: message.guildId },
        update: { currencySymbol: symbol },
      });

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.economy} Currency Symbol Updated`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'New Symbol', value: symbol, inline: true },
        ])
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      await message.reply('❌ Failed to set currency symbol.');
    }
  }
}

export default SetCurrencyCommand;
