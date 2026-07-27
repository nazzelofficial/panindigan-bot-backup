// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';
export class FavoritesCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'favorites',
            description: 'View your favorite songs',
            category: 'music',
            cooldown: 5,
            userPermissions: [PermissionFlagsBits.Connect],
            botPermissions: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
            guildOnly: true,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['favs', 'myfavorites'],
            examples: ['/favorites', 'p!favorites'],
        };
        super(options);
    }
    async executeSlash(interaction) {
        if (!interaction.guildId)
            return;
        try {
            const prisma = getPrismaClient();
            const user = await prisma.user.findUnique({
                where: { userId: interaction.user.id },
            });
            if (!user || !user.favoriteSongs || JSON.parse(user.favoriteSongs).length === 0) {
                await interaction.reply({ content: '❌ You have no favorite songs.', ephemeral: true });
                return;
            }
            const favoriteSongs = JSON.parse(user.favoriteSongs);
            const songList = favoriteSongs.slice(0, 10).map((song, index) => `${index + 1}. ${song.title} (${song.duration || 'Unknown'})`).join('\n');
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.music} Your Favorites`)
                .setColor(COLORS.info)
                .addFields([
                { name: 'Total Songs', value: favoriteSongs.length.toString(), inline: true },
                { name: 'Songs (First 10)', value: songList, inline: false },
            ])
                .setTimestamp();
            await interaction.reply({ embeds: [embed] });
        }
        catch (error) {
            await interaction.reply({ content: '❌ Failed to fetch favorites.', ephemeral: true });
        }
    }
    async executePrefix(message) {
        if (!message.guildId)
            return;
        try {
            const prisma = getPrismaClient();
            const user = await prisma.user.findUnique({
                where: { userId: message.author.id },
            });
            if (!user || !user.favoriteSongs || JSON.parse(user.favoriteSongs).length === 0) {
                await message.reply('❌ You have no favorite songs.');
                return;
            }
            const favoriteSongs = JSON.parse(user.favoriteSongs);
            const songList = favoriteSongs.slice(0, 10).map((song, index) => `${index + 1}. ${song.title} (${song.duration || 'Unknown'})`).join('\n');
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.music} Your Favorites`)
                .setColor(COLORS.info)
                .addFields([
                { name: 'Total Songs', value: favoriteSongs.length.toString(), inline: true },
                { name: 'Songs (First 10)', value: songList, inline: false },
            ])
                .setTimestamp();
            await message.reply({ embeds: [embed] });
        }
        catch (error) {
            await message.reply('❌ Failed to fetch favorites.');
        }
    }
}
export default FavoritesCommand;
