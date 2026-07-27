// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class ReviewCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'review',
            description: 'Write an AI-powered review for anything',
            category: 'ai',
            cooldown: 8,
            userPermissions: [],
            botPermissions: [],
            guildOnly: false,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['critique'],
            examples: ['/review Discord as a platform', 'p!review The book Dune'],
        };
        super(options);
    }
    buildSlashCommand() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption(o => o.setName('subject').setDescription('What to review').setRequired(true))
            .addStringOption(o => o.setName('context').setDescription('Additional context (your experience, etc.)').setRequired(false));
    }
    async executeSlash(interaction) {
        const subject = interaction.options.getString('subject', true);
        const context = interaction.options.getString('context') || '';
        await interaction.deferReply();
        try {
            const client = interaction.client;
            const input = context ? `${subject}\nContext: ${context}` : subject;
            const response = await client.aiHandler.generateTaskResponse(input, 'Write a balanced, insightful review. Include: ⭐ Rating (out of 5), ✅ Pros (3-5 points), ❌ Cons (2-3 points), 💬 Overall verdict, 👥 Who would enjoy/benefit from it. Be fair, specific, and helpful.');
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.ai} ⭐ Review: ${subject.slice(0, 50)}`)
                .setColor(COLORS.warning)
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
        const subject = _args.join(' ');
        if (!subject)
            return void message.reply(`${EMOJIS.error} Please provide something to review.`);
        const thinking = await message.reply(`${EMOJIS.ai} Writing review...`);
        try {
            const client = message.client;
            const response = await client.aiHandler.generateTaskResponse(subject, 'Write a balanced review: rating, pros, cons, overall verdict, and who would benefit. Fair and specific.');
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.ai} ⭐ Review: ${subject.slice(0, 50)}`)
                .setColor(COLORS.warning)
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
export default ReviewCommand;
