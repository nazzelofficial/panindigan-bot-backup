// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';

export class RichestCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'richest',
      description: 'View the richest users in the server',
      category: 'economy',
      cooldown: 30,
      userPermissions: [],
      botPermissions: [],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['baltop', 'topmoney'],
      examples: ['/richest', 'p!richest'],
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

      const economies = await prisma.economy.findMany({
        where: { guildId: interaction.guildId },
        orderBy: { wallet: 'desc' },
        take: 10,
      });

      if (economies.length === 0) {
        await interaction.reply({ content: '❌ No economy data found.', ephemeral: true });
        return;
      }

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.economy} Richest Users`)
        .setColor(COLORS.info)
        .setDescription('Top 10 richest users:')
        .addFields(
          await Promise.all(
            economies.map(async (economy, index) => {
              try {
                const user = await interaction.client.users.fetch(economy.userId);
                return {
                  name: `#${index + 1} ${user.tag}`,
                  value: `${(economy.wallet + economy.bank).toLocaleString()} ${guild.currencySymbol || '💰'}`,
                  inline: false,
                };
              } catch {
                return null;
              }
            })
          )
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ content: '❌ Failed to fetch richest users.', ephemeral: true });
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

      const economies = await prisma.economy.findMany({
        where: { guildId: message.guildId },
        orderBy: { wallet: 'desc' },
        take: 10,
      });

      if (economies.length === 0) {
        await message.reply('❌ No economy data found.');
        return;
      }

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.economy} Richest Users`)
        .setColor(COLORS.info)
        .setDescription('Top 10 richest users:')
        .addFields(
          await Promise.all(
            economies.map(async (economy, index) => {
              try {
                const user = await message.client.users.fetch(economy.userId);
                return {
                  name: `#${index + 1} ${user.tag}`,
                  value: `${(economy.wallet + economy.bank).toLocaleString()} ${guild.currencySymbol || '💰'}`,
                  inline: false,
                };
              } catch {
                return null;
              }
            })
          )
        )
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      await message.reply('❌ Failed to fetch richest users.');
    }
  }
}

export default RichestCommand;
