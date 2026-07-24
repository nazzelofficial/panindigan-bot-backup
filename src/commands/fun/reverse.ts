import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class ReverseCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'reverse',
      description: 'Reverse text',
      category: 'fun',
      cooldown: 3,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['rev'],
      examples: ['/reverse hello world', 'p!reverse hello world'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const text = interaction.options.getString('text') || '';
    if (!text) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please provide text to reverse.')
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed] });
      return;
    }

    const reversed = text.split('').reverse().join('');

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.fun} 🔃 Reverse`)
      .setColor(COLORS.info)
      .addFields([
        { name: 'Original', value: text, inline: false },
        { name: 'Reversed', value: reversed, inline: false },
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
        .setDescription('Please provide text to reverse.')
        .setTimestamp();

      await message.reply({ embeds: [errorEmbed] });
      return;
    }

    const reversed = text.split('').reverse().join('');

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.fun} 🔃 Reverse`)
      .setColor(COLORS.info)
      .addFields([
        { name: 'Original', value: text, inline: false },
        { name: 'Reversed', value: reversed, inline: false },
      ])
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default ReverseCommand;
