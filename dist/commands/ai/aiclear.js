// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class AiClearCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'aiclear',
            description: 'Clear your AI conversation memory',
            category: 'ai',
            cooldown: 5,
            userPermissions: [],
            botPermissions: [],
            guildOnly: false,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['clearmemory', 'aiforget', 'resetai'],
            examples: ['/aiclear', 'p!aiclear'],
        };
        super(options);
    }
    buildSlashCommand() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description);
    }
    async executeSlash(interaction) {
        await interaction.deferReply({ ephemeral: true });
        try {
            const client = interaction.client;
            await client.aiHandler.clearConversationMemory(interaction.user.id, interaction.guildId || 'dm');
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.ai} 🧹 Memory Cleared`)
                .setColor(COLORS.success)
                .setDescription('Your AI conversation memory has been cleared. The next message will start a fresh conversation.')
                .setTimestamp();
            await interaction.editReply({ embeds: [embed] });
        }
        catch (err) {
            await interaction.editReply({ content: `${EMOJIS.error} Error clearing memory: ${err.message}` });
        }
    }
    async executePrefix(message, _args) {
        try {
            const client = message.client;
            await client.aiHandler.clearConversationMemory(message.author.id, message.guildId || 'dm');
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.ai} 🧹 Memory Cleared`)
                .setColor(COLORS.success)
                .setDescription('Your AI conversation memory has been cleared. Fresh start! 🌟')
                .setTimestamp();
            await message.reply({ embeds: [embed] });
        }
        catch (err) {
            await message.reply(`${EMOJIS.error} Error clearing memory: ${err.message}`);
        }
    }
}
export default AiClearCommand;
