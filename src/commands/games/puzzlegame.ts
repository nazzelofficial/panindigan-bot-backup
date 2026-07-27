// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';

export class PuzzleGameCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'puzzlegame',
      description: 'Solve a logic puzzle',
      category: 'games',
      cooldown: 10,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['logicpuzzle', 'riddle'],
      examples: ['/puzzlegame', 'p!puzzlegame'],
    };
    super(options);
  }

  private puzzles = [
    { puzzle: 'I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?', answer: 'an echo' },
    { puzzle: 'The more you take, the more you leave behind. What am I?', answer: 'footsteps' },
    { puzzle: 'I have cities, but no houses. I have mountains, but no trees. I have water, but no fish. What am I?', answer: 'a map' },
    { puzzle: 'What has keys but can\'t open locks?', answer: 'a piano' },
    { puzzle: 'What can travel around the world while staying in a corner?', answer: 'a stamp' },
  ];

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const puzzle = this.puzzles[Math.floor(Math.random() * this.puzzles.length)];
    let attempts = 0;
    const maxAttempts = 3;

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.games} Logic Puzzle`)
      .setColor(COLORS.info)
      .setDescription(`${puzzle.puzzle}\n\nYou have ${maxAttempts} attempts.`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });

    const collector = interaction.channel?.createMessageCollector({
      filter: (m) => m.author.id === interaction.user.id,
      time: 60000,
    });

    collector?.on('collect', async (m) => {
      attempts++;

      if (m.content.toLowerCase().includes(puzzle.answer.toLowerCase()) || 
          puzzle.answer.toLowerCase().includes(m.content.toLowerCase())) {
        const winEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.games} You Won!`)
          .setColor(COLORS.success)
          .setDescription(`The answer was "${puzzle.answer}". You got it in ${attempts} attempts!`)
          .setTimestamp();

        await interaction.editReply({ embeds: [winEmbed] });
        collector.stop();
      } else if (attempts >= maxAttempts) {
        const loseEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.error} Game Over`)
          .setColor(COLORS.error)
          .setDescription(`The answer was "${puzzle.answer}".`)
          .setTimestamp();

        await interaction.editReply({ embeds: [loseEmbed] });
        collector.stop();
      } else {
        const updateEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.games} Logic Puzzle`)
          .setColor(COLORS.info)
          .setDescription(`Wrong! Attempts left: ${maxAttempts - attempts}\n\n${puzzle.puzzle}`)
          .setTimestamp();

        await interaction.editReply({ embeds: [updateEmbed] });
      }
    });

    collector?.on('end', async (collected) => {
      if (collected.size === 0) {
        const timeoutEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.error} Time's Up!`)
          .setColor(COLORS.error)
          .setDescription(`The answer was "${puzzle.answer}".`)
          .setTimestamp();

        await interaction.editReply({ embeds: [timeoutEmbed] });
      }
    });
  }

  public async executePrefix(message: Message): Promise<void> {
    const puzzle = this.puzzles[Math.floor(Math.random() * this.puzzles.length)];
    let attempts = 0;
    const maxAttempts = 3;

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.games} Logic Puzzle`)
      .setColor(COLORS.info)
      .setDescription(`${puzzle.puzzle}\n\nYou have ${maxAttempts} attempts.`)
      .setTimestamp();

    await message.reply({ embeds: [embed] });

    const collector = message.channel.createMessageCollector({
      filter: (m) => m.author.id === message.author.id,
      time: 60000,
    });

    collector.on('collect', async (m) => {
      attempts++;

      if (m.content.toLowerCase().includes(puzzle.answer.toLowerCase()) || 
          puzzle.answer.toLowerCase().includes(m.content.toLowerCase())) {
        const winEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.games} You Won!`)
          .setColor(COLORS.success)
          .setDescription(`The answer was "${puzzle.answer}". You got it in ${attempts} attempts!`)
          .setTimestamp();

        await message.edit({ embeds: [winEmbed] });
        collector.stop();
      } else if (attempts >= maxAttempts) {
        const loseEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.error} Game Over`)
          .setColor(COLORS.error)
          .setDescription(`The answer was "${puzzle.answer}".`)
          .setTimestamp();

        await message.edit({ embeds: [loseEmbed] });
        collector.stop();
      } else {
        const updateEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.games} Logic Puzzle`)
          .setColor(COLORS.info)
          .setDescription(`Wrong! Attempts left: ${maxAttempts - attempts}\n\n${puzzle.puzzle}`)
          .setTimestamp();

        await message.edit({ embeds: [updateEmbed] });
      }
    });

    collector.on('end', async (collected) => {
      if (collected.size === 0) {
        const timeoutEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.error} Time's Up!`)
          .setColor(COLORS.error)
          .setDescription(`The answer was "${puzzle.answer}".`)
          .setTimestamp();

        await message.edit({ embeds: [timeoutEmbed] });
      }
    });
  }
}

export default PuzzleGameCommand;
