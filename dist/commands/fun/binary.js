// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class BinaryCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'binary',
            description: 'Convert text to binary',
            category: 'fun',
            cooldown: 3,
            userPermissions: [],
            botPermissions: [],
            guildOnly: false,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['bin'],
            examples: ['/binary hello', 'p!binary hello'],
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
        const binary = text.split('').map(char => char.charCodeAt(0).toString(2).padStart(8, '0')).join(' ');
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.fun} 💻 Binary`)
            .setColor(COLORS.info)
            .addFields([
            { name: 'Original', value: text, inline: false },
            { name: 'Binary', value: binary.substring(0, 1000) + (binary.length > 1000 ? '...' : ''), inline: false },
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
        const binary = text.split('').map(char => char.charCodeAt(0).toString(2).padStart(8, '0')).join(' ');
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.fun} 💻 Binary`)
            .setColor(COLORS.info)
            .addFields([
            { name: 'Original', value: text, inline: false },
            { name: 'Binary', value: binary.substring(0, 1000) + (binary.length > 1000 ? '...' : ''), inline: false },
        ])
            .setTimestamp();
        await message.reply({ embeds: [embed] });
    }
}
export default BinaryCommand;
