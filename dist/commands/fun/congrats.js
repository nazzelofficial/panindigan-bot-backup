// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class CongratsCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'congrats',
            description: 'Congratulate someone',
            category: 'fun',
            cooldown: 5,
            userPermissions: [],
            botPermissions: [],
            guildOnly: false,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['congratulations', 'celebrate'],
            examples: ['/congrats @user', 'p!congrats @user'],
        };
        super(options);
    }
    congratsMessages = [
        'congratulates! 🎉',
        'celebrates with! 🎊',
        'gives a big congratulations to! 🌟',
        'is proud of! 💖',
        'congratulates on their achievement! 🏆',
        'celebrates the success of! ✨',
        'says congratulations! 🎉',
        'honors! 🏅',
    ];
    async executeSlash(interaction) {
        const user = interaction.options.getUser('user') || interaction.user;
        const message = this.congratsMessages[Math.floor(Math.random() * this.congratsMessages.length)];
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.fun} 🎉 Congratulations`)
            .setColor(COLORS.success)
            .setDescription(`${interaction.user} ${message} ${user}`)
            .setTimestamp();
        await interaction.reply({ embeds: [embed] });
    }
    async executePrefix(message) {
        const user = message.mentions.users.first() || message.author;
        const congratsMessage = this.congratsMessages[Math.floor(Math.random() * this.congratsMessages.length)];
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.fun} 🎉 Congratulations`)
            .setColor(COLORS.success)
            .setDescription(`${message.author} ${congratsMessage} ${user}`)
            .setTimestamp();
        await message.reply({ embeds: [embed] });
    }
}
export default CongratsCommand;
