// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, SlashCommandBuilder, } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
const QUESTION_TYPES = ['discussion', 'trivia', 'debate', 'icebreaker', 'interview', 'philosophical'];
export class QuestionCommand extends BaseCommand {
    constructor() {
        super({
            name: 'question',
            description: 'Generate AI-powered questions for discussion, trivia, or debate',
            category: 'ai',
            premiumTier: 'bronze',
            cooldown: 10,
            userPermissions: [],
            botPermissions: [],
            guildOnly: false,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['generatequestions', 'discuss', 'askquestions'],
            examples: [
                '/question topic:climate change type:debate count:5',
                'p!question philosophy',
                'p!question debate artificial intelligence',
            ],
        });
    }
    buildSlashCommand() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption(o => o.setName('topic')
            .setDescription('The topic to generate questions about')
            .setRequired(true)
            .setMaxLength(200))
            .addStringOption(o => o.setName('type')
            .setDescription('Type of questions to generate (default: discussion)')
            .setRequired(false)
            .addChoices({ name: 'Discussion', value: 'discussion' }, { name: 'Trivia', value: 'trivia' }, { name: 'Debate', value: 'debate' }, { name: 'Icebreaker', value: 'icebreaker' }, { name: 'Interview', value: 'interview' }, { name: 'Philosophical', value: 'philosophical' }))
            .addIntegerOption(o => o.setName('count')
            .setDescription('Number of questions to generate (1–10, default: 5)')
            .setRequired(false)
            .setMinValue(1)
            .setMaxValue(10));
    }
    async generateQuestions(client, topic, type, count) {
        const typeDescriptions = {
            discussion: 'thought-provoking open-ended discussion questions',
            trivia: 'interesting trivia questions with answers',
            debate: 'debate-worthy controversial questions that have two clear sides',
            icebreaker: 'fun, light-hearted icebreaker questions to start a conversation',
            interview: 'professional interview questions suitable for hiring',
            philosophical: 'deep philosophical questions that explore meaning and existence',
        };
        const systemPrompt = `You are an expert question generator for Discord communities.
Generate exactly ${count} ${typeDescriptions[type] || 'discussion questions'} about the given topic.
Format your response as a numbered list (1. 2. 3. etc.).
Each question should be clear, engaging, and appropriate for a Discord server.
${type === 'trivia' ? 'For trivia, include the answer in parentheses after the question.' : ''}
Keep each question concise (under 150 characters ideally).`;
        const response = await client.aiHandler.generateTaskResponse(`Generate ${count} ${type} questions about: ${topic}`, systemPrompt);
        // Parse numbered list
        const lines = response.content.split('\n').filter(l => /^\d+\./.test(l.trim()));
        if (lines.length > 0)
            return lines.map(l => l.replace(/^\d+\.\s*/, '').trim());
        // Fallback: split by newlines and take non-empty ones
        return response.content
            .split('\n')
            .map(l => l.trim())
            .filter(l => l.length > 5)
            .slice(0, count);
    }
    async executeSlash(interaction) {
        const topic = interaction.options.getString('topic', true);
        const type = interaction.options.getString('type') || 'discussion';
        const count = interaction.options.getInteger('count') || 5;
        await interaction.deferReply();
        try {
            const client = interaction.client;
            const questions = await this.generateQuestions(client, topic, type, count);
            const typeEmojis = {
                discussion: '💬',
                trivia: '🧠',
                debate: '⚖️',
                icebreaker: '🧊',
                interview: '💼',
                philosophical: '🤔',
            };
            const questionsText = questions
                .slice(0, count)
                .map((q, i) => `**${i + 1}.** ${q}`)
                .join('\n\n');
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.ai} ${typeEmojis[type] || '❓'} AI Question Generator`)
                .setColor(COLORS.info)
                .addFields({ name: '📌 Topic', value: topic.slice(0, 256), inline: true }, { name: '🎯 Type', value: type.charAt(0).toUpperCase() + type.slice(1), inline: true }, { name: '🔢 Count', value: `${Math.min(questions.length, count)}`, inline: true }, {
                name: `${typeEmojis[type] || '❓'} Questions`,
                value: questionsText.slice(0, 1024) || 'No questions generated.',
            })
                .setFooter({ text: `${EMOJIS.ai} Powered by AI • Use these for discussions!` })
                .setTimestamp();
            await interaction.editReply({ embeds: [embed] });
        }
        catch (err) {
            const errMsg = err?.message || 'AI provider is unavailable. Please try again later.';
            await interaction.editReply({
                content: `${EMOJIS.error} Failed to generate questions: ${errMsg}`,
            });
        }
    }
    async executePrefix(message, _args) {
        if (!args.length) {
            return void message.reply(`${EMOJIS.error} Usage: \`p!question [type] <topic>\`\nTypes: ${QUESTION_TYPES.join(', ')}\nExample: \`p!question debate artificial intelligence\``);
        }
        let type = 'discussion';
        let topicArgs = _args;
        let count = 5;
        if (QUESTION_TYPES.includes(args[0].toLowerCase())) {
            type = args[0].toLowerCase();
            topicArgs = _args.slice(1);
        }
        // Check if last arg is a number (count)
        const lastArg = topicArgs[topicArgs.length - 1];
        if (lastArg && /^\d+$/.test(lastArg)) {
            count = Math.min(Math.max(parseInt(lastArg, 10), 1), 10);
            topicArgs = topicArgs.slice(0, -1);
        }
        const topic = topicArgs.join(' ');
        if (!topic) {
            return void message.reply(`${EMOJIS.error} Please provide a topic. Example: \`p!question debate climate change\``);
        }
        const thinking = await message.reply(`${EMOJIS.loading} Generating questions about **${topic}**...`);
        try {
            const client = message.client;
            const questions = await this.generateQuestions(client, topic, type, count);
            const typeEmojis = {
                discussion: '💬', trivia: '🧠', debate: '⚖️',
                icebreaker: '🧊', interview: '💼', philosophical: '🤔',
            };
            const questionsText = questions
                .slice(0, count)
                .map((q, i) => `**${i + 1}.** ${q}`)
                .join('\n\n');
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.ai} ${typeEmojis[type] || '❓'} AI Question Generator`)
                .setColor(COLORS.info)
                .addFields({ name: '📌 Topic', value: topic.slice(0, 256), inline: true }, { name: '🎯 Type', value: type.charAt(0).toUpperCase() + type.slice(1), inline: true }, {
                name: `${typeEmojis[type] || '❓'} Questions`,
                value: questionsText.slice(0, 1024) || 'No questions generated.',
            })
                .setFooter({ text: `${EMOJIS.ai} Powered by AI • Use these for discussions!` })
                .setTimestamp();
            await thinking.edit({ content: null, embeds: [embed] });
        }
        catch (err) {
            const errMsg = err?.message || 'AI provider is unavailable. Please try again later.';
            await thinking.edit(`${EMOJIS.error} Failed to generate questions: ${errMsg}`);
        }
    }
}
export default QuestionCommand;
