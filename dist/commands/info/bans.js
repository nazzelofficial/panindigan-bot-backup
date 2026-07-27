// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { Formatter } from '../../utils/Formatter.js';
export class BansCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'bans',
            description: 'List all banned users in the server',
            category: 'info',
            cooldown: 5,
            userPermissions: ['BanMembers'],
            botPermissions: ['BanMembers'],
            guildOnly: true,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['banlist', 'listbans'],
            examples: ['/bans', 'p!bans'],
        };
        super(options);
    }
    async executeSlash(interaction) {
        const guild = interaction.guild;
        const bans = await guild.bans.fetch();
        if (bans.size === 0) {
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.info} Ban List`)
                .setColor(COLORS.info)
                .setDescription('There are no banned users in this server.')
                .setTimestamp();
            await interaction.reply({ embeds: [embed] });
            return;
        }
        const banList = bans.map(ban => `${ban.user.username} (${ban.user.id}) - ${ban.reason || 'No reason'}`).join('\n');
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.info} Ban List`)
            .setColor(COLORS.info)
            .setDescription(banList.substring(0, 4000))
            .addFields([
            { name: 'Total Bans', value: Formatter.formatNumber(bans.size), inline: true },
        ])
            .setTimestamp();
        await interaction.reply({ embeds: [embed] });
    }
    async executePrefix(message) {
        const guild = message.guild;
        const bans = await guild.bans.fetch();
        if (bans.size === 0) {
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.info} Ban List`)
                .setColor(COLORS.info)
                .setDescription('There are no banned users in this server.')
                .setTimestamp();
            await message.reply({ embeds: [embed] });
            return;
        }
        const banList = bans.map(ban => `${ban.user.username} (${ban.user.id}) - ${ban.reason || 'No reason'}`).join('\n');
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.info} Ban List`)
            .setColor(COLORS.info)
            .setDescription(banList.substring(0, 4000))
            .addFields([
            { name: 'Total Bans', value: Formatter.formatNumber(bans.size), inline: true },
        ])
            .setTimestamp();
        await message.reply({ embeds: [embed] });
    }
}
export default BansCommand;
