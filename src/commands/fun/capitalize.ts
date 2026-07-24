import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class CapitalizeCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'capitalize',
      description: 'Capitalize text',
      category: 'fun',
      cooldown: 3,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['cap', 'title'],
      examples: ['/capitalize hello world', 'p!capitalize hello world'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const text = interaction.options.getString('text') || '';
    if (!text) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please provide text to capitalize.')
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed] });
      return;
    }

    const capitalized = text.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.fun} 🔤 Capitalize`)
      .setColor(COLORS.info)
      .addFields([
        { name: 'Original', value: text, inline: false },
        { name: 'Capitalized', value: capitalized, inline: false },
      ])
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const args = message.content.split(' ').slice(1);
    const text = args.join(' ');

    if (!text) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please provide text to capitalize.')
        .setTimestamp();

      await message.reply({ embeds: [errorEmbed] });
      return;
    }

    const capitalized = text.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.fun} 🔤 Capitalize`)
      .setColor(COLORS.info)
      .addFields([
        { name: 'Original', value: text, inline: false },
        { name: 'Capitalized', value: capitalized, inline: false },
      ])
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default CapitalizeCommand;
