import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';
import { getPrismaClient } from '../../database/postgresql/client';

export class MineCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'mine',
      description: 'Mine for resources',
      category: 'economy',
      cooldown: 30,
      userPermissions: [],
      botPermissions: [],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['dig', 'excavate'],
      examples: ['/mine', 'p!mine'],
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

      const resources = [
        { name: 'Stone', min: 1, max: 5, rarity: 0.5 },
        { name: 'Iron', min: 1, max: 3, rarity: 0.3 },
        { name: 'Gold', min: 1, max: 2, rarity: 0.15 },
        { name: 'Diamond', min: 1, max: 1, rarity: 0.05 },
      ];

      const foundResources = [];

      for (const resource of resources) {
        if (Math.random() < resource.rarity) {
          const amount = Math.floor(Math.random() * (resource.max - resource.min + 1)) + resource.min;
          foundResources.push(`${resource.name} x${amount}`);
        }
      }

      if (foundResources.length === 0) {
        foundResources.push('Nothing found');
      }

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.economy} Mining Results`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Found', value: foundResources.join(', '), inline: false },
        ])
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ content: '❌ Failed to mine.', ephemeral: true });
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

      const resources = [
        { name: 'Stone', min: 1, max: 5, rarity: 0.5 },
        { name: 'Iron', min: 1, max: 3, rarity: 0.3 },
        { name: 'Gold', min: 1, max: 2, rarity: 0.15 },
        { name: 'Diamond', min: 1, max: 1, rarity: 0.05 },
      ];

      const foundResources = [];

      for (const resource of resources) {
        if (Math.random() < resource.rarity) {
          const amount = Math.floor(Math.random() * (resource.max - resource.min + 1)) + resource.min;
          foundResources.push(`${resource.name} x${amount}`);
        }
      }

      if (foundResources.length === 0) {
        foundResources.push('Nothing found');
      }

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.economy} Mining Results`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Found', value: foundResources.join(', '), inline: false },
        ])
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      await message.reply('❌ Failed to mine.');
    }
  }
}

export default MineCommand;
