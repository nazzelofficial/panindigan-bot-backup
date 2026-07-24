import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class GuessNumberGameCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'guessnumbergame',
      description: 'Guess a number between 1 and 100',
      category: 'games',
      cooldown: 10,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['numberguess'],
      examples: ['/guessnumbergame', 'p!guessnumbergame'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const targetNumber = Math.floor(Math.random() * 100) + 1;
    let attempts = 0;
    const maxAttempts = 7;

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.games} Guess the Number`)
      .setColor(COLORS.info)
      .setDescription(`I'm thinking of a number between 1 and 100. You have ${maxAttempts} attempts to guess it!`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });

    const collector = interaction.channel?.createMessageCollector({
      filter: (m) => m.author.id === interaction.user.id,
      time: 120000,
    });

    collector?.on('collect', async (m) => {
      attempts++;
      const guess = parseInt(m.content);

      if (isNaN(guess) || guess < 1 || guess > 100) {
        await m.reply('Please enter a valid number between 1 and 100.');
        return;
      }

      if (guess === targetNumber) {
        const winEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.games} You Won!`)
          .setColor(COLORS.success)
          .setDescription(`You guessed the number ${targetNumber} in ${attempts} attempts!`)
          .setTimestamp();

        await interaction.editReply({ embeds: [winEmbed] });
        collector.stop();
      } else if (attempts >= maxAttempts) {
        const loseEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.error} Game Over`)
          .setColor(COLORS.error)
          .setDescription(`The number was ${targetNumber}.`)
          .setTimestamp();

        await interaction.editReply({ embeds: [loseEmbed] });
        collector.stop();
      } else {
        const hint = guess < targetNumber ? 'higher' : 'lower';
        const updateEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.games} Guess the Number`)
          .setColor(COLORS.info)
          .setDescription(`${guess} is too ${hint}! Attempts left: ${maxAttempts - attempts}`)
          .setTimestamp();

        await interaction.editReply({ embeds: [updateEmbed] });
      }
    });

    collector?.on('end', async (collected) => {
      if (collected.size === 0) {
        const timeoutEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.error} Time's Up!`)
          .setColor(COLORS.error)
          .setDescription(`The number was ${targetNumber}.`)
          .setTimestamp();

        await interaction.editReply({ embeds: [timeoutEmbed] });
      }
    });
  }

  public async executePrefix(message: Message): Promise<void> {
    const targetNumber = Math.floor(Math.random() * 100) + 1;
    let attempts = 0;
    const maxAttempts = 7;

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.games} Guess the Number`)
      .setColor(COLORS.info)
      .setDescription(`I'm thinking of a number between 1 and 100. You have ${maxAttempts} attempts to guess it!`)
      .setTimestamp();

    await message.reply({ embeds: [embed] });

    const collector = message.channel.createMessageCollector({
      filter: (m) => m.author.id === message.author.id,
      time: 120000,
    });

    collector.on('collect', async (m) => {
      attempts++;
      const guess = parseInt(m.content);

      if (isNaN(guess) || guess < 1 || guess > 100) {
        await m.reply('Please enter a valid number between 1 and 100.');
        return;
      }

      if (guess === targetNumber) {
        const winEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.games} You Won!`)
          .setColor(COLORS.success)
          .setDescription(`You guessed the number ${targetNumber} in ${attempts} attempts!`)
          .setTimestamp();

        await message.edit({ embeds: [winEmbed] });
        collector.stop();
      } else if (attempts >= maxAttempts) {
        const loseEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.error} Game Over`)
          .setColor(COLORS.error)
          .setDescription(`The number was ${targetNumber}.`)
          .setTimestamp();

        await message.edit({ embeds: [loseEmbed] });
        collector.stop();
      } else {
        const hint = guess < targetNumber ? 'higher' : 'lower';
        const updateEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.games} Guess the Number`)
          .setColor(COLORS.info)
          .setDescription(`${guess} is too ${hint}! Attempts left: ${maxAttempts - attempts}`)
          .setTimestamp();

        await message.edit({ embeds: [updateEmbed] });
      }
    });

    collector.on('end', async (collected) => {
      if (collected.size === 0) {
        const timeoutEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.error} Time's Up!`)
          .setColor(COLORS.error)
          .setDescription(`The number was ${targetNumber}.`)
          .setTimestamp();

        await message.edit({ embeds: [timeoutEmbed] });
      }
    });
  }
}

export default GuessNumberGameCommand;
