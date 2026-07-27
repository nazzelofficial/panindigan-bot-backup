// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';

export class ChopCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'chop',
      description: 'Chop trees for wood',
      category: 'economy',
      cooldown: 30,
      userPermissions: [],
      botPermissions: [],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['lumber', 'cut'],
      examples: ['/chop', 'p!chop'],
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

      const woodTypes = [
        { name: 'Oak Wood', min: 1, max: 5, rarity: 0.6, value: 5 },
        { name: 'Pine Wood', min: 1, max: 4, rarity: 0.25, value: 8 },
        { name: 'Maple Wood', min: 1, max: 3, rarity: 0.1, value: 15 },
        { name: 'Mahogany Wood', min: 1, max: 2, rarity: 0.04, value: 30 },
        { name: 'Elder Wood', min: 1, max: 1, rarity: 0.01, value: 100 },
      ];

      const choppedWood = [];

      for (const wood of woodTypes) {
        if (Math.random() < wood.rarity) {
          const amount = Math.floor(Math.random() * (wood.max - wood.min + 1)) + wood.min;
          choppedWood.push(`${wood.name} x${amount} (${wood.value * amount} ${guild.currencySymbol || '💰'})`);
        }
      }

      if (choppedWood.length === 0) {
        choppedWood.push('Nothing chopped');
      }

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.economy} Chopping Results`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Chopped', value: choppedWood.join(', '), inline: false },
        ])
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ content: '❌ Failed to chop.', ephemeral: true });
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

      const woodTypes = [
        { name: 'Oak Wood', min: 1, max: 5, rarity: 0.6, value: 5 },
        { name: 'Pine Wood', min: 1, max: 4, rarity: 0.25, value: 8 },
        { name: 'Maple Wood', min: 1, max: 3, rarity: 0.1, value: 15 },
        { name: 'Mahogany Wood', min: 1, max: 2, rarity: 0.04, value: 30 },
        { name: 'Elder Wood', min: 1, max: 1, rarity: 0.01, value: 100 },
      ];

      const choppedWood = [];

      for (const wood of woodTypes) {
        if (Math.random() < wood.rarity) {
          const amount = Math.floor(Math.random() * (wood.max - wood.min + 1)) + wood.min;
          choppedWood.push(`${wood.name} x${amount} (${wood.value * amount} ${guild.currencySymbol || '💰'})`);
        }
      }

      if (choppedWood.length === 0) {
        choppedWood.push('Nothing chopped');
      }

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.economy} Chopping Results`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Chopped', value: choppedWood.join(', '), inline: false },
        ])
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      await message.reply('❌ Failed to chop.');
    }
  }
}

export default ChopCommand;
