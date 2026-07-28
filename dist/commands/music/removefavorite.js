// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';
export class RemoveFavoriteCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'removefavorite',
            description: 'Remove a song from your favorites',
            category: 'music',
            cooldown: 5,
            userPermissions: [PermissionFlagsBits.Connect],
            botPermissions: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
            guildOnly: true,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['rf', 'unfav', 'dislike'],
            examples: ['/removefavorite', 'p!removefavorite'],
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
            if (!player || !player.queue.current) {
                await interaction.reply({ content: '❌ Nothing is currently playing.', ephemeral: true });
                return;
            }
            const prisma = getPrismaClient();
            const user = await prisma.user.findUnique({
                where: { userId: interaction.user.id },
            });
            if (!user || !user.favoriteSongs) {
                await interaction.reply({ content: '❌ You have no favorite songs.', ephemeral: true });
                return;
            }
            const favoriteSongs = JSON.parse(user.favoriteSongs);
            const songIndex = favoriteSongs.findIndex((song) => song.title === player.queue.current.title);
            if (songIndex === -1) {
                await interaction.reply({ content: '❌ This song is not in your favorites.', ephemeral: true });
                return;
            }
            favoriteSongs.splice(songIndex, 1);
            await prisma.user.update({
                where: { userId: interaction.user.id },
                data: { favoriteSongs: JSON.stringify(favoriteSongs) },
            });
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.success} Removed from Favorites`)
                .setColor(COLORS.success)
                .addFields([
                { name: 'Song', value: player.queue.current.title, inline: true },
                { name: 'Removed by', value: interaction.user.tag, inline: true },
            ])
                .setTimestamp();
            await interaction.reply({ embeds: [embed] });
        }
        catch (error) {
            await interaction.reply({ content: '❌ Failed to remove from favorites.', ephemeral: true });
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
            if (!player || !player.queue.current) {
                await message.reply('❌ Nothing is currently playing.');
                return;
            }
            const prisma = getPrismaClient();
            const user = await prisma.user.findUnique({
                where: { userId: message.author.id },
            });
            if (!user || !user.favoriteSongs) {
                await message.reply('❌ You have no favorite songs.');
                return;
            }
            const favoriteSongs = JSON.parse(user.favoriteSongs);
            const songIndex = favoriteSongs.findIndex((song) => song.title === player.queue.current.title);
            if (songIndex === -1) {
                await message.reply('❌ This song is not in your favorites.');
                return;
            }
            favoriteSongs.splice(songIndex, 1);
            await prisma.user.update({
                where: { userId: message.author.id },
                data: { favoriteSongs: JSON.stringify(favoriteSongs) },
            });
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.success} Removed from Favorites`)
                .setColor(COLORS.success)
                .addFields([
                { name: 'Song', value: player.queue.current.title, inline: true },
                { name: 'Removed by', value: message.author.tag, inline: true },
            ])
                .setTimestamp();
            await message.reply({ embeds: [embed] });
        }
        catch (error) {
            await message.reply('❌ Failed to remove from favorites.');
        }
    }
}
export default RemoveFavoriteCommand;
