// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class WriteCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'write',
            description: 'Write essays, articles, or long-form content using AI',
            category: 'ai',
            cooldown: 10,
            userPermissions: [],
            botPermissions: [],
            guildOnly: false,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['essay', 'article'],
            examples: ['/write An essay about renewable energy', 'p!write Article about Discord community building'],
        };
        super(options);
    }
    buildSlashCommand() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption(o => o.setName('topic').setDescription('What to write about').setRequired(true))
            .addStringOption(o => o.setName('type').setDescription('Content type').setRequired(false)
            .addChoices({ name: 'Essay', value: 'essay' }, { name: 'Article/Blog post', value: 'article' }, { name: 'Opinion piece', value: 'opinion' }, { name: 'Speech', value: 'speech' }, { name: 'Report', value: 'report' }));
    }
    async executeSlash(interaction) {
        const topic = interaction.options.getString('topic', true);
        const type = interaction.options.getString('type') || 'essay';
        await interaction.deferReply();
        try {
            const client = interaction.client;
            const response = await client.aiHandler.generateTaskResponse(topic, `You are a professional writer. Write a well-structured, engaging ${type} about the given topic. Include: compelling introduction, well-developed body paragraphs with evidence and examples, and a strong conclusion. Use clear language and a consistent voice. Aim for 400-600 words.`);
            const content = response.content.slice(0, 4000);
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.ai} ✍️ ${type.charAt(0).toUpperCase() + type.slice(1)}: ${topic.slice(0, 50)}`)
                .setColor(COLORS.info)
                .setDescription(content)
                .setFooter({ text: `Type: ${type} | Provider: ${response.provider}` })
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
            return void message.reply(`${EMOJIS.error} Please provide a topic to write about.`);
        const thinking = await message.reply(`${EMOJIS.ai} Writing...`);
        try {
            const client = message.client;
            const response = await client.aiHandler.generateTaskResponse(topic, 'Write a well-structured essay with compelling introduction, well-developed body, and strong conclusion. 400-600 words.');
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.ai} ✍️ Written Content`)
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
export default WriteCommand;
