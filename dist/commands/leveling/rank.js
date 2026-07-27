// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';
export class RankCommand extends BaseCommand {
    constructor() {
        super({
            name: 'rank',
            description: 'Check your rank and level in this server',
            category: 'leveling',
            premiumTier: 'free',
            cooldown: 5,
            guildOnly: true,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['level', 'xp', 'lvl'],
            examples: ['/rank', '/rank @user', 'p!rank', 'p!rank @user'],
        });
    }
    buildSlashCommand() {
        return (new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addUserOption(o => o.setName('user').setDescription('User to check').setRequired(false))
            .setDMPermission(false));
    }
    async getData(userId, guildId) {
        const prisma = getPrismaClient();
        await prisma.user.upsert({ where: { userId_guildId: { userId, guildId } }, create: { userId, guildId }, update: {} });
        const leveling = await prisma.leveling.upsert({
            where: { userId_guildId: { userId, guildId } },
            create: { userId, guildId, xp: 0, level: 0, totalXp: 0 },
            update: {},
        });
        // Rank calculation
        const higherRanked = await prisma.leveling.count({
            where: { guildId, OR: [{ level: { gt: leveling.level } }, { level: leveling.level, xp: { gt: leveling.xp } }] },
        });
        const xpForCurrentLevel = Math.floor(5 * Math.pow(leveling.level, 2) + 50 * leveling.level + 100);
        const xpProgress = leveling.xp;
        const progressPercent = Math.min(100, Math.floor((xpProgress / xpForCurrentLevel) * 100));
        const barFilled = Math.floor(progressPercent / 5);
        const bar = `${'█'.repeat(barFilled)}${'░'.repeat(20 - barFilled)} ${progressPercent}%`;
        return { leveling, rank: higherRanked + 1, xpForCurrentLevel, bar };
    }
    async executeSlash(i) {
        const target = i.options.getUser('user') || i.user;
        await i.deferReply();
        try {
            const { leveling, rank, xpForCurrentLevel, bar } = await this.getData(target.id, i.guildId);
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.level || '⭐'} ${target.username}'s Rank`)
                .setColor(COLORS.default)
                .setThumbnail(target.displayAvatarURL({ size: 128 }))
                .addFields({ name: '🏆 Server Rank', value: `#${rank}`, inline: true }, { name: '📊 Level', value: `${leveling.level}`, inline: true }, { name: '✨ Total XP', value: `${leveling.totalXp}`, inline: true }, { name: `Progress to Level ${leveling.level + 1}`, value: `${bar}\n${leveling.xp} / ${xpForCurrentLevel} XP`, inline: false })
                .setTimestamp();
            await i.editReply({ embeds: [embed] });
        }
        catch (e) {
            await i.editReply({ content: '❌ Failed to fetch rank data.' });
        }
    }
    async executePrefix(m, _args) {
        const target = m.mentions.users.first() || m.author;
        try {
            const { leveling, rank, xpForCurrentLevel, bar } = await this.getData(target.id, m.guildId);
            const embed = new EmbedBuilder()
                .setTitle(`⭐ ${target.username}'s Rank`)
                .setColor(COLORS.default)
                .setThumbnail(target.displayAvatarURL({ size: 128 }))
                .addFields({ name: '🏆 Rank', value: `#${rank}`, inline: true }, { name: '📊 Level', value: `${leveling.level}`, inline: true }, { name: '✨ XP', value: `${leveling.xp} / ${xpForCurrentLevel}`, inline: true }, { name: 'Progress', value: bar, inline: false })
                .setTimestamp();
            await m.reply({ embeds: [embed] });
        }
        catch {
            await m.reply('❌ Failed to fetch rank data.');
        }
    }
}
export default RankCommand;
