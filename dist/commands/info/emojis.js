// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { Formatter } from '../../utils/Formatter.js';
export class EmojisCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'emojis',
            description: 'List all emojis in the server',
            category: 'info',
            cooldown: 5,
            userPermissions: [],
            botPermissions: [],
            guildOnly: true,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['listemojis', 'allemojis'],
            examples: ['/emojis', 'p!emojis'],
        };
        super(options);
    }
    async executeSlash(interaction) {
        const guild = interaction.guild;
        const emojis = guild.emojis.cache;
        const animated = emojis.filter(e => e.animated).size;
        const staticEmojis = emojis.filter(e => !e.animated).size;
        const emojiList = emojis.map(e => e.toString()).join(' ');
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.info} Server Emojis`)
            .setColor(COLORS.info)
            .setDescription(emojiList.substring(0, 4000) || 'No emojis found')
            .addFields([
            { name: 'Total Emojis', value: Formatter.formatNumber(emojis.size), inline: true },
            { name: 'Animated', value: Formatter.formatNumber(animated), inline: true },
            { name: 'Static', value: Formatter.formatNumber(staticEmojis), inline: true },
        ])
            .setTimestamp();
        await interaction.reply({ embeds: [embed] });
    }
    async executePrefix(message) {
        const guild = message.guild;
        const emojis = guild.emojis.cache;
        const animated = emojis.filter(e => e.animated).size;
        const staticEmojis = emojis.filter(e => !e.animated).size;
        const emojiList = emojis.map(e => e.toString()).join(' ');
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.info} Server Emojis`)
            .setColor(COLORS.info)
            .setDescription(emojiList.substring(0, 4000) || 'No emojis found')
            .addFields([
            { name: 'Total Emojis', value: Formatter.formatNumber(emojis.size), inline: true },
            { name: 'Animated', value: Formatter.formatNumber(animated), inline: true },
            { name: 'Static', value: Formatter.formatNumber(staticEmojis), inline: true },
        ])
            .setTimestamp();
        await message.reply({ embeds: [embed] });
    }
}
export default EmojisCommand;
