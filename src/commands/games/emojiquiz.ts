import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class EmojiQuizCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'emojiquiz',
      description: 'Guess the meaning of the emoji combination',
      category: 'games',
      cooldown: 10,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['emojigame'],
      examples: ['/emojiquiz', 'p!emojiquiz'],
    };
    super(options);
  }

  private quizzes = [
    { emojis: '🌧️☔', answer: 'rainy' },
    { emojis: '☀️🌡️', answer: 'hot' },
    { emojis: '❄️🥶', answer: 'cold' },
    { emojis: '🎂🎉', answer: 'birthday' },
    { emojis: '📚🎓', answer: 'graduation' },
    { emojis: '🏃💨', answer: 'running' },
    { emojis: '🍔🍟', answer: 'fast food' },
    { emojis: '🎬🍿', answer: 'movie' },
  ];

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const quiz = this.quizzes[Math.floor(Math.random() * this.quizzes.length)];
    let attempts = 0;
    const maxAttempts = 3;

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.games} Emoji Quiz`)
      .setColor(COLORS.info)
      .setDescription(`What does this mean: ${quiz.emojis}\n\nYou have ${maxAttempts} attempts.`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });

    const collector = interaction.channel?.createMessageCollector({
      filter: (m) => m.author.id === interaction.user.id,
      time: 60000,
    });

    collector?.on('collect', async (m) => {
      attempts++;

      if (m.content.toLowerCase().includes(quiz.answer.toLowerCase()) || 
          quiz.answer.toLowerCase().includes(m.content.toLowerCase())) {
        const winEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.games} You Won!`)
          .setColor(COLORS.success)
          .setDescription(`The answer was "${quiz.answer}". You got it in ${attempts} attempts!`)
          .setTimestamp();

        await interaction.editReply({ embeds: [winEmbed] });
        collector.stop();
      } else if (attempts >= maxAttempts) {
        const loseEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.error} Game Over`)
          .setColor(COLORS.error)
          .setDescription(`The answer was "${quiz.answer}".`)
          .setTimestamp();

        await interaction.editReply({ embeds: [loseEmbed] });
        collector.stop();
      } else {
        const updateEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.games} Emoji Quiz`)
          .setColor(COLORS.info)
          .setDescription(`Wrong! Attempts left: ${maxAttempts - attempts}\n\nWhat does this mean: ${quiz.emojis}`)
          .setTimestamp();

        await interaction.editReply({ embeds: [updateEmbed] });
      }
    });

    collector?.on('end', async (collected) => {
      if (collected.size === 0) {
        const timeoutEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.error} Time's Up!`)
          .setColor(COLORS.error)
          .setDescription(`The answer was "${quiz.answer}".`)
          .setTimestamp();

        await interaction.editReply({ embeds: [timeoutEmbed] });
      }
    });
  }

  public async executePrefix(message: Message): Promise<void> {
    const quiz = this.quizzes[Math.floor(Math.random() * this.quizzes.length)];
    let attempts = 0;
    const maxAttempts = 3;

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.games} Emoji Quiz`)
      .setColor(COLORS.info)
      .setDescription(`What does this mean: ${quiz.emojis}\n\nYou have ${maxAttempts} attempts.`)
      .setTimestamp();

    await message.reply({ embeds: [embed] });

    const collector = message.channel.createMessageCollector({
      filter: (m) => m.author.id === message.author.id,
      time: 60000,
    });

    collector.on('collect', async (m) => {
      attempts++;

      if (m.content.toLowerCase().includes(quiz.answer.toLowerCase()) || 
          quiz.answer.toLowerCase().includes(m.content.toLowerCase())) {
        const winEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.games} You Won!`)
          .setColor(COLORS.success)
          .setDescription(`The answer was "${quiz.answer}". You got it in ${attempts} attempts!`)
          .setTimestamp();

        await message.edit({ embeds: [winEmbed] });
        collector.stop();
      } else if (attempts >= maxAttempts) {
        const loseEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.error} Game Over`)
          .setColor(COLORS.error)
          .setDescription(`The answer was "${quiz.answer}".`)
          .setTimestamp();

        await message.edit({ embeds: [loseEmbed] });
        collector.stop();
      } else {
        const updateEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.games} Emoji Quiz`)
          .setColor(COLORS.info)
          .setDescription(`Wrong! Attempts left: ${maxAttempts - attempts}\n\nWhat does this mean: ${quiz.emojis}`)
          .setTimestamp();

        await message.edit({ embeds: [updateEmbed] });
      }
    });

    collector.on('end', async (collected) => {
      if (collected.size === 0) {
        const timeoutEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.error} Time's Up!`)
          .setColor(COLORS.error)
          .setDescription(`The answer was "${quiz.answer}".`)
          .setTimestamp();

        await message.edit({ embeds: [timeoutEmbed] });
      }
    });
  }
}

export default EmojiQuizCommand;
