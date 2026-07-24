import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, ComponentType, ButtonStyle, ActionRowBuilder, ButtonBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class TriviaCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'trivia',
      description: 'Play a trivia game',
      category: 'games',
      cooldown: 10,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['quiz', 'triviagame'],
      examples: ['/trivia', 'p!trivia'],
    };
    super(options);
  }

  private triviaQuestions = [
    { question: 'What is the capital of France?', options: ['London', 'Berlin', 'Paris', 'Madrid'], answer: 2 },
    { question: 'What is 2 + 2?', options: ['3', '4', '5', '6'], answer: 1 },
    { question: 'Which planet is known as the Red Planet?', options: ['Venus', 'Mars', 'Jupiter', 'Saturn'], answer: 1 },
    { question: 'What is the largest ocean on Earth?', options: ['Atlantic', 'Indian', 'Arctic', 'Pacific'], answer: 3 },
    { question: 'Who wrote Romeo and Juliet?', options: ['Charles Dickens', 'William Shakespeare', 'Jane Austen', 'Mark Twain'], answer: 1 },
  ];

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const question = this.triviaQuestions[Math.floor(Math.random() * this.triviaQuestions.length)];

    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        question.options.map((option, index) => 
          new ButtonBuilder()
            .setCustomId(`trivia_${index}`)
            .setLabel(option)
            .setStyle(ButtonStyle.Primary)
        )
      );

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.games} Trivia`)
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
    const question = this.triviaQuestions[Math.floor(Math.random() * this.triviaQuestions.length)];

    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        question.options.map((option, index) => 
          new ButtonBuilder()
            .setCustomId(`trivia_${index}`)
            .setLabel(option)
            .setStyle(ButtonStyle.Primary)
        )
      );

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.games} Trivia`)
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

export default TriviaCommand;
