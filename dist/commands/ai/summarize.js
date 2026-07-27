// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class SummarizeCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'summarize',
            description: 'Summarize text using AI',
            category: 'ai',
            cooldown: 8,
            userPermissions: [],
            botPermissions: [],
            guildOnly: false,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['summary', 'tldr'],
            examples: ['/summarize <long text>', 'p!summarize paste text here'],
        };
        super(options);
    }
    buildSlashCommand() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption(o => o.setName('text').setDescription('Text to summarize').setRequired(true).setMaxLength(3000));
    }
    async executeSlash(interaction) {
        const text = interaction.options.getString('text', true);
        await interaction.deferReply();
        try {
            const client = interaction.client;
            const response = await client.aiHandler.generateTaskResponse(text, 'You are a summarization expert. Provide a concise, accurate summary of the given text. Use bullet points for key points. Keep it under 300 words. Start with a 1-sentence TL;DR, then list the main points.');
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.ai} 📝 Summary`)
                .setColor(COLORS.info)
                .addFields({ name: '📄 Original', value: text.slice(0, 512) + (text.length > 512 ? '...' : ''), inline: false }, { name: '📋 Summary', value: response.content.slice(0, 4000), inline: false })
                .setFooter({ text: `Provider: ${response.provider}` })
                .setTimestamp();
            await interaction.editReply({ embeds: [embed] });
        }
        catch (err) {
            await interaction.editReply({ content: `${EMOJIS.error} Error: ${err.message || 'AI unavailable.'}` });
        }
    }
    async executePrefix(message, _args) {
        const text = _args.join(' ');
        if (!text)
            return void message.reply(`${EMOJIS.error} Please provide text to summarize.`);
        const thinking = await message.reply(`${EMOJIS.ai} Summarizing...`);
        try {
            const client = message.client;
            const response = await client.aiHandler.generateTaskResponse(text, 'You are a summarization expert. Provide a concise, accurate summary with bullet points. Start with a 1-sentence TL;DR, then list the main points.');
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.ai} 📝 Summary`)
                .setColor(COLORS.info)
                .addFields({ name: '📄 Original', value: text.slice(0, 512) + (text.length > 512 ? '...' : ''), inline: false }, { name: '📋 Summary', value: response.content.slice(0, 4000), inline: false })
                .setFooter({ text: `Provider: ${response.provider}` })
                .setTimestamp();
            await thinking.edit({ content: null, embeds: [embed] });
        }
        catch (err) {
            await thinking.edit(`${EMOJIS.error} Error: ${err.message || 'AI unavailable.'}`);
        }
    }
}
export default SummarizeCommand;
