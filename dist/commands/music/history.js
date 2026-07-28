// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class HistoryCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'queuehistory',
            description: 'View the song history for this session',
            category: 'music',
            cooldown: 5,
            userPermissions: [PermissionFlagsBits.Connect],
            botPermissions: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
            guildOnly: true,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['songhistory', 'played'],
            examples: ['/history', 'p!history'],
        };
        super(options);
    }
    async executeSlash(interaction) {
        if (!interaction.guildId)
            return;
        try {
            const client = interaction.client;
            const musicManager = client.kazagumo;
            if (!musicManager) {
                await interaction.reply({ content: '❌ Music system is not available.', ephemeral: true });
                return;
            }
            const player = client.kazagumo.players.get(interaction.guildId);
            if (!player || !player.history || player.history.length === 0) {
                await interaction.reply({ content: '❌ No song history available.', ephemeral: true });
                return;
            }
            const historyList = player.history.slice(0, 10).map((song, index) => `${index + 1}. ${song.title} (${song.duration || 'Unknown'})`).join('\n');
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.music} Song History`)
                .setColor(COLORS.info)
                .addFields([
                { name: 'Total Played', value: player.history.length.toString(), inline: true },
                { name: 'Recent Songs (Last 10)', value: historyList, inline: false },
            ])
                .setTimestamp();
            await interaction.reply({ embeds: [embed] });
        }
        catch (error) {
            await interaction.reply({ content: '❌ Failed to fetch history.', ephemeral: true });
        }
    }
    async executePrefix(message) {
        if (!message.guildId)
            return;
        try {
            const client = message.client;
            const musicManager = client.kazagumo;
            if (!musicManager) {
                await message.reply('❌ Music system is not available.');
                return;
            }
            const player = client.kazagumo.players.get(message.guildId);
            if (!player || !player.history || player.history.length === 0) {
                await message.reply('❌ No song history available.');
                return;
            }
            const historyList = player.history.slice(0, 10).map((song, index) => `${index + 1}. ${song.title} (${song.duration || 'Unknown'})`).join('\n');
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.music} Song History`)
                .setColor(COLORS.info)
                .addFields([
                { name: 'Total Played', value: player.history.length.toString(), inline: true },
                { name: 'Recent Songs (Last 10)', value: historyList, inline: false },
            ])
                .setTimestamp();
            await message.reply({ embeds: [embed] });
        }
        catch (error) {
            await message.reply('❌ Failed to fetch history.');
        }
    }
}
export default HistoryCommand;
