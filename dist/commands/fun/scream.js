// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class ScreamCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'scream',
            description: 'Scream (fun action)',
            category: 'fun',
            cooldown: 5,
            userPermissions: [],
            botPermissions: [],
            guildOnly: false,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['yell', 'shout'],
            examples: ['/scream', 'p!scream'],
        };
        super(options);
    }
    screamMessages = [
        'screams AHHHHH! 😱',
        'yells at the top of their lungs! 🗣️',
        'screams in frustration! 😤',
        'lets out a loud scream! 😱',
        'shouts AAAHHH! 🗣️',
        'screams dramatically! 😤',
        'yells HELP! 😱',
        'screams into the void! 🗣️',
    ];
    async executeSlash(interaction) {
        const message = this.screamMessages[Math.floor(Math.random() * this.screamMessages.length)];
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.fun} 😱 Scream`)
            .setColor(COLORS.warning)
            .setDescription(`${interaction.user} ${message}`)
            .setTimestamp();
        await interaction.reply({ embeds: [embed] });
    }
    async executePrefix(message) {
        const screamMessage = this.screamMessages[Math.floor(Math.random() * this.screamMessages.length)];
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.fun} 😱 Scream`)
            .setColor(COLORS.warning)
            .setDescription(`${message.author} ${screamMessage}`)
            .setTimestamp();
        await message.reply({ embeds: [embed] });
    }
}
export default ScreamCommand;
