// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class RiddleCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'riddle',
            description: 'Generate a riddle using AI',
            category: 'ai',
            cooldown: 5,
            userPermissions: [],
            botPermissions: [],
            guildOnly: false,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['puzzle', 'brain'],
            examples: ['/riddle', 'p!riddle about nature'],
        };
        super(options);
    }
    buildSlashCommand() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption(o => o.setName('topic').setDescription('Riddle topic (optional)').setRequired(false))
            .addStringOption(o => o.setName('difficulty').setDescription('Difficulty level').setRequired(false)
            .addChoices({ name: 'Easy', value: 'easy' }, { name: 'Medium', value: 'medium' }, { name: 'Hard', value: 'hard' }));
    }
    async executeSlash(interaction) {
        const topic = interaction.options.getString('topic') || '';
        const difficulty = interaction.options.getString('difficulty') || 'medium';
        await interaction.deferReply();
        try {
            const client = interaction.client;
            const response = await client.aiHandler.generateTaskResponse(topic || 'a creative riddle', `Create a ${difficulty} riddle${topic ? ` about ${topic}` : ''}. Format it as:\n**Riddle:** [the riddle]\n||**Answer:** [the answer in a spoiler]||\n\nMake it clever, solvable, and fun.`);
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.ai} 🧩 Riddle`)
                .setColor(COLORS.info)
                .setDescription(response.content.slice(0, 4000))
                .setFooter({ text: `Difficulty: ${difficulty} | Click the spoiler to reveal the answer | Provider: ${response.provider}` })
                .setTimestamp();
            await interaction.editReply({ embeds: [embed] });
        }
        catch (err) {
            await interaction.editReply({ content: `${EMOJIS.error} Error: ${err.message || 'AI unavailable.'}` });
        }
    }
    async executePrefix(message, _args) {
        const topic = _args.join(' ') || '';
        const thinking = await message.reply(`${EMOJIS.ai} Creating riddle...`);
        try {
            const client = message.client;
            const response = await client.aiHandler.generateTaskResponse(topic || 'a creative riddle', `Create a medium difficulty riddle. Format: **Riddle:** [riddle]\n||**Answer:** [answer]||`);
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.ai} 🧩 Riddle`)
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
export default RiddleCommand;
