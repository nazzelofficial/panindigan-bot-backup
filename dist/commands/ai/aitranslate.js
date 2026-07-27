// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class AiTranslateCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'aitranslate',
            description: 'Advanced AI translation with context and nuance',
            category: 'ai',
            cooldown: 8,
            userPermissions: [],
            botPermissions: [],
            guildOnly: false,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['smarttranslate'],
            examples: ['/aitranslate Kumain ka na ba? | English', 'p!aitranslate Hello friend | Filipino'],
        };
        super(options);
    }
    buildSlashCommand() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption(o => o.setName('text').setDescription('Text to translate').setRequired(true).setMaxLength(2000))
            .addStringOption(o => o.setName('language').setDescription('Target language').setRequired(true))
            .addStringOption(o => o.setName('style').setDescription('Translation style').setRequired(false)
            .addChoices({ name: 'Formal', value: 'formal' }, { name: 'Casual', value: 'casual' }, { name: 'Literal', value: 'literal' }, { name: 'Natural (default)', value: 'natural' }));
    }
    async executeSlash(interaction) {
        const text = interaction.options.getString('text', true);
        const targetLang = interaction.options.getString('language', true);
        const style = interaction.options.getString('style') || 'natural';
        await interaction.deferReply();
        try {
            const client = interaction.client;
            const response = await client.aiHandler.generateTaskResponse(text, `You are an expert translator. Translate the following text to ${targetLang} in a ${style} style. After the translation, briefly note any cultural nuances, idiomatic expressions, or alternative translations worth knowing.`);
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.ai} 🌐 Advanced Translation`)
                .setColor(COLORS.info)
                .addFields({ name: '📝 Original', value: text.slice(0, 1024), inline: false }, { name: `🌍 ${targetLang} (${style})`, value: response.content.slice(0, 3500), inline: false })
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
            return void message.reply(`${EMOJIS.error} Usage: \`p!aitranslate <text> | <language>\``);
        const thinking = await message.reply(`${EMOJIS.ai} Translating...`);
        try {
            const client = message.client;
            const response = await client.aiHandler.generateTaskResponse(text, `You are an expert translator. Translate the text to ${targetLang} naturally, noting any cultural nuances.`);
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.ai} 🌐 Advanced Translation → ${targetLang}`)
                .setColor(COLORS.info)
                .addFields({ name: '📝 Original', value: text.slice(0, 1024), inline: false }, { name: `🌍 ${targetLang}`, value: response.content.slice(0, 3500), inline: false })
                .setFooter({ text: `Provider: ${response.provider}` })
                .setTimestamp();
            await thinking.edit({ content: null, embeds: [embed] });
        }
        catch (err) {
            await thinking.edit(`${EMOJIS.error} Error: ${err.message || 'AI unavailable.'}`);
        }
    }
}
export default AiTranslateCommand;
