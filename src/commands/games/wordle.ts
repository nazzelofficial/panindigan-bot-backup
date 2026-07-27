// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';

export class WordleCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'wordle',
      description: 'Play a wordle-style word guessing game',
      category: 'games',
      cooldown: 10,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['wordguess', 'word'],
      examples: ['/wordle', 'p!wordle'],
    };
    super(options);
  }

  private words = ['apple', 'beach', 'chair', 'dance', 'eagle', 'flame', 'grape', 'house', 'image', 'jolly', 'knife', 'lemon', 'money', 'night', 'ocean', 'piano', 'quiet', 'radio', 'snake', 'tiger', 'unity', 'video', 'water', 'xenon', 'yacht', 'zebra'];

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const targetWord = this.words[Math.floor(Math.random() * this.words.length)];
    let attempts = 0;
    const maxAttempts = 6;

    const checkGuess = (guess: string) => {
      const result = [];
      const targetLetters = targetWord.split('');
      const guessLetters = guess.split('');

      for (let i = 0; i < 5; i++) {
        if (guessLetters[i] === targetLetters[i]) {
          result[i] = '🟩';
          targetLetters[i] = null;
          guessLetters[i] = null;
        }
      }

      for (let i = 0; i < 5; i++) {
        if (guessLetters[i] && targetLetters.includes(guessLetters[i])) {
          result[i] = '🟨';
          targetLetters[targetLetters.indexOf(guessLetters[i])] = null;
        } else if (guessLetters[i]) {
          result[i] = '⬛';
        }
      }

      return result.join('');
    };

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.games} Wordle`)
      .setColor(COLORS.info)
      .setDescription(`Guess a 5-letter word! You have ${maxAttempts} attempts.\n🟩 = Correct letter, correct position\n🟨 = Correct letter, wrong position\n⬛ = Wrong letter`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });

    const collector = interaction.channel?.createMessageCollector({
      filter: (m) => m.author.id === interaction.user.id && m.content.length === 5 && /^[a-z]+$/i.test(m.content),
      time: 300000,
    });

    const results: string[] = [];

    collector?.on('collect', async (m) => {
      const guess = m.content.toLowerCase();
      attempts++;

      const result = checkGuess(guess);
      results.push(result);

      if (guess === targetWord) {
        const winEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.games} You Won!`)
          .setColor(COLORS.success)
          .setDescription(`You guessed the word "${targetWord}" in ${attempts} attempts!\n\n${results.join('\n')}`)
          .setTimestamp();

        await interaction.editReply({ embeds: [winEmbed] });
        collector.stop();
      } else if (attempts >= maxAttempts) {
        const loseEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.error} Game Over`)
          .setColor(COLORS.error)
          .setDescription(`The word was "${targetWord}".\n\n${results.join('\n')}`)
          .setTimestamp();

        await interaction.editReply({ embeds: [loseEmbed] });
        collector.stop();
      } else {
        const updateEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.games} Wordle`)
          .setColor(COLORS.info)
          .setDescription(`Attempts left: ${maxAttempts - attempts}\n\n${results.join('\n')}`)
          .setTimestamp();

        await interaction.editReply({ embeds: [updateEmbed] });
      }
    });

    collector?.on('end', async (collected) => {
      if (collected.size === 0) {
        const timeoutEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.error} Time's Up!`)
          .setColor(COLORS.error)
          .setDescription(`The word was "${targetWord}".`)
          .setTimestamp();

        await interaction.editReply({ embeds: [timeoutEmbed] });
      }
    });
  }

  public async executePrefix(message: Message): Promise<void> {
    const targetWord = this.words[Math.floor(Math.random() * this.words.length)];
    let attempts = 0;
    const maxAttempts = 6;

    const checkGuess = (guess: string) => {
      const result = [];
      const targetLetters = targetWord.split('');
      const guessLetters = guess.split('');

      for (let i = 0; i < 5; i++) {
        if (guessLetters[i] === targetLetters[i]) {
          result[i] = '🟩';
          targetLetters[i] = null;
          guessLetters[i] = null;
        }
      }

      for (let i = 0; i < 5; i++) {
        if (guessLetters[i] && targetLetters.includes(guessLetters[i])) {
          result[i] = '🟨';
          targetLetters[targetLetters.indexOf(guessLetters[i])] = null;
        } else if (guessLetters[i]) {
          result[i] = '⬛';
        }
      }

      return result.join('');
    };

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.games} Wordle`)
      .setColor(COLORS.info)
      .setDescription(`Guess a 5-letter word! You have ${maxAttempts} attempts.\n🟩 = Correct letter, correct position\n🟨 = Correct letter, wrong position\n⬛ = Wrong letter`)
      .setTimestamp();

    await message.reply({ embeds: [embed] });

    const collector = message.channel.createMessageCollector({
      filter: (m) => m.author.id === message.author.id && m.content.length === 5 && /^[a-z]+$/i.test(m.content),
      time: 300000,
    });

    const results: string[] = [];

    collector.on('collect', async (m) => {
      const guess = m.content.toLowerCase();
      attempts++;

      const result = checkGuess(guess);
      results.push(result);

      if (guess === targetWord) {
        const winEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.games} You Won!`)
          .setColor(COLORS.success)
          .setDescription(`You guessed the word "${targetWord}" in ${attempts} attempts!\n\n${results.join('\n')}`)
          .setTimestamp();

        await message.edit({ embeds: [winEmbed] });
        collector.stop();
      } else if (attempts >= maxAttempts) {
        const loseEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.error} Game Over`)
          .setColor(COLORS.error)
          .setDescription(`The word was "${targetWord}".\n\n${results.join('\n')}`)
          .setTimestamp();

        await message.edit({ embeds: [loseEmbed] });
        collector.stop();
      } else {
        const updateEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.games} Wordle`)
          .setColor(COLORS.info)
          .setDescription(`Attempts left: ${maxAttempts - attempts}\n\n${results.join('\n')}`)
          .setTimestamp();

        await message.edit({ embeds: [updateEmbed] });
      }
    });

    collector.on('end', async (collected) => {
      if (collected.size === 0) {
        const timeoutEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.error} Time's Up!`)
          .setColor(COLORS.error)
          .setDescription(`The word was "${targetWord}".`)
          .setTimestamp();

        await message.edit({ embeds: [timeoutEmbed] });
      }
    });
  }
}

export default WordleCommand;
