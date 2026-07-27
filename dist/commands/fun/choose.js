// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class ChooseCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'choose',
            description: 'Choose between multiple options',
            category: 'fun',
            cooldown: 3,
            userPermissions: [],
            botPermissions: [],
            guildOnly: false,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['pick', 'select'],
            examples: ['/choose pizza burger', 'p!choose red blue green'],
        };
        super(options);
    }
    async executeSlash(interaction) {
        const options = interaction.options.getString('options') || '';
        const choices = options.split(',').map((s) => s.trim()).filter((s) => s.length > 0);
        if (choices.length < 2) {
            const errorEmbed = new EmbedBuilder()
                .setTitle(`${EMOJIS.error} Error`)
                .setColor(COLORS.error)
                .setDescription('Please provide at least 2 choices separated by commas.')
                .setTimestamp();
            await interaction.reply({ embeds: [errorEmbed] });
            return;
        }
        const choice = choices[Math.floor(Math.random() * choices.length)];
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.fun} I Choose`)
            .setColor(COLORS.info)
            .setDescription(`I choose: **${choice}**`)
            .addFields([
            { name: 'Options', value: choices.join(', '), inline: false },
        ])
            .setTimestamp();
        await interaction.reply({ embeds: [embed] });
    }
    async executePrefix(message) {
        const _args = message.content.split(' ').slice(1);
        const choices = _args.join(' ').split(',').map((s) => s.trim()).filter((s) => s.length > 0);
        if (choices.length < 2) {
            const errorEmbed = new EmbedBuilder()
                .setTitle(`${EMOJIS.error} Error`)
                .setColor(COLORS.error)
                .setDescription('Please provide at least 2 choices separated by commas.')
                .setTimestamp();
            await message.reply({ embeds: [errorEmbed] });
            return;
        }
        const choice = choices[Math.floor(Math.random() * choices.length)];
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.fun} I Choose`)
            .setColor(COLORS.info)
            .setDescription(`I choose: **${choice}**`)
            .addFields([
            { name: 'Options', value: choices.join(', '), inline: false },
        ])
            .setTimestamp();
        await message.reply({ embeds: [embed] });
    }
}
export default ChooseCommand;
