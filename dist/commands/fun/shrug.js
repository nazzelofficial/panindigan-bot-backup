// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class ShrugCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'shrug',
            description: 'Shrug at someone',
            category: 'fun',
            cooldown: 5,
            userPermissions: [],
            botPermissions: [],
            guildOnly: false,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['idk'],
            examples: ['/shrug', 'p!shrug'],
        };
        super(options);
    }
    async executeSlash(interaction) {
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.fun} ¯\\_(ツ)_/¯ Shrug`)
            .setColor(COLORS.info)
            .setDescription(`${interaction.user} shrugs ¯\\_(ツ)_/¯`)
            .setTimestamp();
        await interaction.reply({ embeds: [embed] });
    }
    async executePrefix(message) {
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.fun} ¯\\_(ツ)_/¯ Shrug`)
            .setColor(COLORS.info)
            .setDescription(`${message.author} shrugs ¯\\_(ツ)_/¯`)
            .setTimestamp();
        await message.reply({ embeds: [embed] });
    }
}
export default ShrugCommand;
