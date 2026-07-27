// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';

export class BountiesCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'bounties',
      description: 'View active bounties',
      category: 'economy',
      cooldown: 10,
      userPermissions: [],
      botPermissions: [],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['activebounties', 'bountylist'],
      examples: ['/bounties', 'p!bounties'],
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

      const bounties = await prisma.bounty.findMany({
        where: { guildId: interaction.guildId, amount: { gt: 0 } },
        take: 10,
      });

      if (bounties.length === 0) {
        await interaction.reply({ content: '❌ No active bounties.', ephemeral: true });
        return;
      }

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.economy} Active Bounties`)
        .setColor(COLORS.info)
        .setDescription('Current active bounties:')
        .addFields(
          await Promise.all(
            bounties.map(async (bounty) => {
              try {
                const target = await interaction.client.users.fetch(bounty.targetId);
                return {
                  name: target.tag,
                  value: `${bounty.amount} ${guild.currencySymbol || '💰'}`,
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
      await interaction.reply({ content: '❌ Failed to fetch bounties.', ephemeral: true });
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

      const bounties = await prisma.bounty.findMany({
        where: { guildId: message.guildId, amount: { gt: 0 } },
        take: 10,
      });

      if (bounties.length === 0) {
        await message.reply('❌ No active bounties.');
        return;
      }

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.economy} Active Bounties`)
        .setColor(COLORS.info)
        .setDescription('Current active bounties:')
        .addFields(
          await Promise.all(
            bounties.map(async (bounty) => {
              try {
                const target = await message.client.users.fetch(bounty.targetId);
                return {
                  name: target.tag,
                  value: `${bounty.amount} ${guild.currencySymbol || '💰'}`,
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
      await message.reply('❌ Failed to fetch bounties.');
    }
  }
}

export default BountiesCommand;
