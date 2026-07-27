// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';

export class HangmanCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'hangman',
      description: 'Play hangman',
      category: 'games',
      cooldown: 10,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['hang'],
      examples: ['/hangman', 'p!hangman'],
    };
    super(options);
  }

  private words = ['discord', 'programming', 'javascript', 'typescript', 'bot', 'server', 'channel', 'message', 'user', 'guild'];

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const word = this.words[Math.floor(Math.random() * this.words.length)];
    const guessed = new Set<string>();
    let wrongGuesses = 0;
    const maxWrong = 6;

    const displayWord = () => word.split('').map((letter) => guessed.has(letter) ? letter : '_').join(' ');
    const displayHangman = () => {
      const stages = [
        '',
        '  O',
        '  O\n  |',
        '  O\n /|',
        '  O\n /|\\',
        '  O\n /|\\\n /',
        '  O\n /|\\\n / \\',
      ];
      return stages[wrongGuesses] || stages[stages.length - 1];
    };

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.games} Hangman`)
      .setColor(COLORS.info)
      .setDescription(`\`\`\`\n${displayHangman()}\n\n${displayWord()}\n\`\`\`\nGuess a letter!`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });

    const collector = interaction.channel?.createMessageCollector({
      filter: (m) => m.author.id === interaction.user.id && m.content.length === 1 && /[a-z]/i.test(m.content),
      time: 60000,
    });

    collector?.on('collect', async (m) => {
      const guess = m.content.toLowerCase();

      if (guessed.has(guess)) {
        await m.reply('You already guessed that letter!');
        return;
      }

      guessed.add(guess);

      if (!word.includes(guess)) {
        wrongGuesses++;
      }

      const currentWord = displayWord();
      const hangmanDisplay = displayHangman();

      if (!currentWord.includes('_')) {
        const winEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.games} You Won!`)
          .setColor(COLORS.success)
          .setDescription(`The word was: ${word}`)
          .setTimestamp();

        await interaction.editReply({ embeds: [winEmbed] });
        collector.stop();
      } else if (wrongGuesses >= maxWrong) {
        const loseEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.error} Game Over`)
          .setColor(COLORS.error)
          .setDescription(`The word was: ${word}`)
          .setTimestamp();

        await interaction.editReply({ embeds: [loseEmbed] });
        collector.stop();
      } else {
        const updateEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.games} Hangman`)
          .setColor(COLORS.info)
          .setDescription(`\`\`\`\n${hangmanDisplay}\n\n${currentWord}\n\`\`\`\nGuess a letter!`)
          .setTimestamp();

        await interaction.editReply({ embeds: [updateEmbed] });
      }
    });

    collector?.on('end', async (collected) => {
      if (collected.size === 0) {
        const timeoutEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.error} Time's Up!`)
          .setColor(COLORS.error)
          .setDescription(`The word was: ${word}`)
          .setTimestamp();

        await interaction.editReply({ embeds: [timeoutEmbed] });
      }
    });
  }

  public async executePrefix(message: Message): Promise<void> {
    const word = this.words[Math.floor(Math.random() * this.words.length)];
    const guessed = new Set<string>();
    let wrongGuesses = 0;
    const maxWrong = 6;

    const displayWord = () => word.split('').map((letter) => guessed.has(letter) ? letter : '_').join(' ');
    const displayHangman = () => {
      const stages = [
        '',
        '  O',
        '  O\n  |',
        '  O\n /|',
        '  O\n /|\\',
        '  O\n /|\\\n /',
        '  O\n /|\\\n / \\',
      ];
      return stages[wrongGuesses] || stages[stages.length - 1];
    };

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.games} Hangman`)
      .setColor(COLORS.info)
      .setDescription(`\`\`\`\n${displayHangman()}\n\n${displayWord()}\n\`\`\`\nGuess a letter!`)
      .setTimestamp();

    await message.reply({ embeds: [embed] });

    const collector = message.channel.createMessageCollector({
      filter: (m) => m.author.id === message.author.id && m.content.length === 1 && /[a-z]/i.test(m.content),
      time: 60000,
    });

    collector.on('collect', async (m) => {
      const guess = m.content.toLowerCase();

      if (guessed.has(guess)) {
        await m.reply('You already guessed that letter!');
        return;
      }

      guessed.add(guess);

      if (!word.includes(guess)) {
        wrongGuesses++;
      }

      const currentWord = displayWord();
      const hangmanDisplay = displayHangman();

      if (!currentWord.includes('_')) {
        const winEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.games} You Won!`)
          .setColor(COLORS.success)
          .setDescription(`The word was: ${word}`)
          .setTimestamp();

        await message.edit({ embeds: [winEmbed] });
        collector.stop();
      } else if (wrongGuesses >= maxWrong) {
        const loseEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.error} Game Over`)
          .setColor(COLORS.error)
          .setDescription(`The word was: ${word}`)
          .setTimestamp();

        await message.edit({ embeds: [loseEmbed] });
        collector.stop();
      } else {
        const updateEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.games} Hangman`)
          .setColor(COLORS.info)
          .setDescription(`\`\`\`\n${hangmanDisplay}\n\n${currentWord}\n\`\`\`\nGuess a letter!`)
          .setTimestamp();

        await message.edit({ embeds: [updateEmbed] });
      }
    });

    collector.on('end', async (collected) => {
      if (collected.size === 0) {
        const timeoutEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.error} Time's Up!`)
          .setColor(COLORS.error)
          .setDescription(`The word was: ${word}`)
          .setTimestamp();

        await message.edit({ embeds: [timeoutEmbed] });
      }
    });
  }
}

export default HangmanCommand;
