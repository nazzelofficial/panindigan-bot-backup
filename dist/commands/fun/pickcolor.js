// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { EMOJIS } from '../../utils/Constants.js';
export class PickColorCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'pickcolor',
            description: 'Pick a random color',
            category: 'fun',
            cooldown: 3,
            userPermissions: [],
            botPermissions: [],
            guildOnly: false,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['randomcolor', 'color'],
            examples: ['/pickcolor', 'p!pickcolor'],
        };
        super(options);
    }
    colors = [
        { name: 'Red', hex: '#FF0000' },
        { name: 'Blue', hex: '#0000FF' },
        { name: 'Green', hex: '#00FF00' },
        { name: 'Yellow', hex: '#FFFF00' },
        { name: 'Purple', hex: '#800080' },
        { name: 'Orange', hex: '#FFA500' },
        { name: 'Pink', hex: '#FFC0CB' },
        { name: 'Cyan', hex: '#00FFFF' },
        { name: 'Magenta', hex: '#FF00FF' },
        { name: 'Lime', hex: '#00FF00' },
        { name: 'Teal', hex: '#008080' },
        { name: 'Indigo', hex: '#4B0082' },
        { name: 'Violet', hex: '#EE82EE' },
        { name: 'Gold', hex: '#FFD700' },
        { name: 'Silver', hex: '#C0C0C0' },
    ];
    async executeSlash(interaction) {
        const color = this.colors[Math.floor(Math.random() * this.colors.length)];
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.fun} 🎨 Random Color`)
            .setColor(parseInt(color.hex.replace('#', ''), 16))
            .setDescription(`I picked: **${color.name}**`)
            .addFields([
            { name: 'Color', value: color.name, inline: true },
            { name: 'Hex', value: color.hex, inline: true },
        ])
            .setTimestamp();
        await interaction.reply({ embeds: [embed] });
    }
    async executePrefix(message) {
        const color = this.colors[Math.floor(Math.random() * this.colors.length)];
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.fun} 🎨 Random Color`)
            .setColor(parseInt(color.hex.replace('#', ''), 16))
            .setDescription(`I picked: **${color.name}**`)
            .addFields([
            { name: 'Color', value: color.name, inline: true },
            { name: 'Hex', value: color.hex, inline: true },
        ])
            .setTimestamp();
        await message.reply({ embeds: [embed] });
    }
}
export default PickColorCommand;
