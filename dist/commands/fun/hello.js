// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class HelloCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'hello',
            description: 'Say hello',
            category: 'fun',
            cooldown: 3,
            userPermissions: [],
            botPermissions: [],
            guildOnly: false,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['hi', 'hey'],
            examples: ['/hello', 'p!hello'],
        };
        super(options);
    }
    greetings = [
        'Hello there! 👋',
        'Hey! How are you? 😊',
        'Hi! Nice to see you! 🌟',
        'Hello! Hope you\'re having a great day! ☀️',
        'Hey there! What\'s up? 😄',
        'Hi! Welcome! 🎉',
        'Hello! Good to see you! 💫',
        'Hey! How can I help? 🤖',
    ];
    async executeSlash(interaction) {
        const greeting = this.greetings[Math.floor(Math.random() * this.greetings.length)];
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.fun} 👋 Hello`)
            .setColor(COLORS.success)
            .setDescription(`${greeting}`)
            .addFields([
            { name: 'User', value: interaction.user.username, inline: true },
        ])
            .setTimestamp();
        await interaction.reply({ embeds: [embed] });
    }
    async executePrefix(message) {
        const greeting = this.greetings[Math.floor(Math.random() * this.greetings.length)];
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.fun} 👋 Hello`)
            .setColor(COLORS.success)
            .setDescription(`${greeting}`)
            .addFields([
            { name: 'User', value: message.author.username, inline: true },
        ])
            .setTimestamp();
        await message.reply({ embeds: [embed] });
    }
}
export default HelloCommand;
