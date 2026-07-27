// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, ComponentType, ButtonStyle, ActionRowBuilder, ButtonBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class QuizGameCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'quizgame',
            description: 'Play a general knowledge quiz',
            category: 'games',
            cooldown: 10,
            userPermissions: [],
            botPermissions: [],
            guildOnly: false,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['quiz', 'gkquiz'],
            examples: ['/quizgame', 'p!quizgame'],
        };
        super(options);
    }
    questions = [
        { question: 'What is the capital of Japan?', options: ['Seoul', 'Tokyo', 'Beijing', 'Bangkok'], answer: 1 },
        { question: 'What is the largest planet in our solar system?', options: ['Earth', 'Mars', 'Jupiter', 'Saturn'], answer: 2 },
        { question: 'Who painted the Mona Lisa?', options: ['Van Gogh', 'Picasso', 'Da Vinci', 'Michelangelo'], answer: 2 },
        { question: 'What year did World War II end?', options: ['1943', '1944', '1945', '1946'], answer: 2 },
        { question: 'What is the chemical symbol for gold?', options: ['Go', 'Gd', 'Au', 'Ag'], answer: 2 },
    ];
    async executeSlash(interaction) {
        const question = this.questions[Math.floor(Math.random() * this.questions.length)];
        const row = new ActionRowBuilder()
            .addComponents(question.options.map((option, index) => new ButtonBuilder()
            .setCustomId(`quiz_${index}`)
            .setLabel(option)
            .setStyle(ButtonStyle.Primary)));
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.games} Quiz`)
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
            }
            else {
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
    async executePrefix(message) {
        const question = this.questions[Math.floor(Math.random() * this.questions.length)];
        const row = new ActionRowBuilder()
            .addComponents(question.options.map((option, index) => new ButtonBuilder()
            .setCustomId(`quiz_${index}`)
            .setLabel(option)
            .setStyle(ButtonStyle.Primary)));
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.games} Quiz`)
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
            }
            else {
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
export default QuizGameCommand;
