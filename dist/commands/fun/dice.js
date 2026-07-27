// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
export class DiceCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'dice',
            description: 'Roll a dice',
            category: 'fun',
            cooldown: 3,
            userPermissions: [],
            botPermissions: [],
            guildOnly: false,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['roll', 'diceroll'],
            examples: ['/dice', '/dice 6', 'p!dice 20'],
        };
        super(options);
    }
    async executeSlash(interaction) {
        const sides = interaction.options.getInteger('sides') || 6;
        const result = Math.floor(Math.random() * sides) + 1;
        const diceEmojis = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
        const emoji = sides === 6 ? diceEmojis[result - 1] : '🎲';
        const embed = new EmbedBuilder()
            .setTitle(`${emoji} Dice Roll`)
            .setColor(COLORS.info)
            .setDescription(`You rolled a **${result}** on a ${sides}-sided dice!`)
            .addFields([
            { name: 'Result', value: result.toString(), inline: true },
            { name: 'Sides', value: sides.toString(), inline: true },
        ])
            .setTimestamp();
        await interaction.reply({ embeds: [embed] });
    }
    async executePrefix(message) {
        const _args = message.content.split(' ').slice(1);
        const sides = args[0] ? parseInt(args[0]) : 6;
        const validSides = sides >= 2 && sides <= 100 ? sides : 6;
        const result = Math.floor(Math.random() * validSides) + 1;
        const diceEmojis = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
        const emoji = validSides === 6 ? diceEmojis[result - 1] : '🎲';
        const embed = new EmbedBuilder()
            .setTitle(`${emoji} Dice Roll`)
            .setColor(COLORS.info)
            .setDescription(`You rolled a **${result}** on a ${validSides}-sided dice!`)
            .addFields([
            { name: 'Result', value: result.toString(), inline: true },
            { name: 'Sides', value: validSides.toString(), inline: true },
        ])
            .setTimestamp();
        await message.reply({ embeds: [embed] });
    }
}
export default DiceCommand;
