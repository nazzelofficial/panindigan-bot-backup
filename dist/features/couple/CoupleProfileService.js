// @ts-nocheck
import { getPrismaClient } from '../../database/postgresql/client.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
export class CoupleProfileService {
    get prisma() { return getPrismaClient(); }
    async getProfile(userId, guildId) {
        return await this.prisma.couple.findFirst({
            where: {
                guildId,
                OR: [{ userId1: userId }, { userId2: userId }],
            },
        });
    }
    async getProfileById(coupleId) {
        return await this.prisma.couple.findUnique({ where: { id: coupleId } });
    }
    async setSharedNickname(userId, guildId, nickname) {
        const couple = await this.getProfile(userId, guildId);
        if (!couple)
            return false;
        await this.prisma.couple.updateMany({
            where: { guildId, userId1: couple.userId1, userId2: couple.userId2 },
            data: { sharedNickname: nickname },
        });
        return true;
    }
    async setBackground(userId, guildId, bgUrl) {
        const couple = await this.getProfile(userId, guildId);
        if (!couple)
            return false;
        await this.prisma.couple.updateMany({
            where: { guildId, userId1: couple.userId1, userId2: couple.userId2 },
            data: { customBg: bgUrl },
        });
        return true;
    }
    async addGoal(userId, guildId, goal) {
        const couple = await this.getProfile(userId, guildId);
        if (!couple)
            return false;
        const goals = couple.coupleGoals || [];
        goals.push({ goal, addedBy: userId, addedAt: new Date().toISOString(), completed: false });
        await this.prisma.couple.updateMany({
            where: { guildId, userId1: couple.userId1, userId2: couple.userId2 },
            data: { coupleGoals: goals },
        });
        return true;
    }
    async incrementInteractions(userId, guildId) {
        const couple = await this.getProfile(userId, guildId);
        if (!couple)
            return;
        await this.prisma.couple.updateMany({
            where: { guildId, userId1: couple.userId1, userId2: couple.userId2 },
            data: { interactions: { increment: 1 } },
        });
    }
    async addMilestone(userId, guildId, milestone) {
        const couple = await this.getProfile(userId, guildId);
        if (!couple)
            return false;
        const milestones = couple.milestones || [];
        milestones.push({ milestone, achievedAt: new Date().toISOString() });
        await this.prisma.couple.updateMany({
            where: { guildId, userId1: couple.userId1, userId2: couple.userId2 },
            data: { milestones },
        });
        return true;
    }
    buildCoupleEmbed(profile, user1Tag, user2Tag, user1Avatar, user2Avatar) {
        const daysTogether = Math.floor((Date.now() - new Date(profile.marriedAt).getTime()) / (1000 * 60 * 60 * 24));
        return new EmbedBuilder()
            .setTitle('💑 Couple Profile')
            .setColor(COLORS.diamond)
            .setDescription(profile.sharedNickname ? `**"${profile.sharedNickname}"**` : undefined)
            .addFields({ name: '💕 Partners', value: `${user1Tag} & ${user2Tag}`, inline: false }, { name: '📅 Together Since', value: `<t:${Math.floor(new Date(profile.marriedAt).getTime() / 1000)}:D>`, inline: true }, { name: '⏰ Days Together', value: `${daysTogether} days`, inline: true }, { name: '💬 Interactions', value: `${profile.interactions}`, inline: true }, { name: '🎯 Goals', value: `${(profile.coupleGoals || []).length} goal(s)`, inline: true }, { name: '🏆 Milestones', value: `${(profile.milestones || []).length}`, inline: true })
            .setThumbnail(user1Avatar)
            .setTimestamp();
    }
}
export const coupleProfileService = new CoupleProfileService();
