import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class TranslateCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'translate',
      description: 'Translate text to another language',
      category: 'info',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['tr'],
      examples: ['/translate Hello Spanish', 'p!translate Hola English'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const text = interaction.options.getString('text') || '';
    const language = interaction.options.getString('language') || 'English';

    if (!text) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please provide text to translate.')
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed] });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} 🌐 Translation`)
      .setColor(COLORS.info)
      .addFields([
        { name: 'Original', value: text, inline: false },
        { name: 'Target Language', value: language, inline: true },
        { name: 'Translation', value: 'This is a placeholder. Translation will be implemented with a translation API.', inline: false },
      ])
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const args = message.content.split(' ').slice(1);
    const text = args.slice(0, -1).join(' ');
    const language = args[args.length - 1] || 'English';

    if (!text) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please provide text to translate.')
        .setTimestamp();

      await message.reply({ embeds: [errorEmbed] });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} 🌐 Translation`)
      .setColor(COLORS.info)
      .addFields([
        { name: 'Original', value: text, inline: false },
        { name: 'Target Language', value: language, inline: true },
        { name: 'Translation', value: 'This is a placeholder. Translation will be implemented with a translation API.', inline: false },
      ])
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default TranslateCommand;
