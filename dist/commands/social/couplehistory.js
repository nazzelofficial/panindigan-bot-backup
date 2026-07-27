// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { coupleProfileService } from '../../features/couple/CoupleProfileService.js';
import { coupleHistoryService } from '../../features/couple/CoupleHistoryService.js';
export class CoupleHistoryCommand extends BaseCommand {
    constructor() {
        super({ name: 'couplehistory', description: 'View complete couple milestone history 📖', category: 'social', premiumTier: 'gold', cooldown: 5, guildOnly: true, slashCommand: true, prefixCommand: true, aliases: ['relationshiphistory', 'milestones'], examples: ['/couplehistory', 'p!couplehistory'] });
    }
    buildSlashCommand() {
        return (new SlashCommandBuilder().setName(this.name).setDescription(this.description).setDMPermission(false));
    }
    async handle(userId, guildId, send) {
        const profile = await coupleProfileService.getProfile(userId, guildId);
        if (!profile) {
            await send({ content: '❌ You are not in a couple!', ephemeral: true });
            return;
        }
        const partnerId = profile.userId1 === userId ? profile.userId2 : profile.userId1;
        const history = await coupleHistoryService.getHistory(userId, partnerId, guildId).catch(() => []);
        const marriedAt = new Date(profile.marriedAt);
        const days = Math.floor((Date.now() - marriedAt.getTime()) / 86400000);
        // Built-in milestones based on days together
        const milestoneEvents = [
            { days: 1, label: '💑 Got together', ts: marriedAt },
            days >= 7 && { days: 7, label: '🌟 1 week together', ts: new Date(marriedAt.getTime() + 7 * 86400000) },
            days >= 14 && { days: 14, label: '💕 2 weeks together', ts: new Date(marriedAt.getTime() + 14 * 86400000) },
            days >= 30 && { days: 30, label: '🥂 1 month together', ts: new Date(marriedAt.getTime() + 30 * 86400000) },
            days >= 100 && { days: 100, label: '🏅 100 days together', ts: new Date(marriedAt.getTime() + 100 * 86400000) },
            days >= 180 && { days: 180, label: '🎖️ 6 months together', ts: new Date(marriedAt.getTime() + 180 * 86400000) },
            days >= 365 && { days: 365, label: '🏆 1 year together', ts: new Date(marriedAt.getTime() + 365 * 86400000) },
        ].filter(Boolean);
        // Merge with real history events
        const allEvents = [
            ...milestoneEvents.map(e => ({ label: e.label, ts: e.ts, type: 'milestone' })),
            ...history.map((h) => ({ label: h.event === 'divorced' ? '💔 Separated' : `📝 ${h.event}`, ts: new Date(h.createdAt), type: 'event' })),
        ].sort((a, b) => a.ts.getTime() - b.ts.getTime());
        const embed = new EmbedBuilder()
            .setTitle('📖 Couple History & Milestones')
            .setColor(0xff69b4)
            .setDescription(`💑 <@${userId}> ❤️ <@${partnerId}> — **${days} days** together\n\n${allEvents.slice(0, 20).map(e => `${e.label}\n> <t:${Math.floor(e.ts.getTime() / 1000)}:D>`).join('\n\n') || 'No history recorded yet.'}`)
            .setFooter({ text: 'Couple milestone history • Panindigan Social' })
            .setTimestamp();
        await send({ embeds: [embed] });
    }
    async executeSlash(i) {
        await this.handle(i.user.id, i.guildId, (c) => i.reply(c));
    }
    async executePrefix(m, _args) {
        await this.handle(m.author.id, m.guildId, (c) => m.reply(c));
    }
}
export default CoupleHistoryCommand;
