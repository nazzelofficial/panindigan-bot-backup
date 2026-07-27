// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class CodeExplainCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'codeexplain',
            description: 'Explain what code does using AI',
            category: 'ai',
            cooldown: 8,
            userPermissions: [],
            botPermissions: [],
            guildOnly: false,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['whatiscode', 'howdoes'],
            examples: ['/codeexplain const x = arr.reduce((a, b) => a + b, 0)', 'p!codeexplain paste code here'],
        };
        super(options);
    }
    buildSlashCommand() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption(o => o.setName('code').setDescription('Code to explain').setRequired(true).setMaxLength(2000));
    }
    async executeSlash(interaction) {
        const code = interaction.options.getString('code', true);
        await interaction.deferReply();
        try {
            const client = interaction.client;
            const response = await client.aiHandler.generateTaskResponse(code, 'You are an expert programmer and teacher. Explain what the following code does step by step. Include: 1) A one-sentence summary. 2) Line-by-line or block-by-block explanation. 3) What it returns/outputs. 4) Any potential issues or edge cases. Make it clear for someone learning.');
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.ai} 🔬 Code Explanation`)
                .setColor(COLORS.info)
                .addFields({ name: '💻 Code', value: `\`\`\`\n${code.slice(0, 800)}\n\`\`\``, inline: false }, { name: '📖 Explanation', value: response.content.slice(0, 3200), inline: false })
                .setFooter({ text: `Provider: ${response.provider}` })
                .setTimestamp();
            await interaction.editReply({ embeds: [embed] });
        }
        catch (err) {
            await interaction.editReply({ content: `${EMOJIS.error} Error: ${err.message || 'AI unavailable.'}` });
        }
    }
    async executePrefix(message, _args) {
        const code = _args.join(' ');
        if (!code)
            return void message.reply(`${EMOJIS.error} Please provide code to explain.`);
        const thinking = await message.reply(`${EMOJIS.ai} Explaining code...`);
        try {
            const client = message.client;
            const response = await client.aiHandler.generateTaskResponse(code, 'Explain what this code does step by step, including summary, line-by-line explanation, output, and potential issues.');
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.ai} 🔬 Code Explanation`)
                .setColor(COLORS.info)
                .addFields({ name: '📖 Explanation', value: response.content.slice(0, 3800), inline: false })
                .setFooter({ text: `Provider: ${response.provider}` })
                .setTimestamp();
            await thinking.edit({ content: null, embeds: [embed] });
        }
        catch (err) {
            await thinking.edit(`${EMOJIS.error} Error: ${err.message || 'AI unavailable.'}`);
        }
    }
}
export default CodeExplainCommand;
