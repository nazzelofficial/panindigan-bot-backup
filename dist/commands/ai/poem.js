// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { EMOJIS } from '../../utils/Constants.js';
export class PoemCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'poem',
            description: 'Generate a poem using AI',
            category: 'ai',
            cooldown: 8,
            userPermissions: [],
            botPermissions: [],
            guildOnly: false,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['poetry', 'verse'],
            examples: ['/poem The ocean at night', 'p!poem Longing for home'],
        };
        super(options);
    }
    buildSlashCommand() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption(o => o.setName('topic').setDescription('Topic or theme for the poem').setRequired(true))
            .addStringOption(o => o.setName('style').setDescription('Poem style').setRequired(false)
            .addChoices({ name: 'Free verse', value: 'free verse' }, { name: 'Haiku', value: 'haiku' }, { name: 'Sonnet', value: 'sonnet' }, { name: 'Limerick', value: 'limerick' }, { name: 'Ode', value: 'ode' }, { name: 'Acrostic', value: 'acrostic' }));
    }
    async executeSlash(interaction) {
        const topic = interaction.options.getString('topic', true);
        const style = interaction.options.getString('style') || 'free verse';
        await interaction.deferReply();
        try {
            const client = interaction.client;
            const response = await client.aiHandler.generateTaskResponse(topic, `You are a skilled poet. Write a beautiful, evocative ${style} poem about the given topic. Use vivid imagery, strong metaphors, and appropriate rhythm. Make it emotionally resonant and original.`);
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.ai} 🌸 Poem`)
                .setColor(0xf9a8d4)
                .addFields({ name: `📜 ${topic} (${style})`, value: response.content.slice(0, 4000), inline: false })
                .setFooter({ text: `Style: ${style} | Provider: ${response.provider}` })
                .setTimestamp();
            await interaction.editReply({ embeds: [embed] });
        }
        catch (err) {
            await interaction.editReply({ content: `${EMOJIS.error} Error: ${err.message || 'AI unavailable.'}` });
        }
    }
    async executePrefix(message, _args) {
        const topic = _args.join(' ');
        if (!topic)
            return void message.reply(`${EMOJIS.error} Please provide a poem topic.`);
        const thinking = await message.reply(`${EMOJIS.ai} Writing a poem...`);
        try {
            const client = message.client;
            const response = await client.aiHandler.generateTaskResponse(topic, 'Write a beautiful, evocative free verse poem with vivid imagery, strong metaphors, and emotional resonance.');
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.ai} 🌸 Poem: ${topic.slice(0, 50)}`)
                .setColor(0xf9a8d4)
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
export default PoemCommand;
