// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class ChatCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'chat',
            description: 'Have a conversation with AI (with memory)',
            category: 'ai',
            cooldown: 5,
            userPermissions: [],
            botPermissions: [],
            guildOnly: false,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['talk', 'ai'],
            examples: ['/chat Hello!', 'p!chat Tell me a story'],
        };
        super(options);
    }
    buildSlashCommand() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption(o => o.setName('message').setDescription('Your message to the AI').setRequired(true));
    }
    async executeSlash(interaction) {
        const userMessage = interaction.options.getString('message', true);
        await interaction.deferReply();
        try {
            const client = interaction.client;
            const response = await client.aiHandler.generateResponse(interaction.user.id, interaction.guildId || 'dm', userMessage);
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.ai} 💬 AI Chat`)
                .setColor(COLORS.primary)
                .addFields({ name: `${interaction.user.username}`, value: userMessage.slice(0, 1024), inline: false }, { name: '🤖 Panindigan', value: response.content.slice(0, 4000) || 'No response.', inline: false })
                .setThumbnail(interaction.user.displayAvatarURL())
                .setFooter({ text: `Provider: ${response.provider} • Model: ${response.model} | Use /aiclear to reset memory` })
                .setTimestamp();
            await interaction.editReply({ embeds: [embed] });
        }
        catch (err) {
            await interaction.editReply({ content: `${EMOJIS.error} Error: ${err.message || 'AI unavailable.'}` });
        }
    }
    async executePrefix(message, _args) {
        const userMessage = _args.join(' ');
        if (!userMessage)
            return void message.reply(`${EMOJIS.error} Please provide a message.`);
        const thinking = await message.reply(`${EMOJIS.ai} Thinking...`);
        try {
            const client = message.client;
            const response = await client.aiHandler.generateResponse(message.author.id, message.guildId || 'dm', userMessage);
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.ai} 💬 AI Chat`)
                .setColor(COLORS.primary)
                .addFields({ name: message.author.username, value: userMessage.slice(0, 1024), inline: false }, { name: '🤖 Panindigan', value: response.content.slice(0, 4000) || 'No response.', inline: false })
                .setFooter({ text: `Provider: ${response.provider} • Model: ${response.model}` })
                .setTimestamp();
            await thinking.edit({ content: null, embeds: [embed] });
        }
        catch (err) {
            await thinking.edit(`${EMOJIS.error} Error: ${err.message || 'AI unavailable.'}`);
        }
    }
}
export default ChatCommand;
