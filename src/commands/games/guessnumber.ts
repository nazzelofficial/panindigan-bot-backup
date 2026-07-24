import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class GuessNumberCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'guessnumber',
      description: 'Guess a number between 1 and 100',
      category: 'games',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['guess', 'numberguess'],
      examples: ['/guessnumber', 'p!guessnumber'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const targetNumber = Math.floor(Math.random() * 100) + 1;
    let attempts = 0;
    const maxAttempts = 10;

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.games} Guess the Number`)
      .setColor(COLORS.info)
      .setDescription(`I'm thinking of a number between 1 and 100. You have ${maxAttempts} attempts to guess it!`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });

    const collector = interaction.channel?.createMessageCollector({
      filter: (m) => m.author.id === interaction.user.id && !isNaN(parseInt(m.content)),
      time: 60000,
    });

    collector?.on('collect', async (m) => {
      const guess = parseInt(m.content);
      attempts++;

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
          .setDescription(`You ran out of attempts. The number was ${targetNumber}.`)
          .setTimestamp();

        await interaction.editReply({ embeds: [loseEmbed] });
        collector.stop();
      } else {
        const hint = guess < targetNumber ? 'higher' : 'lower';
        const updateEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.games} Guess the Number`)
          .setColor(COLORS.info)
          .setDescription(`Guess ${hint}! Attempts left: ${maxAttempts - attempts}`)
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
    const maxAttempts = 10;

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.games} Guess the Number`)
      .setColor(COLORS.info)
      .setDescription(`I'm thinking of a number between 1 and 100. You have ${maxAttempts} attempts to guess it!`)
      .setTimestamp();

    await message.reply({ embeds: [embed] });

    const collector = message.channel.createMessageCollector({
      filter: (m) => m.author.id === message.author.id && !isNaN(parseInt(m.content)),
      time: 60000,
    });

    collector.on('collect', async (m) => {
      const guess = parseInt(m.content);
      attempts++;

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
          .setDescription(`You ran out of attempts. The number was ${targetNumber}.`)
          .setTimestamp();

        await message.edit({ embeds: [loseEmbed] });
        collector.stop();
      } else {
        const hint = guess < targetNumber ? 'higher' : 'lower';
        const updateEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.games} Guess the Number`)
          .setColor(COLORS.info)
          .setDescription(`Guess ${hint}! Attempts left: ${maxAttempts - attempts}`)
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

export default GuessNumberCommand;
