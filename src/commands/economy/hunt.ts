// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';

export class HuntCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'hunt',
      description: 'Hunt for animals',
      category: 'economy',
      cooldown: 30,
      userPermissions: [],
      botPermissions: [],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['track', 'chase'],
      examples: ['/hunt', 'p!hunt'],
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

      const animals = [
        { name: '🐰 Rabbit', min: 1, max: 2, rarity: 0.5, value: 15 },
        { name: '🦊 Fox', min: 1, max: 1, rarity: 0.25, value: 40 },
        { name: '🦌 Deer', min: 1, max: 1, rarity: 0.15, value: 75 },
        { name: '🐺 Wolf', min: 1, max: 1, rarity: 0.08, value: 120 },
        { name: '🐻 Bear', min: 1, max: 1, rarity: 0.02, value: 300 },
      ];

      const huntedAnimals = [];

      for (const animal of animals) {
        if (Math.random() < animal.rarity) {
          const amount = Math.floor(Math.random() * (animal.max - animal.min + 1)) + animal.min;
          huntedAnimals.push(`${animal.name} x${amount} (${animal.value * amount} ${guild.currencySymbol || '💰'})`);
        }
      }

      if (huntedAnimals.length === 0) {
        huntedAnimals.push('Nothing caught');
      }

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.economy} Hunting Results`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Caught', value: huntedAnimals.join(', '), inline: false },
        ])
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ content: '❌ Failed to hunt.', ephemeral: true });
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

      const animals = [
        { name: '🐰 Rabbit', min: 1, max: 2, rarity: 0.5, value: 15 },
        { name: '🦊 Fox', min: 1, max: 1, rarity: 0.25, value: 40 },
        { name: '🦌 Deer', min: 1, max: 1, rarity: 0.15, value: 75 },
        { name: '🐺 Wolf', min: 1, max: 1, rarity: 0.08, value: 120 },
        { name: '🐻 Bear', min: 1, max: 1, rarity: 0.02, value: 300 },
      ];

      const huntedAnimals = [];

      for (const animal of animals) {
        if (Math.random() < animal.rarity) {
          const amount = Math.floor(Math.random() * (animal.max - animal.min + 1)) + animal.min;
          huntedAnimals.push(`${animal.name} x${amount} (${animal.value * amount} ${guild.currencySymbol || '💰'})`);
        }
      }

      if (huntedAnimals.length === 0) {
        huntedAnimals.push('Nothing caught');
      }

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.economy} Hunting Results`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Caught', value: huntedAnimals.join(', '), inline: false },
        ])
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      await message.reply('❌ Failed to hunt.');
    }
  }
}

export default HuntCommand;
