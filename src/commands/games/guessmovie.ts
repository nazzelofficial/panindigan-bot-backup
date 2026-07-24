import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class GuessMovieCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'guessmovie',
      description: 'Guess the movie from a quote',
      category: 'games',
      cooldown: 10,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['moviequiz', 'filmquiz'],
      examples: ['/guessmovie', 'p!guessmovie'],
    };
    super(options);
  }

  private movies = [
    { quote: 'Here\'s looking at you, kid.', movie: 'Casablanca' },
    { quote: 'May the Force be with you.', movie: 'Star Wars' },
    { quote: 'I\'ll be back.', movie: 'The Terminator' },
    { quote: 'You can\'t handle the truth!', movie: 'A Few Good Men' },
    { quote: 'To infinity and beyond!', movie: 'Toy Story' },
  ];

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const movie = this.movies[Math.floor(Math.random() * this.movies.length)];
    let attempts = 0;
    const maxAttempts = 3;

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.games} Guess the Movie`)
      .setColor(COLORS.info)
      .setDescription(`Guess the movie from this quote:\n\n"${movie.quote}"\n\nYou have ${maxAttempts} attempts.`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });

    const collector = interaction.channel?.createMessageCollector({
      filter: (m) => m.author.id === interaction.user.id,
      time: 60000,
    });

    collector?.on('collect', async (m) => {
      attempts++;

      if (m.content.toLowerCase().includes(movie.movie.toLowerCase()) || 
          movie.movie.toLowerCase().includes(m.content.toLowerCase())) {
        const winEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.games} You Won!`)
          .setColor(COLORS.success)
          .setDescription(`The movie was "${movie.movie}". You got it in ${attempts} attempts!`)
          .setTimestamp();

        await interaction.editReply({ embeds: [winEmbed] });
        collector.stop();
      } else if (attempts >= maxAttempts) {
        const loseEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.error} Game Over`)
          .setColor(COLORS.error)
          .setDescription(`The movie was "${movie.movie}".`)
          .setTimestamp();

        await interaction.editReply({ embeds: [loseEmbed] });
        collector.stop();
      } else {
        const updateEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.games} Guess the Movie`)
          .setColor(COLORS.info)
          .setDescription(`Wrong! Attempts left: ${maxAttempts - attempts}\n\n"${movie.quote}"`)
          .setTimestamp();

        await interaction.editReply({ embeds: [updateEmbed] });
      }
    });

    collector?.on('end', async (collected) => {
      if (collected.size === 0) {
        const timeoutEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.error} Time's Up!`)
          .setColor(COLORS.error)
          .setDescription(`The movie was "${movie.movie}".`)
          .setTimestamp();

        await interaction.editReply({ embeds: [timeoutEmbed] });
      }
    });
  }

  public async executePrefix(message: Message): Promise<void> {
    const movie = this.movies[Math.floor(Math.random() * this.movies.length)];
    let attempts = 0;
    const maxAttempts = 3;

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.games} Guess the Movie`)
      .setColor(COLORS.info)
      .setDescription(`Guess the movie from this quote:\n\n"${movie.quote}"\n\nYou have ${maxAttempts} attempts.`)
      .setTimestamp();

    await message.reply({ embeds: [embed] });

    const collector = message.channel.createMessageCollector({
      filter: (m) => m.author.id === message.author.id,
      time: 60000,
    });

    collector.on('collect', async (m) => {
      attempts++;

      if (m.content.toLowerCase().includes(movie.movie.toLowerCase()) || 
          movie.movie.toLowerCase().includes(m.content.toLowerCase())) {
        const winEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.games} You Won!`)
          .setColor(COLORS.success)
          .setDescription(`The movie was "${movie.movie}". You got it in ${attempts} attempts!`)
          .setTimestamp();

        await message.edit({ embeds: [winEmbed] });
        collector.stop();
      } else if (attempts >= maxAttempts) {
        const loseEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.error} Game Over`)
          .setColor(COLORS.error)
          .setDescription(`The movie was "${movie.movie}".`)
          .setTimestamp();

        await message.edit({ embeds: [loseEmbed] });
        collector.stop();
      } else {
        const updateEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.games} Guess the Movie`)
          .setColor(COLORS.info)
          .setDescription(`Wrong! Attempts left: ${maxAttempts - attempts}\n\n"${movie.quote}"`)
          .setTimestamp();

        await message.edit({ embeds: [updateEmbed] });
      }
    });

    collector.on('end', async (collected) => {
      if (collected.size === 0) {
        const timeoutEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.error} Time's Up!`)
          .setColor(COLORS.error)
          .setDescription(`The movie was "${movie.movie}".`)
          .setTimestamp();

        await message.edit({ embeds: [timeoutEmbed] });
      }
    });
  }
}

export default GuessMovieCommand;
