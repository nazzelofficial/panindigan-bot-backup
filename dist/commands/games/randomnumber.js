// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class RandomNumberCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'randomnumber',
            description: 'Generate a random number',
            category: 'games',
            cooldown: 3,
            userPermissions: [],
            botPermissions: [],
            guildOnly: false,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['rng', 'rand'],
            examples: ['/randomnumber 1 100', 'p!randomnumber 1 100'],
        };
        super(options);
    }
    async executeSlash(interaction) {
        const min = interaction.options.getInteger('min') || 1;
        const max = interaction.options.getInteger('max') || 100;
        if (min >= max) {
            await interaction.reply({ content: '❌ Min must be less than max.', ephemeral: true });
            return;
        }
        const result = Math.floor(Math.random() * (max - min + 1)) + min;
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.games} Random Number`)
            .setColor(COLORS.info)
            .setDescription(`🔢 Random number between ${min} and ${max}: **${result}**`)
            .setTimestamp();
        await interaction.reply({ embeds: [embed] });
    }
    async executePrefix(message, _args) {
        const min = parseInt(args[0]) || 1;
        const max = parseInt(args[1]) || 100;
        if (min >= max) {
            await message.reply('❌ Min must be less than max.');
            return;
        }
        const result = Math.floor(Math.random() * (max - min + 1)) + min;
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.games} Random Number`)
            .setColor(COLORS.info)
            .setDescription(`🔢 Random number between ${min} and ${max}: **${result}**`)
            .setTimestamp();
        await message.reply({ embeds: [embed] });
    }
}
export default RandomNumberCommand;
