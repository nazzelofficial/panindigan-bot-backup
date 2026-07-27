// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';

export class FarmCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'farm',
      description: 'Farm crops for resources',
      category: 'economy',
      cooldown: 30,
      userPermissions: [],
      botPermissions: [],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['harvest', 'grow'],
      examples: ['/farm', 'p!farm'],
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

      const crops = [
        { name: '🌾 Wheat', min: 1, max: 5, rarity: 0.6, value: 3 },
        { name: '🌽 Corn', min: 1, max: 4, rarity: 0.25, value: 6 },
        { name: '🥕 Carrot', min: 1, max: 3, rarity: 0.1, value: 12 },
        { name: '🍅 Tomato', min: 1, max: 2, rarity: 0.04, value: 25 },
        { name: '🍇 Grapes', min: 1, max: 1, rarity: 0.01, value: 80 },
      ];

      const harvestedCrops = [];

      for (const crop of crops) {
        if (Math.random() < crop.rarity) {
          const amount = Math.floor(Math.random() * (crop.max - crop.min + 1)) + crop.min;
          harvestedCrops.push(`${crop.name} x${amount} (${crop.value * amount} ${guild.currencySymbol || '💰'})`);
        }
      }

      if (harvestedCrops.length === 0) {
        harvestedCrops.push('Nothing harvested');
      }

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.economy} Farming Results`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Harvested', value: harvestedCrops.join(', '), inline: false },
        ])
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ content: '❌ Failed to farm.', ephemeral: true });
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

      const crops = [
        { name: '🌾 Wheat', min: 1, max: 5, rarity: 0.6, value: 3 },
        { name: '🌽 Corn', min: 1, max: 4, rarity: 0.25, value: 6 },
        { name: '🥕 Carrot', min: 1, max: 3, rarity: 0.1, value: 12 },
        { name: '🍅 Tomato', min: 1, max: 2, rarity: 0.04, value: 25 },
        { name: '🍇 Grapes', min: 1, max: 1, rarity: 0.01, value: 80 },
      ];

      const harvestedCrops = [];

      for (const crop of crops) {
        if (Math.random() < crop.rarity) {
          const amount = Math.floor(Math.random() * (crop.max - crop.min + 1)) + crop.min;
          harvestedCrops.push(`${crop.name} x${amount} (${crop.value * amount} ${guild.currencySymbol || '💰'})`);
        }
      }

      if (harvestedCrops.length === 0) {
        harvestedCrops.push('Nothing harvested');
      }

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.economy} Farming Results`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Harvested', value: harvestedCrops.join(', '), inline: false },
        ])
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      await message.reply('❌ Failed to farm.');
    }
  }
}

export default FarmCommand;
