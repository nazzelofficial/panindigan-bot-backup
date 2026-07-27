// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class HappyCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'happy',
            description: 'Express happiness',
            category: 'fun',
            cooldown: 5,
            userPermissions: [],
            botPermissions: [],
            guildOnly: false,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['joy', 'joyful'],
            examples: ['/happy', 'p!happy'],
        };
        super(options);
    }
    happyMessages = [
        'is feeling very happy today! 😊',
        'is full of joy and happiness! 🎉',
        'is bursting with happiness! ✨',
        'is so happy right now! 😄',
        'is feeling absolutely joyful! 🥳',
        'is spreading happiness everywhere! 💖',
        'is in a great mood! 😊',
        'is feeling blessed and happy! 🙏',
    ];
    async executeSlash(interaction) {
        const message = this.happyMessages[Math.floor(Math.random() * this.happyMessages.length)];
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.fun} 😊 Happy`)
            .setColor(COLORS.success)
            .setDescription(`${interaction.user} ${message}`)
            .setTimestamp();
        await interaction.reply({ embeds: [embed] });
    }
    async executePrefix(message) {
        const happyMessage = this.happyMessages[Math.floor(Math.random() * this.happyMessages.length)];
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.fun} 😊 Happy`)
            .setColor(COLORS.success)
            .setDescription(`${message.author} ${happyMessage}`)
            .setTimestamp();
        await message.reply({ embeds: [embed] });
    }
}
export default HappyCommand;
