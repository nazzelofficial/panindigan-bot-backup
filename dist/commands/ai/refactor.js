// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class RefactorCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'refactor',
            description: 'Refactor code to be cleaner and more maintainable using AI',
            category: 'ai',
            cooldown: 10,
            userPermissions: [],
            botPermissions: [],
            guildOnly: false,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['clean', 'restructure'],
            examples: ['/refactor messy code here', 'p!refactor paste code to refactor'],
        };
        super(options);
    }
    buildSlashCommand() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption(o => o.setName('code').setDescription('Code to refactor').setRequired(true).setMaxLength(2000));
    }
    async executeSlash(interaction) {
        const code = interaction.options.getString('code', true);
        await interaction.deferReply();
        try {
            const client = interaction.client;
            const response = await client.aiHandler.generateTaskResponse(code, 'You are a clean code expert. Refactor the following code to be cleaner, more readable, and more maintainable. Apply: SOLID principles, DRY, proper naming conventions, extract functions, remove magic numbers, add comments. Show the refactored code and explain the changes.');
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.ai} 🔨 Code Refactored`)
                .setColor(COLORS.info)
                .addFields({ name: '💻 Original', value: `\`\`\`\n${code.slice(0, 600)}\n\`\`\``, inline: false }, { name: '✨ Refactored', value: response.content.slice(0, 3400), inline: false })
                .setFooter({ text: `Provider: ${response.provider}` })
                .setTimestamp();
            await interaction.editReply({ embeds: [embed] });
        }
        catch (err) {
            await interaction.editReply({ content: `${EMOJIS.error} Error: ${err.message || 'AI unavailable.'}` });
        }
    }
    async executePrefix(message, _args) {
        const code = _args.join(' ');
        if (!code)
            return void message.reply(`${EMOJIS.error} Please provide code to refactor.`);
        const thinking = await message.reply(`${EMOJIS.ai} Refactoring code...`);
        try {
            const client = message.client;
            const response = await client.aiHandler.generateTaskResponse(code, 'Refactor this code to be cleaner, more readable, and maintainable. Apply SOLID, DRY, proper naming. Show refactored code and explain changes.');
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.ai} 🔨 Code Refactored`)
                .setColor(COLORS.info)
                .addFields({ name: '✨ Refactored', value: response.content.slice(0, 3800), inline: false })
                .setFooter({ text: `Provider: ${response.provider}` })
                .setTimestamp();
            await thinking.edit({ content: null, embeds: [embed] });
        }
        catch (err) {
            await thinking.edit(`${EMOJIS.error} Error: ${err.message || 'AI unavailable.'}`);
        }
    }
}
export default RefactorCommand;
