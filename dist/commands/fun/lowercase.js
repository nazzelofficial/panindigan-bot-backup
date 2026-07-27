// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class LowercaseCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'lowercase',
            description: 'Convert text to lowercase',
            category: 'fun',
            cooldown: 3,
            userPermissions: [],
            botPermissions: [],
            guildOnly: false,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['lower'],
            examples: ['/lowercase HELLO WORLD', 'p!lowercase HELLO WORLD'],
        };
        super(options);
    }
    async executeSlash(interaction) {
        const text = interaction.options.getString('text') || '';
        if (!text) {
            const errorEmbed = new EmbedBuilder()
                .setTitle(`${EMOJIS.error} Error`)
                .setColor(COLORS.error)
                .setDescription('Please provide text to convert.')
                .setTimestamp();
            await interaction.reply({ embeds: [errorEmbed] });
            return;
        }
        const lowercased = text.toLowerCase();
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.fun} 🔡 Lowercase`)
            .setColor(COLORS.info)
            .addFields([
            { name: 'Original', value: text, inline: false },
            { name: 'Lowercased', value: lowercased, inline: false },
        ])
            .setTimestamp();
        await interaction.reply({ embeds: [embed] });
    }
    async executePrefix(message) {
        const _args = message.content.split(' ').slice(1);
        const text = _args.join(' ');
        if (!text) {
            const errorEmbed = new EmbedBuilder()
                .setTitle(`${EMOJIS.error} Error`)
                .setColor(COLORS.error)
                .setDescription('Please provide text to convert.')
                .setTimestamp();
            await message.reply({ embeds: [errorEmbed] });
            return;
        }
        const lowercased = text.toLowerCase();
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.fun} 🔡 Lowercase`)
            .setColor(COLORS.info)
            .addFields([
            { name: 'Original', value: text, inline: false },
            { name: 'Lowercased', value: lowercased, inline: false },
        ])
            .setTimestamp();
        await message.reply({ embeds: [embed] });
    }
}
export default LowercaseCommand;
