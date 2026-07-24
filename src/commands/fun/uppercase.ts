import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class UppercaseCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'uppercase',
      description: 'Convert text to uppercase',
      category: 'fun',
      cooldown: 3,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['upper', 'caps'],
      examples: ['/uppercase hello world', 'p!uppercase hello world'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const text = interaction.options.getString('text') || '';
    if (!text) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please provide text to convert.')
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed] });
      return;
    }

    const uppercased = text.toUpperCase();

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.fun} 🔠 Uppercase`)
      .setColor(COLORS.info)
      .addFields([
        { name: 'Original', value: text, inline: false },
        { name: 'Uppercased', value: uppercased, inline: false },
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
        .setDescription('Please provide text to convert.')
        .setTimestamp();

      await message.reply({ embeds: [errorEmbed] });
      return;
    }

    const uppercased = text.toUpperCase();

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.fun} 🔠 Uppercase`)
      .setColor(COLORS.info)
      .addFields([
        { name: 'Original', value: text, inline: false },
        { name: 'Uppercased', value: uppercased, inline: false },
      ])
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default UppercaseCommand;
