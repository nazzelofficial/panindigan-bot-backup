// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class OutlineCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'outline',
            description: 'Create a structured outline for any topic using AI',
            category: 'ai',
            cooldown: 8,
            userPermissions: [],
            botPermissions: [],
            guildOnly: false,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['structure', 'plan'],
            examples: ['/outline Essay on climate change', 'p!outline Book on learning JavaScript'],
        };
        super(options);
    }
    buildSlashCommand() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption(o => o.setName('topic').setDescription('Topic to outline').setRequired(true))
            .addStringOption(o => o.setName('type').setDescription('Type of outline').setRequired(false)
            .addChoices({ name: 'Essay', value: 'essay' }, { name: 'Presentation', value: 'presentation' }, { name: 'Book/Report', value: 'book' }, { name: 'Project plan', value: 'project' }, { name: 'Study guide', value: 'study' }));
    }
    async executeSlash(interaction) {
        const topic = interaction.options.getString('topic', true);
        const type = interaction.options.getString('type') || 'essay';
        await interaction.deferReply();
        try {
            const client = interaction.client;
            const response = await client.aiHandler.generateTaskResponse(topic, `Create a comprehensive, well-structured ${type} outline for the given topic. Use Roman numerals for main sections, letters for subsections. Include key points, supporting arguments, and a clear logical flow. Make it detailed and practical.`);
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.ai} 📋 Outline: ${topic.slice(0, 50)}`)
                .setColor(COLORS.info)
                .setDescription(response.content.slice(0, 4000))
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
            return void message.reply(`${EMOJIS.error} Please provide a topic to outline.`);
        const thinking = await message.reply(`${EMOJIS.ai} Creating outline...`);
        try {
            const client = message.client;
            const response = await client.aiHandler.generateTaskResponse(topic, 'Create a comprehensive outline with Roman numerals for main sections and letters for subsections. Clear logical flow.');
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.ai} 📋 Outline: ${topic.slice(0, 50)}`)
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
export default OutlineCommand;
