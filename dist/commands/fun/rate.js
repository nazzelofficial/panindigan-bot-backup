// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class RateCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'rate',
            description: 'Rate something or someone',
            category: 'fun',
            cooldown: 5,
            userPermissions: [],
            botPermissions: [],
            guildOnly: false,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['rating', 'score'],
            examples: ['/rate pizza', 'p!rate @user'],
        };
        super(options);
    }
    async executeSlash(interaction) {
        const target = interaction.options.getString('target') || 'you';
        const rating = Math.floor(Math.random() * 10) + 1;
        const stars = '⭐'.repeat(rating) + '☆'.repeat(10 - rating);
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.fun} Rating`)
            .setColor(COLORS.info)
            .setDescription(`I rate ${target} ${rating}/10`)
            .addFields([
            { name: 'Rating', value: stars, inline: false },
        ])
            .setTimestamp();
        await interaction.reply({ embeds: [embed] });
    }
    async executePrefix(message) {
        const _args = message.content.split(' ').slice(1);
        const target = _args.join(' ') || 'you';
        const rating = Math.floor(Math.random() * 10) + 1;
        const stars = '⭐'.repeat(rating) + '☆'.repeat(10 - rating);
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.fun} Rating`)
            .setColor(COLORS.info)
            .setDescription(`I rate ${target} ${rating}/10`)
            .addFields([
            { name: 'Rating', value: stars, inline: false },
        ])
            .setTimestamp();
        await message.reply({ embeds: [embed] });
    }
}
export default RateCommand;
