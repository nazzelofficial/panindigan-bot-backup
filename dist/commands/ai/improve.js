// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class ImproveCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'improve',
            description: 'Improve text quality using AI',
            category: 'ai',
            cooldown: 8,
            userPermissions: [],
            botPermissions: [],
            guildOnly: false,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['enhance', 'better'],
            examples: ['/improve My essay here', 'p!improve This paragraph needs help'],
        };
        super(options);
    }
    buildSlashCommand() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption(o => o.setName('text').setDescription('Text to improve').setRequired(true).setMaxLength(2000));
    }
    async executeSlash(interaction) {
        const text = interaction.options.getString('text', true);
        await interaction.deferReply();
        try {
            const client = interaction.client;
            const response = await client.aiHandler.generateTaskResponse(text, 'You are a writing improvement expert. Enhance the following text to make it clearer, more engaging, and more compelling while preserving the original intent and voice. Provide: 1) The improved version. 2) Brief notes on what was improved.');
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.ai} 🚀 Text Improved`)
                .setColor(COLORS.success)
                .addFields({ name: '📝 Original', value: text.slice(0, 1024), inline: false }, { name: '✨ Improved', value: response.content.slice(0, 3000), inline: false })
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
            return void message.reply(`${EMOJIS.error} Please provide text to improve.`);
        const thinking = await message.reply(`${EMOJIS.ai} Improving...`);
        try {
            const client = message.client;
            const response = await client.aiHandler.generateTaskResponse(text, 'Improve this text to be clearer, more engaging, and compelling while keeping the original intent.');
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.ai} 🚀 Text Improved`)
                .setColor(COLORS.success)
                .addFields({ name: '📝 Original', value: text.slice(0, 1024), inline: false }, { name: '✨ Improved', value: response.content.slice(0, 3000), inline: false })
                .setFooter({ text: `Provider: ${response.provider}` })
                .setTimestamp();
            await thinking.edit({ content: null, embeds: [embed] });
        }
        catch (err) {
            await thinking.edit(`${EMOJIS.error} Error: ${err.message || 'AI unavailable.'}`);
        }
    }
}
export default ImproveCommand;
