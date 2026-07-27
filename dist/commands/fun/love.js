// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class LoveCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'love',
            description: 'Express love',
            category: 'fun',
            cooldown: 5,
            userPermissions: [],
            botPermissions: [],
            guildOnly: false,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['heart', 'adore'],
            examples: ['/love @user', 'p!love @user'],
        };
        super(options);
    }
    loveMessages = [
        'sends love to 💕',
        'loves 💖',
        'adores 💗',
        'sends hearts to 💕',
        'loves deeply 💖',
        'is filled with love for 💗',
        'sends lots of love to 💕',
        'loves with all their heart 💖',
    ];
    async executeSlash(interaction) {
        const user = interaction.options.getUser('user') || interaction.user;
        const message = this.loveMessages[Math.floor(Math.random() * this.loveMessages.length)];
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.fun} 💕 Love`)
            .setColor(COLORS.success)
            .setDescription(`${interaction.user} ${message} ${user}`)
            .setTimestamp();
        await interaction.reply({ embeds: [embed] });
    }
    async executePrefix(message) {
        const user = message.mentions.users.first() || message.author;
        const loveMessage = this.loveMessages[Math.floor(Math.random() * this.loveMessages.length)];
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.fun} 💕 Love`)
            .setColor(COLORS.success)
            .setDescription(`${message.author} ${loveMessage} ${user}`)
            .setTimestamp();
        await message.reply({ embeds: [embed] });
    }
}
export default LoveCommand;
