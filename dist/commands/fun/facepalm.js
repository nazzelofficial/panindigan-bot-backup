// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class FacepalmCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'facepalm',
            description: 'Facepalm at someone',
            category: 'fun',
            cooldown: 5,
            userPermissions: [],
            botPermissions: [],
            guildOnly: false,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['palm'],
            examples: ['/facepalm', 'p!facepalm'],
        };
        super(options);
    }
    async executeSlash(interaction) {
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.fun} 🤦 Facepalm`)
            .setColor(COLORS.info)
            .setDescription(`${interaction.user} facepalms 🤦‍♂️`)
            .setImage('https://media.giphy.com/media/1HQIBIh8z4J6g/giphy.gif')
            .setTimestamp();
        await interaction.reply({ embeds: [embed] });
    }
    async executePrefix(message) {
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.fun} 🤦 Facepalm`)
            .setColor(COLORS.info)
            .setDescription(`${message.author} facepalms 🤦‍♂️`)
            .setImage('https://media.giphy.com/media/1HQIBIh8z4J6g/giphy.gif')
            .setTimestamp();
        await message.reply({ embeds: [embed] });
    }
}
export default FacepalmCommand;
