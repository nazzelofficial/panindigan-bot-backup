import { EmbedBuilder } from 'discord.js';
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
export declare class CoupleProfileService {
    private get prisma();
    getProfile(userId: string, guildId: string): Promise<CoupleProfile | null>;
    getProfileById(coupleId: string): Promise<CoupleProfile | null>;
    setSharedNickname(userId: string, guildId: string, nickname: string): Promise<boolean>;
    setBackground(userId: string, guildId: string, bgUrl: string): Promise<boolean>;
    addGoal(userId: string, guildId: string, goal: string): Promise<boolean>;
    incrementInteractions(userId: string, guildId: string): Promise<void>;
    addMilestone(userId: string, guildId: string, milestone: string): Promise<boolean>;
    buildCoupleEmbed(profile: CoupleProfile, user1Tag: string, user2Tag: string, user1Avatar: string, user2Avatar: string): EmbedBuilder;
}
export declare const coupleProfileService: CoupleProfileService;
//# sourceMappingURL=CoupleProfileService.d.ts.map