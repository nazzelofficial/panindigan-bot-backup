import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class PollCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'poll',
      description: 'Create a poll',
      category: 'info',
      cooldown: 10,
      userPermissions: [],
      botPermissions: [],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['vote'],
      examples: ['/poll What is your favorite color?', 'p!poll What is your favorite color?'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const question = interaction.options.getString('question') || '';
    if (!question) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please provide a question for the poll.')
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed] });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} 📊 Poll`)
      .setColor(COLORS.info)
      .setDescription(question)
      .addFields([
        { name: 'Options', value: 'React with emojis to vote!', inline: false },
      ])
      .setTimestamp();

    const message = await interaction.reply({ embeds: [embed], fetchReply: true });
    await message.react('👍');
    await message.react('👎');
  }

  public async executePrefix(message: Message): Promise<void> {
    const args = message.content.split(' ').slice(1);
    const question = args.join(' ');

    if (!question) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please provide a question for the poll.')
        .setTimestamp();

      await message.reply({ embeds: [errorEmbed] });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} 📊 Poll`)
      .setColor(COLORS.info)
      .setDescription(question)
      .addFields([
        { name: 'Options', value: 'React with emojis to vote!', inline: false },
      ])
      .setTimestamp();

    const sent = await message.reply({ embeds: [embed] });
    await sent.react('👍');
    await sent.react('👎');
  }
}

export default PollCommand;
