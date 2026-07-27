// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class OptimizeCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'optimize',
            description: 'Optimize code for better performance using AI',
            category: 'ai',
            cooldown: 10,
            userPermissions: [],
            botPermissions: [],
            guildOnly: false,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['speed', 'perf'],
            examples: ['/optimize slow function here', 'p!optimize paste code to optimize'],
        };
        super(options);
    }
    buildSlashCommand() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption(o => o.setName('code').setDescription('Code to optimize').setRequired(true).setMaxLength(2000));
    }
    async executeSlash(interaction) {
        const code = interaction.options.getString('code', true);
        await interaction.deferReply();
        try {
            const client = interaction.client;
            const response = await client.aiHandler.generateTaskResponse(code, 'You are a performance optimization expert. Optimize the following code: 1) Identify performance bottlenecks. 2) Provide the optimized code. 3) Explain each optimization (time complexity, space complexity improvements). 4) Estimate performance gain. Follow best practices.');
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.ai} ⚡ Code Optimized`)
                .setColor(COLORS.success)
                .addFields({ name: '💻 Original', value: `\`\`\`\n${code.slice(0, 600)}\n\`\`\``, inline: false }, { name: '🚀 Optimization', value: response.content.slice(0, 3400), inline: false })
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
            return void message.reply(`${EMOJIS.error} Please provide code to optimize.`);
        const thinking = await message.reply(`${EMOJIS.ai} Optimizing code...`);
        try {
            const client = message.client;
            const response = await client.aiHandler.generateTaskResponse(code, 'Optimize this code: identify bottlenecks, provide optimized version, explain optimizations, and estimate performance gain.');
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.ai} ⚡ Code Optimized`)
                .setColor(COLORS.success)
                .addFields({ name: '🚀 Optimization', value: response.content.slice(0, 3800), inline: false })
                .setFooter({ text: `Provider: ${response.provider}` })
                .setTimestamp();
            await thinking.edit({ content: null, embeds: [embed] });
        }
        catch (err) {
            await thinking.edit(`${EMOJIS.error} Error: ${err.message || 'AI unavailable.'}`);
        }
    }
}
export default OptimizeCommand;
