// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import { coupleProfileService } from '../../features/couple/CoupleProfileService.js';

export class CoupleStatsCommand extends BaseCommand {
  constructor() {
    super({ name: 'couplestats', description: 'View advanced relationship stats and milestones 📊', category: 'social', premiumTier: 'gold', cooldown: 5, guildOnly: true, slashCommand: true, prefixCommand: true, aliases: ['relationshipstats', 'lovestats'], examples: ['/couplestats', 'p!couplestats'] } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder().setName(this.name).setDescription(this.description).setDMPermission(false)) as SlashCommandBuilder;
  }

  private async handle(userId: string, guildId: string, send: (c: any) => Promise<any>, client: any): Promise<void> {
    const profile = await coupleProfileService.getProfile(userId, guildId);
    if (!profile) { await send({ content: '❌ You are not in a couple. Use `/marry @user` to propose!', ephemeral: true }); return; }

    const partnerId = profile.userId1 === userId ? profile.userId2 : profile.userId1;
    let partner;
    try { partner = await client.users.fetch(partnerId); } catch { /* ignored */ }

    const marriedAt = new Date(profile.marriedAt);
    const now = new Date();
    const days = Math.floor((now.getTime() - marriedAt.getTime()) / 86400000);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);

    // Calculate next milestone
    const milestones = [7, 14, 30, 60, 100, 180, 365, 500, 730, 1000];
    const nextMilestone = milestones.find(m => m > days);
    const daysUntilNext = nextMilestone ? nextMilestone - days : null;

    const embed = new EmbedBuilder()
      .setTitle('📊 Advanced Couple Stats')
      .setColor(0xff69b4)
      .setDescription(`💑 **${(await client.users.fetch(userId).catch(() => null))?.username || userId}** ❤️ **${partner?.username || partnerId}**`)
      .addFields(
        { name: '📅 Together Since', value: `<t:${Math.floor(marriedAt.getTime() / 1000)}:F>`, inline: false },
        { name: '⏰ Duration', value: `**${days}** days • **${weeks}** weeks • **${months}** months`, inline: false },
        { name: '💬 Interactions', value: `${profile.interactions || 0} interactions recorded`, inline: true },
        { name: '🎯 Next Milestone', value: nextMilestone ? `${nextMilestone} days (in **${daysUntilNext}** more days)` : '🌟 All milestones reached!', inline: true },
        { name: '💕 Shared Nickname', value: profile.sharedNickname || 'Not set — use `/couplenickname`', inline: false },
      )
      .setTimestamp();

    // Add milestone badges
    const earnedMilestones = milestones.filter(m => days >= m);
    if (earnedMilestones.length > 0) {
      embed.addFields({ name: '🏅 Earned Milestones', value: earnedMilestones.map(m => `${m} days ✅`).join(' • '), inline: false });
    }

    await send({ embeds: [embed] });
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    await this.handle(i.user.id, i.guildId!, (c) => i.reply(c), i.client);
  }

  public async executePrefix(m: Message, _args: string[]): Promise<void> {
    await this.handle(m.author.id, m.guildId!, (c) => m.reply(c), m.client);
  }
}
export default CoupleStatsCommand;
