import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, ComponentType, ButtonStyle, ActionRowBuilder, ButtonBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class MathQuizCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'mathquiz',
      description: 'Play a math quiz game',
      category: 'games',
      cooldown: 10,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['math', 'quiz'],
      examples: ['/mathquiz', 'p!mathquiz'],
    };
    super(options);
  }

  private generateQuestion(): { question: string; answer: number; options: number[] } {
    const operations = ['+', '-', '*'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    let num1 = Math.floor(Math.random() * 20) + 1;
    let num2 = Math.floor(Math.random() * 20) + 1;
    let answer: number;

    switch (operation) {
      case '+':
        answer = num1 + num2;
        break;
      case '-':
        if (num1 < num2) [num1, num2] = [num2, num1];
        answer = num1 - num2;
        break;
      case '*':
        num1 = Math.floor(Math.random() * 10) + 1;
        num2 = Math.floor(Math.random() * 10) + 1;
        answer = num1 * num2;
        break;
      default:
        answer = num1 + num2;
    }

    const options = new Set<number>();
    options.add(answer);
    while (options.size < 4) {
      const wrongAnswer = answer + Math.floor(Math.random() * 10) - 5;
      if (wrongAnswer !== answer && wrongAnswer >= 0) {
        options.add(wrongAnswer);
      }
    }

    return {
      question: `${num1} ${operation} ${num2} = ?`,
      answer,
      options: Array.from(options).sort(() => Math.random() - 0.5),
    };
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const { question, answer, options } = this.generateQuestion();

    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        options.map((option) =>
          new ButtonBuilder()
            .setCustomId(`math_${option}`)
            .setLabel(option.toString())
            .setStyle(ButtonStyle.Primary)
        )
      );

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.games} Math Quiz`)
      .setColor(COLORS.info)
      .setDescription(`Solve: ${question}`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed], components: [row] });

    const collector = interaction.channel?.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 30000,
    });

    collector?.on('collect', async (i) => {
      const selectedAnswer = parseInt(i.customId.split('_')[1]);

      if (selectedAnswer === answer) {
        const winEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.games} Correct!`)
          .setColor(COLORS.success)
          .setDescription(`The answer was ${answer}.`)
          .setTimestamp();

        await i.update({ embeds: [winEmbed], components: [] });
        collector.stop();
      } else {
        const loseEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.error} Wrong!`)
          .setColor(COLORS.error)
          .setDescription(`The correct answer was ${answer}.`)
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
          .setDescription(`The correct answer was ${answer}.`)
          .setTimestamp();

        await interaction.editReply({ embeds: [timeoutEmbed], components: [] });
      }
    });
  }

  public async executePrefix(message: Message): Promise<void> {
    const { question, answer, options } = this.generateQuestion();

    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        options.map((option) =>
          new ButtonBuilder()
            .setCustomId(`math_${option}`)
            .setLabel(option.toString())
            .setStyle(ButtonStyle.Primary)
        )
      );

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.games} Math Quiz`)
      .setColor(COLORS.info)
      .setDescription(`Solve: ${question}`)
      .setTimestamp();

    await message.reply({ embeds: [embed], components: [row] });

    const collector = message.channel.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 30000,
    });

    collector.on('collect', async (i) => {
      const selectedAnswer = parseInt(i.customId.split('_')[1]);

      if (selectedAnswer === answer) {
        const winEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.games} Correct!`)
          .setColor(COLORS.success)
          .setDescription(`The answer was ${answer}.`)
          .setTimestamp();

        await i.update({ embeds: [winEmbed], components: [] });
        collector.stop();
      } else {
        const loseEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.error} Wrong!`)
          .setColor(COLORS.error)
          .setDescription(`The correct answer was ${answer}.`)
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
          .setDescription(`The correct answer was ${answer}.`)
          .setTimestamp();

        await message.edit({ embeds: [timeoutEmbed], components: [] });
      }
    });
  }
}

export default MathQuizCommand;
