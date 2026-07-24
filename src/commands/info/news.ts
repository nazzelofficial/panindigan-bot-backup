import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class NewsCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'news',
      description: 'Get the latest news',
      category: 'info',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: [],
      examples: ['/news', '/news technology', 'p!news sports'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const category = interaction.options.getString('category') || 'general';

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} 📰 Latest News`)
      .setColor(COLORS.info)
      .setDescription('This is a placeholder. News will be implemented with a news API.')
      .addFields([
        { name: 'Category', value: category, inline: true },
        { name: 'Status', value: 'API integration pending', inline: true },
      ])
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const args = message.content.split(' ').slice(1);
    const category = args[0] || 'general';

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} 📰 Latest News`)
      .setColor(COLORS.info)
      .setDescription('This is a placeholder. News will be implemented with a news API.')
      .addFields([
        { name: 'Category', value: category, inline: true },
        { name: 'Status', value: 'API integration pending', inline: true },
      ])
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default NewsCommand;
