// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class CapitalizeCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'capitalize',
            description: 'Capitalize text',
            category: 'fun',
            cooldown: 3,
            userPermissions: [],
            botPermissions: [],
            guildOnly: false,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['cap', 'title'],
            examples: ['/capitalize hello world', 'p!capitalize hello world'],
        };
        super(options);
    }
    async executeSlash(interaction) {
        const text = interaction.options.getString('text') || '';
        if (!text) {
            const errorEmbed = new EmbedBuilder()
                .setTitle(`${EMOJIS.error} Error`)
                .setColor(COLORS.error)
                .setDescription('Please provide text to capitalize.')
                .setTimestamp();
            await interaction.reply({ embeds: [errorEmbed] });
            return;
        }
        const capitalized = text.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.fun} 🔤 Capitalize`)
            .setColor(COLORS.info)
            .addFields([
            { name: 'Original', value: text, inline: false },
            { name: 'Capitalized', value: capitalized, inline: false },
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
                .setDescription('Please provide text to capitalize.')
                .setTimestamp();
            await message.reply({ embeds: [errorEmbed] });
            return;
        }
        const capitalized = text.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.fun} 🔤 Capitalize`)
            .setColor(COLORS.info)
            .addFields([
            { name: 'Original', value: text, inline: false },
            { name: 'Capitalized', value: capitalized, inline: false },
        ])
            .setTimestamp();
        await message.reply({ embeds: [embed] });
    }
}
export default CapitalizeCommand;
