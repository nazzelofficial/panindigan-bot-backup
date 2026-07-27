// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class ExcitedCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'excited',
            description: 'Express excitement',
            category: 'fun',
            cooldown: 5,
            userPermissions: [],
            botPermissions: [],
            guildOnly: false,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['hype', 'pumped'],
            examples: ['/excited', 'p!excited'],
        };
        super(options);
    }
    excitedMessages = [
        'is super excited! 🎉',
        'is hyped up! 🤩',
        'can\'t contain their excitement! 🎊',
        'is bursting with excitement! ✨',
        'is feeling pumped! 🤩',
        'is so excited right now! 🎉',
        'is full of energy and excitement! 🎊',
        'is ready for anything! 🤩',
    ];
    async executeSlash(interaction) {
        const message = this.excitedMessages[Math.floor(Math.random() * this.excitedMessages.length)];
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.fun} 🤩 Excited`)
            .setColor(COLORS.success)
            .setDescription(`${interaction.user} ${message}`)
            .setTimestamp();
        await interaction.reply({ embeds: [embed] });
    }
    async executePrefix(message) {
        const excitedMessage = this.excitedMessages[Math.floor(Math.random() * this.excitedMessages.length)];
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.fun} 🤩 Excited`)
            .setColor(COLORS.success)
            .setDescription(`${message.author} ${excitedMessage}`)
            .setTimestamp();
        await message.reply({ embeds: [embed] });
    }
}
export default ExcitedCommand;
