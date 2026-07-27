// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class ExplainCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'explain',
            description: 'Explain a topic using AI',
            category: 'ai',
            cooldown: 8,
            userPermissions: [],
            botPermissions: [],
            guildOnly: false,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['eli5', 'breakdown'],
            examples: ['/explain quantum entanglement', 'p!explain how DNS works'],
        };
        super(options);
    }
    buildSlashCommand() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption(o => o.setName('topic').setDescription('Topic to explain').setRequired(true))
            .addStringOption(o => o.setName('level').setDescription('Explanation level').setRequired(false)
            .addChoices({ name: 'Simple (ELI5)', value: 'simple' }, { name: 'Intermediate', value: 'intermediate' }, { name: 'Expert', value: 'expert' }));
    }
    async executeSlash(interaction) {
        const topic = interaction.options.getString('topic', true);
        const level = interaction.options.getString('level') || 'intermediate';
        await interaction.deferReply();
        try {
            const client = interaction.client;
            const levelDesc = level === 'simple' ? 'Explain like I\'m 5 years old, using simple words and analogies.' :
                level === 'expert' ? 'Provide a detailed, technical explanation with depth.' :
                    'Explain clearly for a general audience with some technical detail.';
            const response = await client.aiHandler.generateTaskResponse(`Explain: ${topic}`, `You are an expert teacher. ${levelDesc} Structure your explanation clearly with an overview, key concepts, and examples.`);
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.ai} 💡 Explanation: ${topic.slice(0, 60)}`)
                .setColor(COLORS.info)
                .setDescription(response.content.slice(0, 4000))
                .setFooter({ text: `Level: ${level} | Provider: ${response.provider}` })
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
            return void message.reply(`${EMOJIS.error} Please provide a topic to explain.`);
        const thinking = await message.reply(`${EMOJIS.ai} Explaining...`);
        try {
            const client = message.client;
            const response = await client.aiHandler.generateTaskResponse(`Explain: ${topic}`, 'You are an expert teacher. Explain the topic clearly for a general audience with key concepts and examples.');
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.ai} 💡 Explanation: ${topic.slice(0, 60)}`)
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
export default ExplainCommand;
