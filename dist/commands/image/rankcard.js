// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { SlashCommandBuilder, AttachmentBuilder } from 'discord.js';
import { ImageGenerator } from '../../structures/ImageGenerator.js';
import { getPrismaClient } from '../../database/postgresql/client.js';
export class RankcardCommand extends BaseCommand {
    constructor() {
        super({ name: 'rankcard', description: 'Preview your rank card with current stats', category: 'image', premiumTier: 'free', cooldown: 10, guildOnly: true, slashCommand: true, prefixCommand: true, aliases: ['rankcard-preview', 'myrank'], examples: ['/rankcard @user', 'p!rankcard'] });
    }
    buildSlashCommand() {
        return (new SlashCommandBuilder().setName(this.name).setDescription(this.description).addUserOption(o => o.setName('user').setDescription('User').setRequired(false)).setDMPermission(false));
    }
    async executeSlash(i) {
        const target = i.options.getMember('user') || i.member;
        const userId = target?.user?.id || i.user.id;
        await i.deferReply();
        const prisma = getPrismaClient();
        const userData = await prisma.user.findFirst({ where: { userId, guildId: i.guildId } });
        if (!userData) {
            await i.editReply({ content: '❌ No data found for this user.' });
            return;
        }
        try {
            const xpForLevel = (lvl) => Math.floor(100 * Math.pow(lvl, 1.5));
            const currentLevelXp = xpForLevel(userData.level || 0);
            const nextLevelXp = xpForLevel((userData.level || 0) + 1);
            const progress = Math.min(1, ((userData.xp || 0) - currentLevelXp) / (nextLevelXp - currentLevelXp));
            const rank = await prisma.user.count({ where: { guildId: i.guildId, xp: { gt: userData.xp || 0 } } }) + 1;
            const buf = await ImageGenerator.generateRankCard({
                username: i.options.getUser('user')?.username || i.user.username,
                discriminator: '0',
                avatarUrl: (i.options.getUser('user') || i.user).displayAvatarURL({ extension: 'png', size: 256 }),
                level: userData.level || 0,
                xp: userData.xp || 0,
                xpNeeded: nextLevelXp,
                rank,
                color: userData.customColor || '#5865F2',
            });
            await i.editReply({ files: [new AttachmentBuilder(buf, { name: 'rankcard.png' })] });
        }
        catch {
            await i.editReply({ content: '❌ Failed to generate rank card.' });
        }
    }
    async executePrefix(m, _args) {
        const target = m.mentions.users.first() || m.author;
        const prisma = getPrismaClient();
        const userData = await prisma.user.findFirst({ where: { userId: target.id, guildId: m.guildId } });
        if (!userData) {
            await m.reply('❌ No data found.');
            return;
        }
        try {
            const buf = await ImageGenerator.generateRankCard({ username: target.username, discriminator: '0', avatarUrl: target.displayAvatarURL({ extension: 'png', size: 256 }), level: userData.level || 0, xp: userData.xp || 0, xpNeeded: Math.floor(100 * Math.pow((userData.level || 0) + 1, 1.5)), rank: 0, color: '#5865F2' });
            await m.reply({ files: [new AttachmentBuilder(buf, { name: 'rankcard.png' })] });
        }
        catch {
            await m.reply('❌ Failed.');
        }
    }
}
export default RankcardCommand;
