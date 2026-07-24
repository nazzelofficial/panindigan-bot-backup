import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class DeleteCategoryCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'deletecategory',
      description: 'Delete a category from the server',
      category: 'admin',
      cooldown: 5,
      userPermissions: [PermissionFlagsBits.ManageChannels],
      botPermissions: [PermissionFlagsBits.ManageChannels],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['delcategory', 'removecategory'],
      examples: ['/deletecategory @category', 'p!deletecategory @category'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const category = interaction.options.getChannel('category');

    if (!category) {
      await interaction.reply({ content: '❌ Please provide a category to delete.', ephemeral: true });
      return;
    }

    if (category.type !== 4) {
      await interaction.reply({ content: '❌ Please provide a valid category.', ephemeral: true });
      return;
    }

    if (!interaction.guild) return;

    try {
      await category.delete('Deleted by ' + interaction.user.tag);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.success} Category Deleted`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Category', value: category.name, inline: true },
          { name: 'ID', value: category.id, inline: true },
          { name: 'Deleted by', value: interaction.user.tag, inline: false },
        ])
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ content: '❌ Failed to delete category. Make sure it\'s empty.', ephemeral: true });
    }
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const category = message.mentions.channels.first();

    if (!category) {
      await message.reply('❌ Please mention a category to delete.');
      return;
    }

    if (category.type !== 4) {
      await message.reply('❌ Please provide a valid category.');
      return;
    }

    if (!message.guild) return;

    try {
      await category.delete('Deleted by ' + message.author.tag);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.success} Category Deleted`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Category', value: category.name, inline: true },
          { name: 'ID', value: category.id, inline: true },
          { name: 'Deleted by', value: message.author.tag, inline: false },
        ])
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      await message.reply('❌ Failed to delete category. Make sure it\'s empty.');
    }
  }
}

export default DeleteCategoryCommand;
