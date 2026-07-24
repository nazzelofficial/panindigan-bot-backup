import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class QuickMathCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'quickmath',
      description: 'Solve math problems quickly',
      category: 'games',
      cooldown: 10,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['math', 'arithmetic'],
      examples: ['/quickmath', 'p!quickmath'],
    };
    super(options);
  }

  private generateProblem(): { question: string; answer: number } {
    const operations = ['+', '-', '*'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    let num1: number;
    let num2: number;
    let answer: number;
    let question: string;

    switch (operation) {
      case '+':
        num1 = Math.floor(Math.random() * 100) + 1;
        num2 = Math.floor(Math.random() * 100) + 1;
        answer = num1 + num2;
        question = `${num1} + ${num2}`;
        break;
      case '-':
        num1 = Math.floor(Math.random() * 100) + 1;
        num2 = Math.floor(Math.random() * num1) + 1;
        answer = num1 - num2;
        question = `${num1} - ${num2}`;
        break;
      case '*':
        num1 = Math.floor(Math.random() * 12) + 1;
        num2 = Math.floor(Math.random() * 12) + 1;
        answer = num1 * num2;
        question = `${num1} × ${num2}`;
        break;
      default:
        num1 = Math.floor(Math.random() * 100) + 1;
        num2 = Math.floor(Math.random() * 100) + 1;
        answer = num1 + num2;
        question = `${num1} + ${num2}`;
    }

    return { question, answer };
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const problem = this.generateProblem();
    let attempts = 0;
    const maxAttempts = 3;

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.games} Quick Math`)
      .setColor(COLORS.info)
      .setDescription(`Solve: ${problem.question} = ?\n\nYou have ${maxAttempts} attempts.`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });

    const collector = interaction.channel?.createMessageCollector({
      filter: (m) => m.author.id === interaction.user.id,
      time: 60000,
    });

    collector?.on('collect', async (m) => {
      attempts++;
      const userAnswer = parseInt(m.content);

      if (isNaN(userAnswer)) {
        await m.reply('Please enter a valid number.');
        return;
      }

      if (userAnswer === problem.answer) {
        const winEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.games} Correct!`)
          .setColor(COLORS.success)
          .setDescription(`${problem.question} = ${problem.answer}\nYou got it in ${attempts} attempts!`)
          .setTimestamp();

        await interaction.editReply({ embeds: [winEmbed] });
        collector.stop();
      } else if (attempts >= maxAttempts) {
        const loseEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.error} Game Over`)
          .setColor(COLORS.error)
          .setDescription(`${problem.question} = ${problem.answer}`)
          .setTimestamp();

        await interaction.editReply({ embeds: [loseEmbed] });
        collector.stop();
      } else {
        const updateEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.games} Quick Math`)
          .setColor(COLORS.info)
          .setDescription(`Wrong! Attempts left: ${maxAttempts - attempts}\n\nSolve: ${problem.question} = ?`)
          .setTimestamp();

        await interaction.editReply({ embeds: [updateEmbed] });
      }
    });

    collector?.on('end', async (collected) => {
      if (collected.size === 0) {
        const timeoutEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.error} Time's Up!`)
          .setColor(COLORS.error)
          .setDescription(`${problem.question} = ${problem.answer}`)
          .setTimestamp();

        await interaction.editReply({ embeds: [timeoutEmbed] });
      }
    });
  }

  public async executePrefix(message: Message): Promise<void> {
    const problem = this.generateProblem();
    let attempts = 0;
    const maxAttempts = 3;

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.games} Quick Math`)
      .setColor(COLORS.info)
      .setDescription(`Solve: ${problem.question} = ?\n\nYou have ${maxAttempts} attempts.`)
      .setTimestamp();

    await message.reply({ embeds: [embed] });

    const collector = message.channel.createMessageCollector({
      filter: (m) => m.author.id === message.author.id,
      time: 60000,
    });

    collector.on('collect', async (m) => {
      attempts++;
      const userAnswer = parseInt(m.content);

      if (isNaN(userAnswer)) {
        await m.reply('Please enter a valid number.');
        return;
      }

      if (userAnswer === problem.answer) {
        const winEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.games} Correct!`)
          .setColor(COLORS.success)
          .setDescription(`${problem.question} = ${problem.answer}\nYou got it in ${attempts} attempts!`)
          .setTimestamp();

        await message.edit({ embeds: [winEmbed] });
        collector.stop();
      } else if (attempts >= maxAttempts) {
        const loseEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.error} Game Over`)
          .setColor(COLORS.error)
          .setDescription(`${problem.question} = ${problem.answer}`)
          .setTimestamp();

        await message.edit({ embeds: [loseEmbed] });
        collector.stop();
      } else {
        const updateEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.games} Quick Math`)
          .setColor(COLORS.info)
          .setDescription(`Wrong! Attempts left: ${maxAttempts - attempts}\n\nSolve: ${problem.question} = ?`)
          .setTimestamp();

        await message.edit({ embeds: [updateEmbed] });
      }
    });

    collector.on('end', async (collected) => {
      if (collected.size === 0) {
        const timeoutEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.error} Time's Up!`)
          .setColor(COLORS.error)
          .setDescription(`${problem.question} = ${problem.answer}`)
          .setTimestamp();

        await message.edit({ embeds: [timeoutEmbed] });
      }
    });
  }
}

export default QuickMathCommand;
