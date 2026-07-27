// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class RegionCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'region',
            description: 'Display the server region',
            category: 'info',
            cooldown: 5,
            userPermissions: [],
            botPermissions: [],
            guildOnly: true,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['serverregion'],
            examples: ['/region', 'p!region'],
        };
        super(options);
    }
    async executeSlash(interaction) {
        const guild = interaction.guild;
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.info} Server Region`)
            .setColor(COLORS.info)
            .addFields([
            { name: 'Region', value: guild.preferredLocale || 'Unknown', inline: true },
        ])
            .setTimestamp();
        await interaction.reply({ embeds: [embed] });
    }
    async executePrefix(message) {
        const guild = message.guild;
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.info} Server Region`)
            .setColor(COLORS.info)
            .addFields([
            { name: 'Region', value: guild.preferredLocale || 'Unknown', inline: true },
        ])
            .setTimestamp();
        await message.reply({ embeds: [embed] });
    }
}
export default RegionCommand;
