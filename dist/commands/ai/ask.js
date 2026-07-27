// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class AskCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'ask',
            description: 'Ask AI a question',
            category: 'ai',
            cooldown: 5,
            userPermissions: [],
            botPermissions: [],
            guildOnly: false,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['question', 'inquire'],
            examples: ['/ask what is the meaning of life', 'p!ask how do I code'],
        };
        super(options);
    }
    buildSlashCommand() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption(o => o.setName('question').setDescription('The question to ask').setRequired(true));
    }
    async executeSlash(interaction) {
        const question = interaction.options.getString('question', true);
        await interaction.deferReply();
        try {
            const client = interaction.client;
            const response = await client.aiHandler.generateResponse(interaction.user.id, interaction.guildId || 'dm', question);
            const answer = response.content.slice(0, 4000);
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.ai} ❓ AI Answer`)
                .setColor(COLORS.info)
                .addFields({ name: '❓ Question', value: question.slice(0, 1024), inline: false }, { name: '💡 Answer', value: answer || 'No response.', inline: false })
                .setFooter({ text: `Provider: ${response.provider} • Model: ${response.model}` })
                .setTimestamp();
            await interaction.editReply({ embeds: [embed] });
        }
        catch (err) {
            await interaction.editReply({ content: `${EMOJIS.error} Error: ${err.message || 'AI unavailable.'}` });
        }
    }
    async executePrefix(message, _args) {
        const question = _args.join(' ');
        if (!question)
            return void message.reply(`${EMOJIS.error} Please provide a question.`);
        const thinking = await message.reply(`${EMOJIS.ai} Thinking...`);
        try {
            const client = message.client;
            const response = await client.aiHandler.generateResponse(message.author.id, message.guildId || 'dm', question);
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.ai} ❓ AI Answer`)
                .setColor(COLORS.info)
                .addFields({ name: '❓ Question', value: question.slice(0, 1024), inline: false }, { name: '💡 Answer', value: response.content.slice(0, 4000) || 'No response.', inline: false })
                .setFooter({ text: `Provider: ${response.provider} • Model: ${response.model}` })
                .setTimestamp();
            await thinking.edit({ content: null, embeds: [embed] });
        }
        catch (err) {
            await thinking.edit(`${EMOJIS.error} Error: ${err.message || 'AI unavailable.'}`);
        }
    }
}
export default AskCommand;
