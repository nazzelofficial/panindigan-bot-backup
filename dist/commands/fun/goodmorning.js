// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class GoodMorningCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'goodmorning',
            description: 'Say good morning',
            category: 'fun',
            cooldown: 3,
            userPermissions: [],
            botPermissions: [],
            guildOnly: false,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['gm'],
            examples: ['/goodmorning', 'p!goodmorning'],
        };
        super(options);
    }
    morningGreetings = [
        'Good morning! ☀️ Have a great day!',
        'Rise and shine! 🌅 Good morning!',
        'Good morning! Hope your day is amazing! 🌟',
        'Morning! Time to start the day! ☀️',
        'Good morning! Wishing you the best! 🌅',
        'Morning sunshine! Have a wonderful day! ☀️',
        'Good morning! Let\'s make today great! 🌟',
        'Rise and grind! Good morning! 💪',
    ];
    async executeSlash(interaction) {
        const greeting = this.morningGreetings[Math.floor(Math.random() * this.morningGreetings.length)];
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.fun} ☀️ Good Morning`)
            .setColor(COLORS.success)
            .setDescription(`${greeting}`)
            .addFields([
            { name: 'User', value: interaction.user.username, inline: true },
        ])
            .setTimestamp();
        await interaction.reply({ embeds: [embed] });
    }
    async executePrefix(message) {
        const greeting = this.morningGreetings[Math.floor(Math.random() * this.morningGreetings.length)];
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.fun} ☀️ Good Morning`)
            .setColor(COLORS.success)
            .setDescription(`${greeting}`)
            .addFields([
            { name: 'User', value: message.author.username, inline: true },
        ])
            .setTimestamp();
        await message.reply({ embeds: [embed] });
    }
}
export default GoodMorningCommand;
