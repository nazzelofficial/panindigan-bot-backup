// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';

export class BegCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'beg',
      description: 'Beg for money',
      category: 'economy',
      cooldown: 30,
      userPermissions: [],
      botPermissions: [],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['panhandle'],
      examples: ['/beg', 'p!beg'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guildId || !interaction.user) return;

    try {
      const prisma = getPrismaClient();
      const guild = await prisma.guild.upsert({
        where: { guildId: interaction.guildId },
        update: {},
        create: { guildId: interaction.guildId },
      });

      const responses = [
        'A kind stranger gave you some money.',
        'You found some coins on the ground.',
        'Someone felt bad for you and gave you money.',
        'You begged successfully!',
        'A generous person donated to you.',
      ];

      const response = responses[Math.floor(Math.random() * responses.length)];
      const amount = Math.floor(Math.random() * 100) + 10;

      await prisma.economy.upsert({
        where: { userId_guildId: { userId: interaction.user.id, guildId: interaction.guildId } },
        update: { wallet: { increment: amount } },
        create: { userId: interaction.user.id, guildId: interaction.guildId, wallet: amount, bank: 0 },
      });

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.economy} Begging Success`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Response', value: response, inline: false },
          { name: 'Received', value: `${amount.toLocaleString()} ${guild.currencySymbol || '💰'}`, inline: true },
        ])
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ content: '❌ Failed to beg.', ephemeral: true });
    }
  }

  public async executePrefix(message: Message): Promise<void> {
    if (!message.guildId || !message.author) return;

    try {
      const prisma = getPrismaClient();
      const guild = await prisma.guild.upsert({
        where: { guildId: message.guildId },
        update: {},
        create: { guildId: message.guildId },
      });

      const responses = [
        'A kind stranger gave you some money.',
        'You found some coins on the ground.',
        'Someone felt bad for you and gave you money.',
        'You begged successfully!',
        'A generous person donated to you.',
      ];

      const response = responses[Math.floor(Math.random() * responses.length)];
      const amount = Math.floor(Math.random() * 100) + 10;

      await prisma.economy.upsert({
        where: { userId_guildId: { userId: message.author.id, guildId: message.guildId } },
        update: { wallet: { increment: amount } },
        create: { userId: message.author.id, guildId: message.guildId, wallet: amount, bank: 0 },
      });

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.economy} Begging Success`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Response', value: response, inline: false },
          { name: 'Received', value: `${amount.toLocaleString()} ${guild.currencySymbol || '💰'}`, inline: true },
        ])
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      await message.reply('❌ Failed to beg.');
    }
  }
}

export default BegCommand;
