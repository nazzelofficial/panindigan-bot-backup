// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class LeavingCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'leaving',
            description: 'Say goodbye to someone leaving',
            category: 'fun',
            cooldown: 5,
            userPermissions: [],
            botPermissions: [],
            guildOnly: false,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['byebye', 'farewell'],
            examples: ['/leaving @user', 'p!leaving @user'],
        };
        super(options);
    }
    leavingMessages = [
        'says goodbye to! 👋',
        'will miss! 😢',
        'says farewell to! 🌟',
        'hopes to see again! 💖',
        'says bye bye to! 🎊',
        'gives a fond farewell to! ✨',
        'says goodbye! Come back soon! 🌈',
        'will miss! Take care! 🌟',
    ];
    async executeSlash(interaction) {
        const user = interaction.options.getUser('user') || interaction.user;
        const message = this.leavingMessages[Math.floor(Math.random() * this.leavingMessages.length)];
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.fun} 👋 Goodbye`)
            .setColor(COLORS.info)
            .setDescription(`${interaction.user} ${message} ${user}`)
            .setTimestamp();
        await interaction.reply({ embeds: [embed] });
    }
    async executePrefix(message) {
        const user = message.mentions.users.first() || message.author;
        const leavingMessage = this.leavingMessages[Math.floor(Math.random() * this.leavingMessages.length)];
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.fun} 👋 Goodbye`)
            .setColor(COLORS.info)
            .setDescription(`${message.author} ${leavingMessage} ${user}`)
            .setTimestamp();
        await message.reply({ embeds: [embed] });
    }
}
export default LeavingCommand;
