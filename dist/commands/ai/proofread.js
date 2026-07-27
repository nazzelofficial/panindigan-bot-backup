// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class ProofreadCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'proofread',
            description: 'Proofread and polish text using AI',
            category: 'ai',
            cooldown: 5,
            userPermissions: [],
            botPermissions: [],
            guildOnly: false,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['polish', 'edit'],
            examples: ['/proofread My essay text here', 'p!proofread Check this paragraph'],
        };
        super(options);
    }
    buildSlashCommand() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption(o => o.setName('text').setDescription('Text to proofread').setRequired(true).setMaxLength(3000));
    }
    async executeSlash(interaction) {
        const text = interaction.options.getString('text', true);
        await interaction.deferReply();
        try {
            const client = interaction.client;
            const response = await client.aiHandler.generateTaskResponse(text, 'You are a professional editor. Proofread the following text and: 1) Fix all grammar, spelling, punctuation errors. 2) Improve clarity and flow. 3) Show the polished version. 4) List major changes made. Keep the original voice and intent.');
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.ai} 🔍 Proofread`)
                .setColor(COLORS.success)
                .addFields({ name: '📝 Original', value: text.slice(0, 800) + (text.length > 800 ? '...' : ''), inline: false }, { name: '✅ Polished', value: response.content.slice(0, 3200), inline: false })
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
            return void message.reply(`${EMOJIS.error} Please provide text to proofread.`);
        const thinking = await message.reply(`${EMOJIS.ai} Proofreading...`);
        try {
            const client = message.client;
            const response = await client.aiHandler.generateTaskResponse(text, 'Proofread: fix grammar, spelling, punctuation. Improve clarity. Show polished version and list major changes.');
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.ai} 🔍 Proofread`)
                .setColor(COLORS.success)
                .addFields({ name: '📝 Original', value: text.slice(0, 800), inline: false }, { name: '✅ Polished', value: response.content.slice(0, 3200), inline: false })
                .setFooter({ text: `Provider: ${response.provider}` })
                .setTimestamp();
            await thinking.edit({ content: null, embeds: [embed] });
        }
        catch (err) {
            await thinking.edit(`${EMOJIS.error} Error: ${err.message || 'AI unavailable.'}`);
        }
    }
}
export default ProofreadCommand;
