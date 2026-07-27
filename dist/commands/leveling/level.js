// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';
import { calculateXPForLevel } from '../../handlers/LevelingHandler.js';
export class LevelCommand extends BaseCommand {
    constructor() {
        super({
            name: 'level',
            description: 'Check your current level and XP progress',
            category: 'leveling',
            premiumTier: 'free',
            cooldown: 5,
            ownerOnly: false,
            guildOnly: true,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['lvl', 'myrank'],
            examples: ['p!level', 'p!level @user', '/level', '/level @user'],
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
        const leveling = await prisma.leveling.upsert({
            where: { userId_guildId: { userId, guildId } },
            create: { userId, guildId, xp: 0, level: 0 },
            update: {},
        });
        const level = leveling.level;
        const xpForNext = calculateXPForLevel(level + 1) - calculateXPForLevel(level);
        const xpProgress = leveling.xp - calculateXPForLevel(level);
        const progressPercent = xpForNext > 0 ? Math.min(100, Math.floor((xpProgress / xpForNext) * 100)) : 100;
        const barFilled = Math.floor(progressPercent / 5);
        const bar = `${'█'.repeat(barFilled)}${'░'.repeat(20 - barFilled)} ${progressPercent}%`;
        return { leveling, xpForNext, xpProgress, bar };
    }
    async executeSlash(i) {
        const target = i.options.getUser('user') || i.user;
        await i.deferReply();
        try {
            const { leveling, xpForNext, xpProgress, bar } = await this.getData(target.id, i.guildId);
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.leveling} ${target.username}'s Level`)
                .setColor(COLORS.default)
                .setThumbnail(target.displayAvatarURL({ size: 128 }))
                .setDescription(`**Level:** ${leveling.level}\n` +
                `**XP:** ${xpProgress} / ${xpForNext} to next level\n` +
                `**Total XP Earned:** ${leveling.totalXpEarned}\n` +
                `**Messages:** ${leveling.totalMessages}\n` +
                `**Voice Time:** ${leveling.voiceMinutes} min\n\n` +
                `**Progress:** ${bar}`)
                .setTimestamp();
            await i.editReply({ embeds: [embed] });
        }
        catch (e) {
            await i.editReply({ content: `${EMOJIS.error} Failed to fetch level data.` });
        }
    }
    async executePrefix(m, _args) {
        const target = m.mentions.users.first() || m.author;
        try {
            const { leveling, xpForNext, xpProgress, bar } = await this.getData(target.id, m.guildId);
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.leveling} ${target.username}'s Level`)
                .setColor(COLORS.default)
                .setThumbnail(target.displayAvatarURL({ size: 128 }))
                .setDescription(`**Level:** ${leveling.level}\n` +
                `**XP:** ${xpProgress} / ${xpForNext} to next level\n` +
                `**Total XP Earned:** ${leveling.totalXpEarned}\n` +
                `**Messages:** ${leveling.totalMessages}\n` +
                `**Voice Time:** ${leveling.voiceMinutes} min\n\n` +
                `**Progress:** ${bar}`)
                .setTimestamp();
            await m.reply({ embeds: [embed] });
        }
        catch {
            await m.reply(`${EMOJIS.error} Failed to fetch level data.`);
        }
    }
}
export default LevelCommand;
