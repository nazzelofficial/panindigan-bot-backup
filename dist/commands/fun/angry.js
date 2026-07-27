// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class AngryCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'angry',
            description: 'Express anger',
            category: 'fun',
            cooldown: 5,
            userPermissions: [],
            botPermissions: [],
            guildOnly: false,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['mad', 'furious'],
            examples: ['/angry', 'p!angry'],
        };
        super(options);
    }
    angryMessages = [
        'is feeling angry 😠',
        'is furious right now 😡',
        'is getting mad 😠',
        'is feeling very angry 😡',
        'is raging 😠',
        'is feeling frustrated 😡',
        'is angry and needs to vent 😠',
        'is feeling heated 😡',
    ];
    async executeSlash(interaction) {
        const message = this.angryMessages[Math.floor(Math.random() * this.angryMessages.length)];
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.fun} 😠 Angry`)
            .setColor(COLORS.error)
            .setDescription(`${interaction.user} ${message}`)
            .setTimestamp();
        await interaction.reply({ embeds: [embed] });
    }
    async executePrefix(message) {
        const angryMessage = this.angryMessages[Math.floor(Math.random() * this.angryMessages.length)];
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.fun} 😠 Angry`)
            .setColor(COLORS.error)
            .setDescription(`${message.author} ${angryMessage}`)
            .setTimestamp();
        await message.reply({ embeds: [embed] });
    }
}
export default AngryCommand;
