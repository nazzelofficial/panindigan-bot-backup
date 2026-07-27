// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';
export class LeaderboardCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'leaderboard',
            description: 'View the economy leaderboard',
            category: 'economy',
            cooldown: 10,
            userPermissions: [],
            botPermissions: [],
            guildOnly: true,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['lb', 'rich', 'baltop'],
            examples: ['/leaderboard', 'p!leaderboard'],
        };
        super(options);
    }
    async executeSlash(interaction) {
        if (!interaction.guildId)
            return;
        try {
            const prisma = getPrismaClient();
            const guild = await prisma.guild.upsert({
                where: { guildId: interaction.guildId },
                update: {},
                create: { guildId: interaction.guildId },
            });
            const economies = await prisma.economy.findMany({
                where: { guildId: interaction.guildId },
                orderBy: [
                    { wallet: 'desc' },
                    { bank: 'desc' },
                ],
                take: 10,
            });
            if (economies.length === 0) {
                await interaction.reply({ content: '❌ No economy data available yet.', ephemeral: true });
                return;
            }
            const leaderboard = await Promise.all(economies.map(async (economy, index) => {
                try {
                    const user = await prisma.user.findUnique({
                        where: { userId: economy.userId },
                    });
                    const total = economy.wallet + economy.bank;
                    return `${index + 1}. **${user?.username || 'Unknown'}** - ${total.toLocaleString()} ${guild.currencySymbol || '💰'}`;
                }
                catch {
                    return `${index + 1}. **Unknown** - 0 ${guild.currencySymbol || '💰'}`;
                }
            }));
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.economy} Economy Leaderboard`)
                .setColor(COLORS.info)
                .setDescription(leaderboard.join('\n'))
                .setTimestamp();
            await interaction.reply({ embeds: [embed] });
        }
        catch (error) {
            await interaction.reply({ content: '❌ Failed to fetch leaderboard.', ephemeral: true });
        }
    }
    async executePrefix(message) {
        if (!message.guildId)
            return;
        try {
            const prisma = getPrismaClient();
            const guild = await prisma.guild.upsert({
                where: { guildId: message.guildId },
                update: {},
                create: { guildId: message.guildId },
            });
            const economies = await prisma.economy.findMany({
                where: { guildId: message.guildId },
                orderBy: [
                    { wallet: 'desc' },
                    { bank: 'desc' },
                ],
                take: 10,
            });
            if (economies.length === 0) {
                await message.reply('❌ No economy data available yet.');
                return;
            }
            const leaderboard = await Promise.all(economies.map(async (economy, index) => {
                try {
                    const user = await prisma.user.findUnique({
                        where: { userId: economy.userId },
                    });
                    const total = economy.wallet + economy.bank;
                    return `${index + 1}. **${user?.username || 'Unknown'}** - ${total.toLocaleString()} ${guild.currencySymbol || '💰'}`;
                }
                catch {
                    return `${index + 1}. **Unknown** - 0 ${guild.currencySymbol || '💰'}`;
                }
            }));
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.economy} Economy Leaderboard`)
                .setColor(COLORS.info)
                .setDescription(leaderboard.join('\n'))
                .setTimestamp();
            await message.reply({ embeds: [embed] });
        }
        catch (error) {
            await message.reply('❌ Failed to fetch leaderboard.');
        }
    }
}
export default LeaderboardCommand;
