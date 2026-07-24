import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class RegexCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'regex',
      description: 'Generate regex patterns using AI',
      category: 'ai',
      cooldown: 15,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['generateregex', 'pattern'],
      examples: ['/regex email validation', 'p!regex phone number'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const pattern = interaction.options.getString('pattern') || '';
    if (!pattern) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please provide a description for regex pattern generation.')
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed] });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.ai} 🔍 AI Regex Generator`)
      .setColor(COLORS.info)
      .addFields([
        { name: 'Description', value: pattern, inline: false },
        { name: 'Regex Pattern', value: 'This is a placeholder. AI regex generation will be implemented with the AIHandler.', inline: false },
      ])
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const args = message.content.split(' ').slice(1);
    const pattern = args.join(' ');

    if (!pattern) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please provide a description for regex pattern generation.')
        .setTimestamp();

      await message.reply({ embeds: [errorEmbed] });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.ai} 🔍 AI Regex Generator`)
      .setColor(COLORS.info)
      .addFields([
        { name: 'Description', value: pattern, inline: false },
        { name: 'Regex Pattern', value: 'This is a placeholder. AI regex generation will be implemented with the AIHandler.', inline: false },
      ])
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default RegexCommand;
