// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class FactCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'fact',
            description: 'Get an interesting AI-curated fact',
            category: 'ai',
            cooldown: 5,
            userPermissions: [],
            botPermissions: [],
            guildOnly: false,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['trivia', 'didyouknow'],
            examples: ['/fact about space', 'p!fact about the Philippines'],
        };
        super(options);
    }
    buildSlashCommand() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption(o => o.setName('topic').setDescription('Fact topic (optional)').setRequired(false));
    }
    async executeSlash(interaction) {
        const topic = interaction.options.getString('topic') || 'science, history, nature, or technology';
        await interaction.deferReply();
        try {
            const client = interaction.client;
            const response = await client.aiHandler.generateTaskResponse(`Topic: ${topic}`, `Share 1-2 genuinely surprising, fascinating, and accurate facts about ${topic}. The facts should be verifiable, little-known, and mind-blowing. Start with "🤯 Did you know..." and add why the fact is significant or surprising.`);
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.ai} 🌟 Interesting Fact`)
                .setColor(COLORS.info)
                .setDescription(response.content.slice(0, 4000))
                .setFooter({ text: `Topic: ${topic} | Provider: ${response.provider}` })
                .setTimestamp();
            await interaction.editReply({ embeds: [embed] });
        }
        catch (err) {
            await interaction.editReply({ content: `${EMOJIS.error} Error: ${err.message || 'AI unavailable.'}` });
        }
    }
    async executePrefix(message, _args) {
        const topic = _args.join(' ') || 'science, history, nature, or technology';
        const thinking = await message.reply(`${EMOJIS.ai} Finding a fact...`);
        try {
            const client = message.client;
            const response = await client.aiHandler.generateTaskResponse(`Topic: ${topic}`, `Share a genuinely surprising, fascinating fact about ${topic}. Start with "🤯 Did you know..." and explain why it's significant.`);
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.ai} 🌟 Interesting Fact`)
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
export default FactCommand;
