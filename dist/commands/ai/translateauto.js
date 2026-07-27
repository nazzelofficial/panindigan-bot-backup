// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class TranslateAutoCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'translateauto',
            description: 'Auto-translate messages in a channel',
            category: 'ai',
            cooldown: 10,
            userPermissions: ['ManageChannels'],
            botPermissions: ['ManageMessages'],
            guildOnly: true,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['autotranslate', 'auto-tr'],
            examples: ['/translateauto on English', 'p!translateauto off'],
        };
        super(options);
    }
    async executeSlash(interaction) {
        const action = interaction.options.getString('action') || 'off';
        const language = interaction.options.getString('language') || 'English';
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.ai} 🌐 Auto-Translation`)
            .setColor(COLORS.info)
            .setDescription(`Auto-translation has been ${action}.`)
            .addFields([
            { name: 'Status', value: action === 'on' ? 'Enabled' : 'Disabled', inline: true },
            { name: 'Target Language', value: language, inline: true },
        ])
            .setTimestamp();
        await interaction.reply({ embeds: [embed] });
    }
    async executePrefix(message) {
        const _args = message.content.split(' ').slice(1);
        const action = args[0] || 'off';
        const language = args[1] || 'English';
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.ai} 🌐 Auto-Translation`)
            .setColor(COLORS.info)
            .setDescription(`Auto-translation has been ${action}.`)
            .addFields([
            { name: 'Status', value: action === 'on' ? 'Enabled' : 'Disabled', inline: true },
            { name: 'Target Language', value: language, inline: true },
        ])
            .setTimestamp();
        await message.reply({ embeds: [embed] });
    }
}
export default TranslateAutoCommand;
