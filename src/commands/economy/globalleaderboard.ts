import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';
import { getPrismaClient } from '../../database/postgresql/client';

export class GlobalLeaderboardCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'globalleaderboard',
      description: 'View the global economy leaderboard',
      category: 'economy',
      cooldown: 30,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['globalbaltop', 'globalrichest'],
      examples: ['/globalleaderboard', 'p!globalleaderboard'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    try {
      const prisma = getPrismaClient();

      const economies = await prisma.economy.findMany({
        orderBy: { wallet: 'desc' },
        take: 10,
      });

      if (economies.length === 0) {
        await interaction.reply({ content: '❌ No economy data found.', ephemeral: true });
        return;
      }

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.economy} Global Richest Users`)
        .setColor(COLORS.info)
        .setDescription('Top 10 richest users across all servers:')
        .addFields(
          await Promise.all(
            economies.map(async (economy, index) => {
              try {
                const user = await interaction.client.users.fetch(economy.userId);
                return {
                  name: `#${index + 1} ${user.tag}`,
                  value: `${(economy.wallet + economy.bank).toLocaleString()} 💰`,
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
      await interaction.reply({ content: '❌ Failed to fetch global leaderboard.', ephemeral: true });
    }
  }

  public async executePrefix(message: Message): Promise<void> {
    try {
      const prisma = getPrismaClient();

      const economies = await prisma.economy.findMany({
        orderBy: { wallet: 'desc' },
        take: 10,
      });

      if (economies.length === 0) {
        await message.reply('❌ No economy data found.');
        return;
      }

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.economy} Global Richest Users`)
        .setColor(COLORS.info)
        .setDescription('Top 10 richest users across all servers:')
        .addFields(
          await Promise.all(
            economies.map(async (economy, index) => {
              try {
                const user = await message.client.users.fetch(economy.userId);
                return {
                  name: `#${index + 1} ${user.tag}`,
                  value: `${(economy.wallet + economy.bank).toLocaleString()} 💰`,
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
      await message.reply('❌ Failed to fetch global leaderboard.');
    }
  }
}

export default GlobalLeaderboardCommand;
