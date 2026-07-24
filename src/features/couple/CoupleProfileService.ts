import { getPrismaClient } from '../../database/postgresql/client';
import { EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants';

export interface CoupleProfile {
  userId1: string;
  userId2: string;
  guildId: string;
  marriedAt: Date;
  sharedNickname?: string | null;
  customBg?: string | null;
  coupleGoals: any[];
  interactions: number;
  milestones: any[];
}

export class CoupleProfileService {
  private get prisma() { return getPrismaClient(); }

  async getProfile(userId: string, guildId: string): Promise<CoupleProfile | null> {
    return await this.prisma.couple.findFirst({
      where: {
        guildId,
        OR: [{ userId1: userId }, { userId2: userId }],
      },
    }) as CoupleProfile | null;
  }

  async getProfileById(coupleId: string): Promise<CoupleProfile | null> {
    return await this.prisma.couple.findUnique({ where: { id: coupleId } }) as CoupleProfile | null;
  }

  async setSharedNickname(userId: string, guildId: string, nickname: string): Promise<boolean> {
    const couple = await this.getProfile(userId, guildId);
    if (!couple) return false;

    await this.prisma.couple.updateMany({
      where: { guildId, userId1: couple.userId1, userId2: couple.userId2 },
      data: { sharedNickname: nickname },
    });
    return true;
  }

  async setBackground(userId: string, guildId: string, bgUrl: string): Promise<boolean> {
    const couple = await this.getProfile(userId, guildId);
    if (!couple) return false;

    await this.prisma.couple.updateMany({
      where: { guildId, userId1: couple.userId1, userId2: couple.userId2 },
      data: { customBg: bgUrl },
    });
    return true;
  }

  async addGoal(userId: string, guildId: string, goal: string): Promise<boolean> {
    const couple = await this.getProfile(userId, guildId);
    if (!couple) return false;

    const goals = couple.coupleGoals || [];
    goals.push({ goal, addedBy: userId, addedAt: new Date().toISOString(), completed: false });

    await this.prisma.couple.updateMany({
      where: { guildId, userId1: couple.userId1, userId2: couple.userId2 },
      data: { coupleGoals: goals },
    });
    return true;
  }

  async incrementInteractions(userId: string, guildId: string): Promise<void> {
    const couple = await this.getProfile(userId, guildId);
    if (!couple) return;

    await this.prisma.couple.updateMany({
      where: { guildId, userId1: couple.userId1, userId2: couple.userId2 },
      data: { interactions: { increment: 1 } },
    });
  }

  async addMilestone(userId: string, guildId: string, milestone: string): Promise<boolean> {
    const couple = await this.getProfile(userId, guildId);
    if (!couple) return false;

    const milestones = couple.milestones || [];
    milestones.push({ milestone, achievedAt: new Date().toISOString() });

    await this.prisma.couple.updateMany({
      where: { guildId, userId1: couple.userId1, userId2: couple.userId2 },
      data: { milestones },
    });
    return true;
  }

  buildCoupleEmbed(profile: CoupleProfile, user1Tag: string, user2Tag: string, user1Avatar: string, user2Avatar: string): EmbedBuilder {
    const daysTogether = Math.floor((Date.now() - new Date(profile.marriedAt).getTime()) / (1000 * 60 * 60 * 24));

    return new EmbedBuilder()
      .setTitle('💑 Couple Profile')
      .setColor(COLORS.diamond as any)
      .setDescription(profile.sharedNickname ? `**"${profile.sharedNickname}"**` : undefined)
      .addFields(
        { name: '💕 Partners', value: `${user1Tag} & ${user2Tag}`, inline: false },
        { name: '📅 Together Since', value: `<t:${Math.floor(new Date(profile.marriedAt).getTime() / 1000)}:D>`, inline: true },
        { name: '⏰ Days Together', value: `${daysTogether} days`, inline: true },
        { name: '💬 Interactions', value: `${profile.interactions}`, inline: true },
        { name: '🎯 Goals', value: `${(profile.coupleGoals || []).length} goal(s)`, inline: true },
        { name: '🏆 Milestones', value: `${(profile.milestones || []).length}`, inline: true },
      )
      .setThumbnail(user1Avatar)
      .setTimestamp();
  }
}

export const coupleProfileService = new CoupleProfileService();
