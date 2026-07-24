import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class DefineCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'define',
      description: 'AI definition of a word or concept',
      category: 'ai',
      cooldown: 10,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['definition', 'meaning'],
      examples: ['/define love', 'p!define quantum physics'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const term = interaction.options.getString('term') || '';
    if (!term) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please provide a word or concept to define.')
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed] });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.ai} 📖 AI Definition`)
      .setColor(COLORS.info)
      .addFields([
        { name: 'Term', value: term, inline: false },
        { name: 'Definition', value: 'This is a placeholder. AI definition will be implemented with the AIHandler.', inline: false },
      ])
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const args = message.content.split(' ').slice(1);
    const term = args.join(' ');

    if (!term) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please provide a word or concept to define.')
        .setTimestamp();

      await message.reply({ embeds: [errorEmbed] });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.ai} 📖 AI Definition`)
      .setColor(COLORS.info)
      .addFields([
        { name: 'Term', value: term, inline: false },
        { name: 'Definition', value: 'This is a placeholder. AI definition will be implemented with the AIHandler.', inline: false },
      ])
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default DefineCommand;
