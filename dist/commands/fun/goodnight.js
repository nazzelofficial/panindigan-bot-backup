// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class GoodNightCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'goodnight',
            description: 'Say good night',
            category: 'fun',
            cooldown: 3,
            userPermissions: [],
            botPermissions: [],
            guildOnly: false,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['gn'],
            examples: ['/goodnight', 'p!goodnight'],
        };
        super(options);
    }
    nightGreetings = [
        'Good night! 🌙 Sweet dreams!',
        'Nighty night! 😴 Sleep well!',
        'Good night! Have sweet dreams! 🌟',
        'Sleep tight! Good night! 🌙',
        'Good night! Rest well! 😴',
        'Night! See you tomorrow! 🌟',
        'Good night! Sweet dreams await! 🌙',
        'Sleep well! Good night! 💤',
    ];
    async executeSlash(interaction) {
        const greeting = this.nightGreetings[Math.floor(Math.random() * this.nightGreetings.length)];
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.fun} 🌙 Good Night`)
            .setColor(COLORS.info)
            .setDescription(`${greeting}`)
            .addFields([
            { name: 'User', value: interaction.user.username, inline: true },
        ])
            .setTimestamp();
        await interaction.reply({ embeds: [embed] });
    }
    async executePrefix(message) {
        const greeting = this.nightGreetings[Math.floor(Math.random() * this.nightGreetings.length)];
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.fun} 🌙 Good Night`)
            .setColor(COLORS.info)
            .setDescription(`${greeting}`)
            .addFields([
            { name: 'User', value: message.author.username, inline: true },
        ])
            .setTimestamp();
        await message.reply({ embeds: [embed] });
    }
}
export default GoodNightCommand;
