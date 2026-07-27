// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class DiceRollCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'diceroll',
            description: 'Roll a dice',
            category: 'games',
            cooldown: 3,
            userPermissions: [],
            botPermissions: [],
            guildOnly: false,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['roll', 'dice'],
            examples: ['/diceroll', 'p!diceroll'],
        };
        super(options);
    }
    async executeSlash(interaction) {
        const sides = interaction.options.getInteger('sides') || 6;
        const result = Math.floor(Math.random() * sides) + 1;
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.games} Dice Roll`)
            .setColor(COLORS.info)
            .setDescription(`🎲 You rolled a **${result}** (1-${sides})`)
            .setTimestamp();
        await interaction.reply({ embeds: [embed] });
    }
    async executePrefix(message, _args) {
        const sides = parseInt(args[0]) || 6;
        const result = Math.floor(Math.random() * sides) + 1;
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.games} Dice Roll`)
            .setColor(COLORS.info)
            .setDescription(`🎲 You rolled a **${result}** (1-${sides})`)
            .setTimestamp();
        await message.reply({ embeds: [embed] });
    }
}
export default DiceRollCommand;
