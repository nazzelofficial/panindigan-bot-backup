import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, ComponentType, ButtonStyle, ActionRowBuilder, ButtonBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class TriviaGameCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'triviagame',
      description: 'Play a general knowledge trivia game',
      category: 'games',
      cooldown: 10,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['gktrivia', 'generalknowledge'],
      examples: ['/triviagame', 'p!triviagame'],
    };
    super(options);
  }

  private questions = [
    { question: 'What is the largest ocean on Earth?', options: ['Atlantic', 'Indian', 'Pacific', 'Arctic'], answer: 2 },
    { question: 'What year did the Titanic sink?', options: ['1910', '1911', '1912', '1913'], answer: 2 },
    { question: 'What is the chemical symbol for oxygen?', options: ['Ox', 'O', 'Og', 'On'], answer: 1 },
    { question: 'Who painted the Mona Lisa?', options: ['Van Gogh', 'Picasso', 'Da Vinci', 'Michelangelo'], answer: 2 },
    { question: 'What is the capital of Australia?', options: ['Sydney', 'Melbourne', 'Canberra', 'Perth'], answer: 2 },
  ];

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const question = this.questions[Math.floor(Math.random() * this.questions.length)];

    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        question.options.map((option, index) =>
          new ButtonBuilder()
            .setCustomId(`triviagame_${index}`)
            .setLabel(option)
            .setStyle(ButtonStyle.Primary)
        )
      );

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.games} Trivia Game`)
      .setColor(COLORS.info)
      .setDescription(question.question)
      .setTimestamp();

    await interaction.reply({ embeds: [embed], components: [row] });

    const collector = interaction.channel?.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 30000,
    });

    collector?.on('collect', async (i) => {
      const selectedOption = parseInt(i.customId.split('_')[1]);

      if (selectedOption === question.answer) {
        const winEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.games} Correct!`)
          .setColor(COLORS.success)
          .setDescription(`You got it right! The answer was ${question.options[question.answer]}.`)
          .setTimestamp();

        await i.update({ embeds: [winEmbed], components: [] });
        collector.stop();
      } else {
        const loseEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.error} Wrong!`)
          .setColor(COLORS.error)
          .setDescription(`The correct answer was ${question.options[question.answer]}.`)
          .setTimestamp();

        await i.update({ embeds: [loseEmbed], components: [] });
        collector.stop();
      }
    });

    collector?.on('end', async (collected) => {
      if (collected.size === 0) {
        const timeoutEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.error} Time's Up!`)
          .setColor(COLORS.error)
          .setDescription(`The correct answer was ${question.options[question.answer]}.`)
          .setTimestamp();

        await interaction.editReply({ embeds: [timeoutEmbed], components: [] });
      }
    });
  }

  public async executePrefix(message: Message): Promise<void> {
    const question = this.questions[Math.floor(Math.random() * this.questions.length)];

    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        question.options.map((option, index) =>
          new ButtonBuilder()
            .setCustomId(`triviagame_${index}`)
            .setLabel(option)
            .setStyle(ButtonStyle.Primary)
        )
      );

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.games} Trivia Game`)
      .setColor(COLORS.info)
      .setDescription(question.question)
      .setTimestamp();

    await message.reply({ embeds: [embed], components: [row] });

    const collector = message.channel.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 30000,
    });

    collector.on('collect', async (i) => {
      const selectedOption = parseInt(i.customId.split('_')[1]);

      if (selectedOption === question.answer) {
        const winEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.games} Correct!`)
          .setColor(COLORS.success)
          .setDescription(`You got it right! The answer was ${question.options[question.answer]}.`)
          .setTimestamp();

        await i.update({ embeds: [winEmbed], components: [] });
        collector.stop();
      } else {
        const loseEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.error} Wrong!`)
          .setColor(COLORS.error)
          .setDescription(`The correct answer was ${question.options[question.answer]}.`)
          .setTimestamp();

        await i.update({ embeds: [loseEmbed], components: [] });
        collector.stop();
      }
    });

    collector.on('end', async (collected) => {
      if (collected.size === 0) {
        const timeoutEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.error} Time's Up!`)
          .setColor(COLORS.error)
          .setDescription(`The correct answer was ${question.options[question.answer]}.`)
          .setTimestamp();

        await message.edit({ embeds: [timeoutEmbed], components: [] });
      }
    });
  }
}

export default TriviaGameCommand;
