// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class CheerCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'cheer',
            description: 'Cheer for someone',
            category: 'fun',
            cooldown: 5,
            userPermissions: [],
            botPermissions: [],
            guildOnly: false,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['yay'],
            examples: ['/cheer @user', 'p!cheer @user'],
        };
        super(options);
    }
    cheerMessages = [
        'cheers for',
        'gives a big cheer to',
        'cheers enthusiastically for',
        'gives a rousing cheer to',
        'cheers excitedly for',
        'gives a supportive cheer to',
        'cheers with joy for',
        'gives a celebratory cheer to',
    ];
    async executeSlash(interaction) {
        const user = interaction.options.getUser('user') || interaction.user;
        const message = this.cheerMessages[Math.floor(Math.random() * this.cheerMessages.length)];
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.fun} 🎉 Cheer`)
            .setColor(COLORS.info)
            .setDescription(`${interaction.user} ${message} ${user}`)
            .setImage('https://media.giphy.com/media/1HQIBIh8z4J6g/giphy.gif')
            .setTimestamp();
        await interaction.reply({ embeds: [embed] });
    }
    async executePrefix(message) {
        const user = message.mentions.users.first() || message.author;
        const cheerMessage = this.cheerMessages[Math.floor(Math.random() * this.cheerMessages.length)];
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.fun} 🎉 Cheer`)
            .setColor(COLORS.info)
            .setDescription(`${message.author} ${cheerMessage} ${user}`)
            .setImage('https://media.giphy.com/media/1HQIBIh8z4J6g/giphy.gif')
            .setTimestamp();
        await message.reply({ embeds: [embed] });
    }
}
export default CheerCommand;
