// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class ConfusedCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'confused',
            description: 'Express confusion',
            category: 'fun',
            cooldown: 5,
            userPermissions: [],
            botPermissions: [],
            guildOnly: false,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['huh', 'what'],
            examples: ['/confused', 'p!confused'],
        };
        super(options);
    }
    confusedMessages = [
        'is confused 😕',
        'doesn\'t understand what\'s happening 🤔',
        'is feeling confused 😕',
        'is scratching their head in confusion 🤔',
        'is puzzled 😕',
        'is trying to figure things out 🤔',
        'is completely confused 😕',
        'is wondering what\'s going on 🤔',
    ];
    async executeSlash(interaction) {
        const message = this.confusedMessages[Math.floor(Math.random() * this.confusedMessages.length)];
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.fun} 🤔 Confused`)
            .setColor(COLORS.warning)
            .setDescription(`${interaction.user} ${message}`)
            .setTimestamp();
        await interaction.reply({ embeds: [embed] });
    }
    async executePrefix(message) {
        const confusedMessage = this.confusedMessages[Math.floor(Math.random() * this.confusedMessages.length)];
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.fun} 🤔 Confused`)
            .setColor(COLORS.warning)
            .setDescription(`${message.author} ${confusedMessage}`)
            .setTimestamp();
        await message.reply({ embeds: [embed] });
    }
}
export default ConfusedCommand;
