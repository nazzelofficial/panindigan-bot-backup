// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';

export class FilterCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'filter',
      description: 'Manage word filters for auto-moderation',
      category: 'moderation',
      cooldown: 3,
      userPermissions: [PermissionFlagsBits.ManageGuild],
      botPermissions: [PermissionFlagsBits.ManageMessages],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['wordfilter', 'autofilter'],
      examples: ['/filter add badword', 'p!filter remove badword', '/filter list'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const action = interaction.options.getString('action') || 'list';
    const word = interaction.options.getString('word');

    if (!interaction.guild) return;

    const prisma = getPrismaClient();
    const guild = await prisma.guild.findUnique({
      where: { guildId: interaction.guild.id },
    });

    const filteredWords = guild?.filteredWords || [];

    if (action === 'add') {
      if (!word) {
        await interaction.reply({ content: '❌ Please provide a word to add to the filter.', ephemeral: true });
        return;
      }

      if (filteredWords.includes(word.toLowerCase())) {
        await interaction.reply({ content: '❌ This word is already filtered.', ephemeral: true });
        return;
      }

      await prisma.guild.update({
        where: { guildId: interaction.guild.id },
        data: { filteredWords: [...filteredWords, word.toLowerCase()] },
      });

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.success} Word Added to Filter`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Word', value: word, inline: true },
          { name: 'Total Filtered', value: (filteredWords.length + 1).toString(), inline: true },
        ])
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } else if (action === 'remove') {
      if (!word) {
        await interaction.reply({ content: '❌ Please provide a word to remove from the filter.', ephemeral: true });
        return;
      }

      if (!filteredWords.includes(word.toLowerCase())) {
        await interaction.reply({ content: '❌ This word is not filtered.', ephemeral: true });
        return;
      }

      await prisma.guild.update({
        where: { guildId: interaction.guild.id },
        data: { filteredWords: filteredWords.filter(w => w !== word.toLowerCase()) },
      });

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.success} Word Removed from Filter`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Word', value: word, inline: true },
          { name: 'Total Filtered', value: (filteredWords.length - 1).toString(), inline: true },
        ])
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } else {
      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.info} Filtered Words`)
        .setColor(COLORS.info)
        .addFields([
          { name: 'Total Filtered', value: filteredWords.length.toString(), inline: true },
          { name: 'Words', value: filteredWords.length > 0 ? filteredWords.join(', ') : 'None', inline: false },
        ])
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    }
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const action = args[0] || 'list';
    const word = args[1];

    if (!message.guild) return;

    const prisma = getPrismaClient();
    const guild = await prisma.guild.findUnique({
      where: { guildId: message.guild.id },
    });

    const filteredWords = guild?.filteredWords || [];

    if (action === 'add') {
      if (!word) {
        await message.reply('❌ Please provide a word to add to the filter.');
        return;
      }

      if (filteredWords.includes(word.toLowerCase())) {
        await message.reply('❌ This word is already filtered.');
        return;
      }

      await prisma.guild.update({
        where: { guildId: message.guild.id },
        data: { filteredWords: [...filteredWords, word.toLowerCase()] },
      });

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.success} Word Added to Filter`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Word', value: word, inline: true },
          { name: 'Total Filtered', value: (filteredWords.length + 1).toString(), inline: true },
        ])
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } else if (action === 'remove') {
      if (!word) {
        await message.reply('❌ Please provide a word to remove from the filter.');
        return;
      }

      if (!filteredWords.includes(word.toLowerCase())) {
        await message.reply('❌ This word is not filtered.');
        return;
      }

      await prisma.guild.update({
        where: { guildId: message.guild.id },
        data: { filteredWords: filteredWords.filter(w => w !== word.toLowerCase()) },
      });

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.success} Word Removed from Filter`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Word', value: word, inline: true },
          { name: 'Total Filtered', value: (filteredWords.length - 1).toString(), inline: true },
        ])
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } else {
      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.info} Filtered Words`)
        .setColor(COLORS.info)
        .addFields([
          { name: 'Total Filtered', value: filteredWords.length.toString(), inline: true },
          { name: 'Words', value: filteredWords.length > 0 ? filteredWords.join(', ') : 'None', inline: false },
        ])
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    }
  }
}

export default FilterCommand;
