// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class UniqueQueueCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'uniquequeue',
            description: 'Remove duplicate songs from the queue',
            category: 'music',
            cooldown: 5,
            userPermissions: [PermissionFlagsBits.Connect],
            botPermissions: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
            guildOnly: true,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['unique', 'removeduplicates'],
            examples: ['/uniquequeue', 'p!uniquequeue'],
        };
        super(options);
    }
    async executeSlash(interaction) {
        if (!interaction.guild || !interaction.member)
            return;
        const voiceChannel = interaction.member.voice.channel;
        if (!voiceChannel) {
            await interaction.reply({ content: '❌ You need to be in a voice channel to remove duplicates.', ephemeral: true });
            return;
        }
        try {
            const client = interaction.client;
            const musicManager = client.kazagumo;
            if (!musicManager) {
                await interaction.reply({ content: '❌ Music system is not available.', ephemeral: true });
                return;
            }
            const player = client.kazagumo.players.get(interaction.guild.id);
            if (!player) {
                await interaction.reply({ content: '❌ Nothing is currently playing.', ephemeral: true });
                return;
            }
            if (player.voiceChannel !== voiceChannel.id) {
                await interaction.reply({ content: '❌ You need to be in the same voice channel as the bot.', ephemeral: true });
                return;
            }
            const removedCount = await musicManager.removeDuplicates(interaction.guild.id);
            if (removedCount === 0) {
                await interaction.reply({ content: '❌ No duplicate songs found in the queue.', ephemeral: true });
                return;
            }
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.music} Duplicates Removed`)
                .setColor(COLORS.success)
                .addFields([
                { name: 'Removed', value: `${removedCount} songs`, inline: true },
                { name: 'Removed by', value: interaction.user.tag, inline: true },
            ])
                .setTimestamp();
            await interaction.reply({ embeds: [embed] });
        }
        catch (error) {
            await interaction.reply({ content: '❌ Failed to remove duplicates.', ephemeral: true });
        }
    }
    async executePrefix(message) {
        if (!message.guild || !message.member)
            return;
        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) {
            await message.reply('❌ You need to be in a voice channel to remove duplicates.');
            return;
        }
        try {
            const client = message.client;
            const musicManager = client.kazagumo;
            if (!musicManager) {
                await message.reply('❌ Music system is not available.');
                return;
            }
            const player = client.kazagumo.players.get(message.guild.id);
            if (!player) {
                await message.reply('❌ Nothing is currently playing.');
                return;
            }
            if (player.voiceChannel !== voiceChannel.id) {
                await message.reply('❌ You need to be in the same voice channel as the bot.');
                return;
            }
            const removedCount = await musicManager.removeDuplicates(message.guild.id);
            if (removedCount === 0) {
                await message.reply('❌ No duplicate songs found in the queue.');
                return;
            }
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.music} Duplicates Removed`)
                .setColor(COLORS.success)
                .addFields([
                { name: 'Removed', value: `${removedCount} songs`, inline: true },
                { name: 'Removed by', value: message.author.tag, inline: true },
            ])
                .setTimestamp();
            await message.reply({ embeds: [embed] });
        }
        catch (error) {
            await message.reply('❌ Failed to remove duplicates.');
        }
    }
}
export default UniqueQueueCommand;
