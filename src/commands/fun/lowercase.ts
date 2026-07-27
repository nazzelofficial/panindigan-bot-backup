// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';

export class LowercaseCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'lowercase',
      description: 'Convert text to lowercase',
      category: 'fun',
      cooldown: 3,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['lower'],
      examples: ['/lowercase HELLO WORLD', 'p!lowercase HELLO WORLD'],
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

    const lowercased = text.toLowerCase();

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.fun} 🔡 Lowercase`)
      .setColor(COLORS.info)
      .addFields([
        { name: 'Original', value: text, inline: false },
        { name: 'Lowercased', value: lowercased, inline: false },
      ])
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const _args = message.content.split(' ').slice(1);
    const text = _args.join(' ');

    if (!text) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please provide text to convert.')
        .setTimestamp();

      await message.reply({ embeds: [errorEmbed] });
      return;
    }

    const lowercased = text.toLowerCase();

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.fun} 🔡 Lowercase`)
      .setColor(COLORS.info)
      .addFields([
        { name: 'Original', value: text, inline: false },
        { name: 'Lowercased', value: lowercased, inline: false },
      ])
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default LowercaseCommand;
