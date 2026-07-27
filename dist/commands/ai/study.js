// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class StudyCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'study',
            description: 'Create a study guide or notes for any topic using AI',
            category: 'ai',
            cooldown: 10,
            userPermissions: [],
            botPermissions: [],
            guildOnly: false,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['studyguide', 'notes'],
            examples: ['/study Photosynthesis', 'p!study World War 2 causes'],
        };
        super(options);
    }
    buildSlashCommand() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption(o => o.setName('topic').setDescription('Topic to create study guide for').setRequired(true))
            .addStringOption(o => o.setName('format').setDescription('Study format').setRequired(false)
            .addChoices({ name: 'Study guide', value: 'guide' }, { name: 'Flashcard-style Q&A', value: 'qa' }, { name: 'Key concepts summary', value: 'concepts' }, { name: 'Mnemonics', value: 'mnemonics' }));
    }
    async executeSlash(interaction) {
        const topic = interaction.options.getString('topic', true);
        const format = interaction.options.getString('format') || 'guide';
        await interaction.deferReply();
        try {
            const client = interaction.client;
            const systemPrompts = {
                guide: 'Create a comprehensive study guide with: key concepts, definitions, important facts, examples, and memory tips. Organize logically with clear headings.',
                qa: 'Create 8-10 study flashcard Q&A pairs for the topic. Include important concepts, definitions, and application questions. Format: Q: [question] A: [answer]',
                concepts: 'Summarize the 7-10 most important key concepts/terms. For each: term, clear definition, and why it matters.',
                mnemonics: 'Create helpful mnemonics, acronyms, and memory tricks to remember key information about this topic.'
            };
            const response = await client.aiHandler.generateTaskResponse(topic, `You are an expert educator and study coach. ${systemPrompts[format] || systemPrompts.guide}`);
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.ai} 📚 Study: ${topic.slice(0, 50)}`)
                .setColor(COLORS.info)
                .setDescription(response.content.slice(0, 4000))
                .setFooter({ text: `Format: ${format} | Provider: ${response.provider}` })
                .setTimestamp();
            await interaction.editReply({ embeds: [embed] });
        }
        catch (err) {
            await interaction.editReply({ content: `${EMOJIS.error} Error: ${err.message || 'AI unavailable.'}` });
        }
    }
    async executePrefix(message, _args) {
        const topic = _args.join(' ');
        if (!topic)
            return void message.reply(`${EMOJIS.error} Please provide a study topic.`);
        const thinking = await message.reply(`${EMOJIS.ai} Creating study guide...`);
        try {
            const client = message.client;
            const response = await client.aiHandler.generateTaskResponse(topic, 'Create a comprehensive study guide: key concepts, definitions, important facts, examples, and memory tips. Clear headings.');
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.ai} 📚 Study Guide: ${topic.slice(0, 50)}`)
                .setColor(COLORS.info)
                .setDescription(response.content.slice(0, 4000))
                .setFooter({ text: `Provider: ${response.provider}` })
                .setTimestamp();
            await thinking.edit({ content: null, embeds: [embed] });
        }
        catch (err) {
            await thinking.edit(`${EMOJIS.error} Error: ${err.message || 'AI unavailable.'}`);
        }
    }
}
export default StudyCommand;
