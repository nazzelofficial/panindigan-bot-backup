// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class QueueLimitCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'queuelimit',
            description: 'Set the maximum queue size',
            category: 'music',
            cooldown: 5,
            userPermissions: [PermissionFlagsBits.ManageGuild],
            botPermissions: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
            guildOnly: true,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['maxqueue', 'limitqueue'],
            examples: ['/queuelimit 50', 'p!queuelimit 100'],
        };
        super(options);
    }
    async executeSlash(interaction) {
        const limit = interaction.options.getInteger('limit');
        if (limit === null || limit < 1 || limit > 500) {
            await interaction.reply({ content: '❌ Please provide a valid limit between 1 and 500.', ephemeral: true });
            return;
        }
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
            if (!player) {
                await interaction.reply({ content: '❌ Nothing is currently playing.', ephemeral: true });
                return;
            }
            player.queueLimit = limit;
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.music} Queue Limit Set`)
                .setColor(COLORS.success)
                .addFields([
                { name: 'Limit', value: limit.toString(), inline: true },
                { name: 'Set by', value: interaction.user.tag, inline: true },
            ])
                .setTimestamp();
            await interaction.reply({ embeds: [embed] });
        }
        catch (error) {
            await interaction.reply({ content: '❌ Failed to set queue limit.', ephemeral: true });
        }
    }
    async executePrefix(message, _args) {
        const limit = parseInt(args[0]);
        if (isNaN(limit) || limit < 1 || limit > 500) {
            await message.reply('❌ Please provide a valid limit between 1 and 500.');
            return;
        }
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
            if (!player) {
                await message.reply('❌ Nothing is currently playing.');
                return;
            }
            player.queueLimit = limit;
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.music} Queue Limit Set`)
                .setColor(COLORS.success)
                .addFields([
                { name: 'Limit', value: limit.toString(), inline: true },
                { name: 'Set by', value: message.author.tag, inline: true },
            ])
                .setTimestamp();
            await message.reply({ embeds: [embed] });
        }
        catch (error) {
            await message.reply('❌ Failed to set queue limit.');
        }
    }
}
export default QueueLimitCommand;
