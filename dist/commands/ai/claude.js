// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { EMOJIS } from '../../utils/Constants.js';
export class ClaudeCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'claude',
            description: 'Chat with Anthropic Claude AI',
            category: 'ai',
            cooldown: 10,
            userPermissions: [],
            botPermissions: [],
            guildOnly: false,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['anthropic'],
            examples: ['/claude Analyze this text', 'p!claude Write a detailed essay'],
        };
        super(options);
    }
    buildSlashCommand() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption(o => o.setName('prompt').setDescription('Your prompt for Claude').setRequired(true));
    }
    async executeSlash(interaction) {
        const prompt = interaction.options.getString('prompt', true);
        await interaction.deferReply();
        try {
            const client = interaction.client;
            const response = await client.aiHandler.generateWithProvider(interaction.user.id, interaction.guildId || 'dm', prompt, 'anthropic');
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.ai} 🧠 Claude AI`)
                .setColor(0xd97706)
                .addFields({ name: '💬 Prompt', value: prompt.slice(0, 1024), inline: false }, { name: '🤖 Response', value: response.content.slice(0, 4000) || 'No response.', inline: false })
                .setFooter({ text: `Model: ${response.model} | Anthropic` })
                .setTimestamp();
            await interaction.editReply({ embeds: [embed] });
        }
        catch (err) {
            await interaction.editReply({ content: `${EMOJIS.error} Claude unavailable: ${err.message || 'Please check API key.'}` });
        }
    }
    async executePrefix(message, _args) {
        const prompt = _args.join(' ');
        if (!prompt)
            return void message.reply(`${EMOJIS.error} Please provide a prompt.`);
        const thinking = await message.reply(`${EMOJIS.ai} Asking Claude...`);
        try {
            const client = message.client;
            const response = await client.aiHandler.generateWithProvider(message.author.id, message.guildId || 'dm', prompt, 'anthropic');
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.ai} 🧠 Claude AI`)
                .setColor(0xd97706)
                .addFields({ name: '💬 Prompt', value: prompt.slice(0, 1024), inline: false }, { name: '🤖 Response', value: response.content.slice(0, 4000) || 'No response.', inline: false })
                .setFooter({ text: `Model: ${response.model} | Anthropic` })
                .setTimestamp();
            await thinking.edit({ content: null, embeds: [embed] });
        }
        catch (err) {
            await thinking.edit(`${EMOJIS.error} Claude unavailable: ${err.message || 'Please check API key.'}`);
        }
    }
}
export default ClaudeCommand;
