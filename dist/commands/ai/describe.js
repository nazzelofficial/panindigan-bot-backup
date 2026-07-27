// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class DescribeCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'describe',
            description: 'Get an AI description of anything',
            category: 'ai',
            cooldown: 5,
            userPermissions: [],
            botPermissions: [],
            guildOnly: false,
            slashCommand: true,
            prefixCommand: true,
            aliases: [],
            examples: ['/describe a sunset over the ocean', 'p!describe quantum computers'],
        };
        super(options);
    }
    buildSlashCommand() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption(o => o.setName('subject').setDescription('What to describe').setRequired(true))
            .addStringOption(o => o.setName('style').setDescription('Description style').setRequired(false)
            .addChoices({ name: 'Informative', value: 'informative' }, { name: 'Poetic', value: 'poetic' }, { name: 'Technical', value: 'technical' }, { name: 'Simple', value: 'simple' }));
    }
    async executeSlash(interaction) {
        const subject = interaction.options.getString('subject', true);
        const style = interaction.options.getString('style') || 'informative';
        await interaction.deferReply();
        try {
            const client = interaction.client;
            const response = await client.aiHandler.generateTaskResponse(`Describe: ${subject}`, `Write a ${style} description of the given subject. Be vivid, accurate, and engaging. Use sensory details where appropriate.`);
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.ai} 🖊️ Description`)
                .setColor(COLORS.info)
                .addFields({ name: '📌 Subject', value: subject, inline: false }, { name: `📝 Description (${style})`, value: response.content.slice(0, 4000), inline: false })
                .setFooter({ text: `Provider: ${response.provider}` })
                .setTimestamp();
            await interaction.editReply({ embeds: [embed] });
        }
        catch (err) {
            await interaction.editReply({ content: `${EMOJIS.error} Error: ${err.message || 'AI unavailable.'}` });
        }
    }
    async executePrefix(message, _args) {
        const subject = _args.join(' ');
        if (!subject)
            return void message.reply(`${EMOJIS.error} Please provide a subject to describe.`);
        const thinking = await message.reply(`${EMOJIS.ai} Describing...`);
        try {
            const client = message.client;
            const response = await client.aiHandler.generateTaskResponse(`Describe: ${subject}`, 'Write a vivid, informative, and engaging description of the subject.');
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.ai} 🖊️ Description`)
                .setColor(COLORS.info)
                .addFields({ name: '📌 Subject', value: subject, inline: false }, { name: '📝 Description', value: response.content.slice(0, 4000), inline: false })
                .setFooter({ text: `Provider: ${response.provider}` })
                .setTimestamp();
            await thinking.edit({ content: null, embeds: [embed] });
        }
        catch (err) {
            await thinking.edit(`${EMOJIS.error} Error: ${err.message || 'AI unavailable.'}`);
        }
    }
}
export default DescribeCommand;
