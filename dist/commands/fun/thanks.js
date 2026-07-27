// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class ThanksCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'thanks',
            description: 'Say thank you',
            category: 'fun',
            cooldown: 3,
            userPermissions: [],
            botPermissions: [],
            guildOnly: false,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['thankyou', 'ty'],
            examples: ['/thanks @user', 'p!thanks @user'],
        };
        super(options);
    }
    thankMessages = [
        'says thank you! 🙏',
        'is grateful! 💖',
        'says thanks a lot! 🌟',
        'appreciates it! 😊',
        'says thank you so much! ✨',
        'is thankful! 🙏',
        'says thanks! 💫',
        'appreciates the help! 🌟',
    ];
    async executeSlash(interaction) {
        const user = interaction.options.getUser('user') || interaction.user;
        const message = this.thankMessages[Math.floor(Math.random() * this.thankMessages.length)];
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.fun} 🙏 Thanks`)
            .setColor(COLORS.success)
            .setDescription(`${interaction.user} ${message} ${user}`)
            .setTimestamp();
        await interaction.reply({ embeds: [embed] });
    }
    async executePrefix(message) {
        const user = message.mentions.users.first() || message.author;
        const thankMessage = this.thankMessages[Math.floor(Math.random() * this.thankMessages.length)];
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.fun} 🙏 Thanks`)
            .setColor(COLORS.success)
            .setDescription(`${message.author} ${thankMessage} ${user}`)
            .setTimestamp();
        await message.reply({ embeds: [embed] });
    }
}
export default ThanksCommand;
