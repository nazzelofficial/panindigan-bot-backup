// @ts-nocheck
import { getCollection } from '../../database/mongodb/client.js';
export class CoupleHistoryService {
    get col() { return getCollection('couple_history'); }
    async addEntry(entry) {
        try {
            await this.col.insertOne({ ...entry, timestamp: new Date() });
        }
        catch (error) {
            console.error('Error adding couple history entry:', error);
        }
    }
    async getHistory(userId1, userId2, guildId, limit = 20) {
        try {
            const [u1, u2] = [userId1, userId2].sort();
            return await this.col
                .find({ userId1: u1, userId2: u2, guildId })
                .sort({ timestamp: -1 })
                .limit(limit)
                .toArray();
        }
        catch {
            return [];
        }
    }
    async getUserHistory(userId, guildId, limit = 20) {
        try {
            return await this.col
                .find({ guildId, $or: [{ userId1: userId }, { userId2: userId }] })
                .sort({ timestamp: -1 })
                .limit(limit)
                .toArray();
        }
        catch {
            return [];
        }
    }
    async recordMarriage(userId1, userId2, guildId) {
        const [u1, u2] = [userId1, userId2].sort();
        await this.addEntry({ userId1: u1, userId2: u2, guildId, event: 'married', details: 'Became a couple' });
    }
    async recordDivorce(userId1, userId2, guildId) {
        const [u1, u2] = [userId1, userId2].sort();
        await this.addEntry({ userId1: u1, userId2: u2, guildId, event: 'divorced', details: 'Couple ended' });
    }
    async recordMilestone(userId1, userId2, guildId, milestone) {
        const [u1, u2] = [userId1, userId2].sort();
        await this.addEntry({ userId1: u1, userId2: u2, guildId, event: 'milestone', details: milestone });
    }
    async recordAnniversary(userId1, userId2, guildId, years) {
        const [u1, u2] = [userId1, userId2].sort();
        await this.addEntry({
            userId1: u1, userId2: u2, guildId,
            event: 'anniversary',
            details: `${years} year${years !== 1 ? 's' : ''} anniversary!`,
        });
    }
    formatHistoryEntry(entry) {
        const time = `<t:${Math.floor(new Date(entry.timestamp).getTime() / 1000)}:R>`;
        const eventEmojis = {
            married: '💕', divorced: '💔', milestone: '🏆', goal_added: '🎯', anniversary: '🎉',
        };
        const emoji = eventEmojis[entry.event] || '📝';
        return `${emoji} **${entry.event}** ${time}${entry.details ? ` — ${entry.details}` : ''}`;
    }
}
export const coupleHistoryService = new CoupleHistoryService();
//# sourceMappingURL=CoupleHistoryService.js.map