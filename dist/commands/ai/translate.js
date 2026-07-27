// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class TranslateAICommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'translate',
            description: 'Translate text to another language using AI',
            category: 'ai',
            cooldown: 5,
            userPermissions: [],
            botPermissions: [],
            guildOnly: false,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['trans', 'tl'],
            examples: ['/translate Hello how are you | Filipino', 'p!translate Hello | Japanese'],
        };
        super(options);
    }
    buildSlashCommand() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption(o => o.setName('text').setDescription('Text to translate').setRequired(true))
            .addStringOption(o => o.setName('language').setDescription('Target language (e.g. Filipino, Spanish, Japanese)').setRequired(true))
            .addStringOption(o => o.setName('from').setDescription('Source language (auto-detect if not set)').setRequired(false));
    }
    async executeSlash(interaction) {
        const text = interaction.options.getString('text', true);
        const targetLang = interaction.options.getString('language', true);
        const fromLang = interaction.options.getString('from') || 'auto-detected';
        await interaction.deferReply();
        try {
            const client = interaction.client;
            const response = await client.aiHandler.generateTaskResponse(text, `You are a professional translator. Translate the following text to ${targetLang}. Provide only the translation, then on a new line add a note about the source language detected (if relevant). Preserve tone, style, and formatting.`);
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.ai} 🌐 Translation`)
                .setColor(COLORS.info)
                .addFields({ name: `📝 Original (${fromLang})`, value: text.slice(0, 1024), inline: false }, { name: `🌍 ${targetLang}`, value: response.content.slice(0, 2000), inline: false })
                .setFooter({ text: `Provider: ${response.provider}` })
                .setTimestamp();
            await interaction.editReply({ embeds: [embed] });
        }
        catch (err) {
            await interaction.editReply({ content: `${EMOJIS.error} Error: ${err.message || 'AI unavailable.'}` });
        }
    }
    async executePrefix(message, _args) {
        const input = _args.join(' ');
        const parts = input.split('|');
        const text = parts[0]?.trim();
        const targetLang = parts[1]?.trim() || 'English';
        if (!text)
            return void message.reply(`${EMOJIS.error} Usage: \`p!translate <text> | <language>\``);
        const thinking = await message.reply(`${EMOJIS.ai} Translating...`);
        try {
            const client = message.client;
            const response = await client.aiHandler.generateTaskResponse(text, `You are a professional translator. Translate the text to ${targetLang}. Provide only the translation.`);
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.ai} 🌐 Translation → ${targetLang}`)
                .setColor(COLORS.info)
                .addFields({ name: '📝 Original', value: text.slice(0, 1024), inline: false }, { name: `🌍 ${targetLang}`, value: response.content.slice(0, 2000), inline: false })
                .setFooter({ text: `Provider: ${response.provider}` })
                .setTimestamp();
            await thinking.edit({ content: null, embeds: [embed] });
        }
        catch (err) {
            await thinking.edit(`${EMOJIS.error} Error: ${err.message || 'AI unavailable.'}`);
        }
    }
}
export default TranslateAICommand;
