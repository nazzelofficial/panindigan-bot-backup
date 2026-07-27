// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class DebugCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'debug',
            description: 'Debug code and identify issues using AI',
            category: 'ai',
            cooldown: 10,
            userPermissions: [],
            botPermissions: [],
            guildOnly: false,
            slashCommand: true,
            prefixCommand: true,
            aliases: [],
            examples: ['/debug code that is not working', 'p!debug paste code and error'],
        };
        super(options);
    }
    buildSlashCommand() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption(o => o.setName('code').setDescription('Code to debug').setRequired(true).setMaxLength(2000))
            .addStringOption(o => o.setName('context').setDescription('What the code should do / error message').setRequired(false));
    }
    async executeSlash(interaction) {
        const code = interaction.options.getString('code', true);
        const context = interaction.options.getString('context') || '';
        await interaction.deferReply();
        try {
            const client = interaction.client;
            const input = context ? `Code:\n${code}\n\nContext/Error: ${context}` : code;
            const response = await client.aiHandler.generateTaskResponse(input, 'You are a debugging expert. Debug the code systematically: 1) Identify the root cause of the issue. 2) Explain why it happens. 3) Provide the corrected code. 4) Add debugging tips. Use systematic debugging methodology.');
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.ai} 🔧 Debug Analysis`)
                .setColor(COLORS.warning)
                .addFields({ name: '💻 Code', value: `\`\`\`\n${code.slice(0, 600)}\n\`\`\``, inline: false }, ...(context ? [{ name: '📋 Context', value: context.slice(0, 300), inline: false }] : []), { name: '🔍 Debug Report', value: response.content.slice(0, 3200), inline: false })
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
            return void message.reply(`${EMOJIS.error} Please provide code to debug.`);
        const thinking = await message.reply(`${EMOJIS.ai} Debugging...`);
        try {
            const client = message.client;
            const response = await client.aiHandler.generateTaskResponse(code, 'Debug this code: identify the root cause, explain why it happens, provide corrected code, and add debugging tips.');
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.ai} 🔧 Debug Analysis`)
                .setColor(COLORS.warning)
                .addFields({ name: '🔍 Debug Report', value: response.content.slice(0, 3800), inline: false })
                .setFooter({ text: `Provider: ${response.provider}` })
                .setTimestamp();
            await thinking.edit({ content: null, embeds: [embed] });
        }
        catch (err) {
            await thinking.edit(`${EMOJIS.error} Error: ${err.message || 'AI unavailable.'}`);
        }
    }
}
export default DebugCommand;
