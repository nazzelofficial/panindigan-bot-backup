// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class UnflipCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'unflip',
            description: 'Put the table back',
            category: 'fun',
            cooldown: 5,
            userPermissions: [],
            botPermissions: [],
            guildOnly: false,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['fixtable', 'calm'],
            examples: ['/unflip', 'p!unflip'],
        };
        super(options);
    }
    async executeSlash(interaction) {
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.fun} ┬─┬ ノ( ゜-゜ノ) Table Unflip`)
            .setColor(COLORS.info)
            .setDescription(`${interaction.user} puts the table back ┬─┬ ノ( ゜-゜ノ)`)
            .setTimestamp();
        await interaction.reply({ embeds: [embed] });
    }
    async executePrefix(message) {
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.fun} ┬─┬ ノ( ゜-゜ノ) Table Unflip`)
            .setColor(COLORS.info)
            .setDescription(`${message.author} puts the table back ┬─┬ ノ( ゜-゜ノ)`)
            .setTimestamp();
        await message.reply({ embeds: [embed] });
    }
}
export default UnflipCommand;
