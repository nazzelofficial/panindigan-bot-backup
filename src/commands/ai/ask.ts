import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class AskCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'ask',
      description: 'Ask AI a question',
      category: 'ai',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['question', 'inquire'],
      examples: ['/ask what is the meaning of life', 'p!ask how do I code'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const question = interaction.options.getString('question') || '';
    if (!question) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please provide a question to ask.')
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed] });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.ai} ❓ AI Question`)
      .setColor(COLORS.info)
      .addFields([
        { name: 'Question', value: question, inline: false },
        { name: 'Answer', value: 'This is a placeholder. AI answering will be implemented with the AIHandler.', inline: false },
      ])
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const args = message.content.split(' ').slice(1);
    const question = args.join(' ');

    if (!question) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please provide a question to ask.')
        .setTimestamp();

      await message.reply({ embeds: [errorEmbed] });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.ai} ❓ AI Question`)
      .setColor(COLORS.info)
      .addFields([
        { name: 'Question', value: question, inline: false },
        { name: 'Answer', value: 'This is a placeholder. AI answering will be implemented with the AIHandler.', inline: false },
      ])
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default AskCommand;
