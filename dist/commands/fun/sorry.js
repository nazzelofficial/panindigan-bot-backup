// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class SorryCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'sorry',
            description: 'Say sorry',
            category: 'fun',
            cooldown: 3,
            userPermissions: [],
            botPermissions: [],
            guildOnly: false,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['apologize'],
            examples: ['/sorry @user', 'p!sorry @user'],
        };
        super(options);
    }
    sorryMessages = [
        'says sorry! 😔',
        'apologizes sincerely! 🙏',
        'says sorry about that! 😢',
        'asks for forgiveness! 🙏',
        'says sorry! Won\'t happen again! 😔',
        'apologizes! My bad! 🙏',
        'says sorry! Please forgive me! 😢',
        'apologizes deeply! 🙏',
    ];
    async executeSlash(interaction) {
        const user = interaction.options.getUser('user') || interaction.user;
        const message = this.sorryMessages[Math.floor(Math.random() * this.sorryMessages.length)];
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.fun} 😔 Sorry`)
            .setColor(COLORS.warning)
            .setDescription(`${interaction.user} ${message} ${user}`)
            .setTimestamp();
        await interaction.reply({ embeds: [embed] });
    }
    async executePrefix(message) {
        const user = message.mentions.users.first() || message.author;
        const sorryMessage = this.sorryMessages[Math.floor(Math.random() * this.sorryMessages.length)];
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.fun} 😔 Sorry`)
            .setColor(COLORS.warning)
            .setDescription(`${message.author} ${sorryMessage} ${user}`)
            .setTimestamp();
        await message.reply({ embeds: [embed] });
    }
}
export default SorryCommand;
