// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits, ChannelType } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';

export class CreateCategoryCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'createcategory',
      description: 'Create a new category',
      category: 'admin',
      cooldown: 5,
      userPermissions: [PermissionFlagsBits.ManageChannels],
      botPermissions: [PermissionFlagsBits.ManageChannels],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['makecategory', 'newcategory'],
      examples: ['/createcategory General', 'p!createcategory Staff'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const name = interaction.options.getString('name');

    if (!name) {
      await interaction.reply({ content: '❌ Please provide a category name.', ephemeral: true });
      return;
    }

    if (!interaction.guild) return;

    try {
      const category = await interaction.guild.channels.create({
        name,
        type: ChannelType.GuildCategory,
      });

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.success} Category Created`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Name', value: category.name, inline: true },
          { name: 'ID', value: category.id, inline: true },
          { name: 'Created by', value: interaction.user.tag, inline: false },
        ])
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ content: '❌ Failed to create category.', ephemeral: true });
    }
  }

  public async executePrefix(message: Message, _args: string[]): Promise<void> {
    const name = _args.join(' ');

    if (!name) {
      await message.reply('❌ Please provide a category name.');
      return;
    }

    if (!message.guild) return;

    try {
      const category = await message.guild.channels.create({
        name,
        type: ChannelType.GuildCategory,
      });

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.success} Category Created`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Name', value: category.name, inline: true },
          { name: 'ID', value: category.id, inline: true },
          { name: 'Created by', value: message.author.tag, inline: false },
        ])
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      await message.reply('❌ Failed to create category.');
    }
  }
}

export default CreateCategoryCommand;
