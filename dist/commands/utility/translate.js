// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class TranslateUtilityCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'utranslate',
            description: 'Translate text',
            category: 'utility',
            cooldown: 5,
            userPermissions: [],
            botPermissions: [],
            guildOnly: false,
            slashCommand: false,
            prefixCommand: true,
            aliases: ['trans', 'tl'],
            examples: ['p!translate Hello | Filipino'],
        };
        super(options);
    }
    buildSlashCommand() {
        return new SlashCommandBuilder().setName(this.name).setDescription(this.description);
    }
    async executeSlash(interaction) {
        await interaction.reply({ content: 'Use `/translate` from the info category.', ephemeral: true });
    }
    async executePrefix(message, _args) {
        const input = _args.join(' ');
        const parts = input.split('|');
        const text = parts[0]?.trim();
        const lang = parts[1]?.trim() || 'English';
        if (!text)
            return void message.reply(`${EMOJIS.error} Usage: \`p!translate <text> | <language>\``);
        const thinking = await message.reply(`${EMOJIS.info} Translating...`);
        try {
            const client = message.client;
            const response = await client.aiHandler.generateTaskResponse(text, `Translate to ${lang}. Provide only the translation.`);
            const embed = new EmbedBuilder()
                .setTitle(`🌐 Translation → ${lang}`)
                .setColor(COLORS.info)
                .addFields({ name: '📝 Original', value: text.slice(0, 1024), inline: false }, { name: `🌍 ${lang}`, value: response.content.slice(0, 2000), inline: false }).setTimestamp();
            await thinking.edit({ content: null, embeds: [embed] });
        }
        catch (err) {
            await thinking.edit(`${EMOJIS.error} Translation failed: ${err.message}`);
        }
    }
}
export default TranslateUtilityCommand;
