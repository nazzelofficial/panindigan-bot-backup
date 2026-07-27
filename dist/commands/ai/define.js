// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class DefineCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'define',
            description: 'Get an AI-powered definition of a word or phrase',
            category: 'ai',
            cooldown: 5,
            userPermissions: [],
            botPermissions: [],
            guildOnly: false,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['def', 'dictionary'],
            examples: ['/define ephemeral', 'p!define machine learning'],
        };
        super(options);
    }
    buildSlashCommand() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption(o => o.setName('term').setDescription('Word or phrase to define').setRequired(true));
    }
    async executeSlash(interaction) {
        const term = interaction.options.getString('term', true);
        await interaction.deferReply();
        try {
            const client = interaction.client;
            const response = await client.aiHandler.generateTaskResponse(term, 'You are a dictionary and encyclopedia. Define the given word or phrase with: 1) A clear, concise definition. 2) Part of speech (if applicable). 3) Etymology (if known). 4) 2-3 example sentences. 5) Synonyms and antonyms (if applicable). Format it clearly.');
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.ai} 📖 Definition: ${term}`)
                .setColor(COLORS.info)
                .setDescription(response.content.slice(0, 4000))
                .setFooter({ text: `Provider: ${response.provider}` })
                .setTimestamp();
            await interaction.editReply({ embeds: [embed] });
        }
        catch (err) {
            await interaction.editReply({ content: `${EMOJIS.error} Error: ${err.message || 'AI unavailable.'}` });
        }
    }
    async executePrefix(message, _args) {
        const term = _args.join(' ');
        if (!term)
            return void message.reply(`${EMOJIS.error} Please provide a term to define.`);
        const thinking = await message.reply(`${EMOJIS.ai} Looking up definition...`);
        try {
            const client = message.client;
            const response = await client.aiHandler.generateTaskResponse(term, 'You are a dictionary. Define the given word with: definition, part of speech, etymology, example sentences, and synonyms.');
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.ai} 📖 Definition: ${term}`)
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
export default DefineCommand;
