// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class GrammarCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'grammar',
            description: 'Check and fix grammar using AI',
            category: 'ai',
            cooldown: 5,
            userPermissions: [],
            botPermissions: [],
            guildOnly: false,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['grammarcheck', 'spell'],
            examples: ['/grammar Their going to the store', 'p!grammar i dont know what to say'],
        };
        super(options);
    }
    buildSlashCommand() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption(o => o.setName('text').setDescription('Text to check').setRequired(true).setMaxLength(2000));
    }
    async executeSlash(interaction) {
        const text = interaction.options.getString('text', true);
        await interaction.deferReply();
        try {
            const client = interaction.client;
            const response = await client.aiHandler.generateTaskResponse(text, 'You are a grammar expert. Check the following text for grammar, spelling, and punctuation errors. Provide: 1) The corrected text. 2) A list of corrections made and why. If the text is already correct, say so.');
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.ai} ✏️ Grammar Check`)
                .setColor(COLORS.success)
                .addFields({ name: '📝 Original', value: text.slice(0, 1024), inline: false }, { name: '✅ Corrected', value: response.content.slice(0, 3000), inline: false })
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
            return void message.reply(`${EMOJIS.error} Please provide text to check.`);
        const thinking = await message.reply(`${EMOJIS.ai} Checking grammar...`);
        try {
            const client = message.client;
            const response = await client.aiHandler.generateTaskResponse(text, 'Check the text for grammar, spelling, and punctuation errors. Provide the corrected text and list corrections made.');
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.ai} ✏️ Grammar Check`)
                .setColor(COLORS.success)
                .addFields({ name: '📝 Original', value: text.slice(0, 1024), inline: false }, { name: '✅ Corrected', value: response.content.slice(0, 3000), inline: false })
                .setFooter({ text: `Provider: ${response.provider}` })
                .setTimestamp();
            await thinking.edit({ content: null, embeds: [embed] });
        }
        catch (err) {
            await thinking.edit(`${EMOJIS.error} Error: ${err.message || 'AI unavailable.'}`);
        }
    }
}
export default GrammarCommand;
