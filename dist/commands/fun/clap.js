// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class ClapCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'clap',
            description: 'Clap for someone',
            category: 'fun',
            cooldown: 5,
            userPermissions: [],
            botPermissions: [],
            guildOnly: false,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['applaud'],
            examples: ['/clap @user', 'p!clap @user'],
        };
        super(options);
    }
    clapMessages = [
        'claps for',
        'gives a round of applause to',
        'claps enthusiastically for',
        'gives a standing ovation to',
        'claps excitedly for',
        'gives thunderous applause to',
        'claps with appreciation for',
        'gives a big hand to',
    ];
    async executeSlash(interaction) {
        const user = interaction.options.getUser('user') || interaction.user;
        const message = this.clapMessages[Math.floor(Math.random() * this.clapMessages.length)];
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.fun} 👏 Clap`)
            .setColor(COLORS.info)
            .setDescription(`${interaction.user} ${message} ${user}`)
            .setImage('https://media.giphy.com/media/1HQIBIh8z4J6g/giphy.gif')
            .setTimestamp();
        await interaction.reply({ embeds: [embed] });
    }
    async executePrefix(message) {
        const user = message.mentions.users.first() || message.author;
        const clapMessage = this.clapMessages[Math.floor(Math.random() * this.clapMessages.length)];
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.fun} 👏 Clap`)
            .setColor(COLORS.info)
            .setDescription(`${message.author} ${clapMessage} ${user}`)
            .setImage('https://media.giphy.com/media/1HQIBIh8z4J6g/giphy.gif')
            .setTimestamp();
        await message.reply({ embeds: [embed] });
    }
}
export default ClapCommand;
