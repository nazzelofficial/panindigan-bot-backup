// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class RollCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'roll',
            description: 'Roll a random number',
            category: 'fun',
            cooldown: 3,
            userPermissions: [],
            botPermissions: [],
            guildOnly: false,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['random', 'rng'],
            examples: ['/roll', '/roll 1 100', 'p!roll 1 10'],
        };
        super(options);
    }
    async executeSlash(interaction) {
        const min = interaction.options.getInteger('min') || 1;
        const max = interaction.options.getInteger('max') || 100;
        const result = Math.floor(Math.random() * (max - min + 1)) + min;
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.fun} Random Number`)
            .setColor(COLORS.info)
            .setDescription(`You rolled: **${result}**`)
            .addFields([
            { name: 'Range', value: `${min} - ${max}`, inline: true },
            { name: 'Result', value: result.toString(), inline: true },
        ])
            .setTimestamp();
        await interaction.reply({ embeds: [embed] });
    }
    async executePrefix(message) {
        const _args = message.content.split(' ').slice(1);
        const min = args[0] ? parseInt(args[0]) : 1;
        const max = args[1] ? parseInt(args[1]) : 100;
        const validMin = isNaN(min) ? 1 : min;
        const validMax = isNaN(max) ? 100 : max;
        const result = Math.floor(Math.random() * (validMax - validMin + 1)) + validMin;
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.fun} Random Number`)
            .setColor(COLORS.info)
            .setDescription(`You rolled: **${result}**`)
            .addFields([
            { name: 'Range', value: `${validMin} - ${validMax}`, inline: true },
            { name: 'Result', value: result.toString(), inline: true },
        ])
            .setTimestamp();
        await message.reply({ embeds: [embed] });
    }
}
export default RollCommand;
