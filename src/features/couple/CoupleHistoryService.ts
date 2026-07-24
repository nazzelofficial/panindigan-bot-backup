import { getCollection } from '../../database/mongodb/client';

export interface CoupleHistoryEntry {
  userId1: string;
  userId2: string;
  guildId: string;
  event: string; // 'married', 'divorced', 'milestone', 'goal_added', 'anniversary', etc.
  details?: string;
  timestamp: Date;
}

export class CoupleHistoryService {
  private get col() { return getCollection('couple_history'); }

  async addEntry(entry: Omit<CoupleHistoryEntry, 'timestamp'>): Promise<void> {
    try {
      await this.col.insertOne({ ...entry, timestamp: new Date() });
    } catch (error) {
      console.error('Error adding couple history entry:', error);
    }
  }

  async getHistory(userId1: string, userId2: string, guildId: string, limit: number = 20): Promise<CoupleHistoryEntry[]> {
    try {
      const [u1, u2] = [userId1, userId2].sort();
      return await this.col
        .find({ userId1: u1, userId2: u2, guildId })
        .sort({ timestamp: -1 })
        .limit(limit)
        .toArray() as unknown as CoupleHistoryEntry[];
    } catch {
      return [];
    }
  }

  async getUserHistory(userId: string, guildId: string, limit: number = 20): Promise<CoupleHistoryEntry[]> {
    try {
      return await this.col
        .find({ guildId, $or: [{ userId1: userId }, { userId2: userId }] })
        .sort({ timestamp: -1 })
        .limit(limit)
        .toArray() as unknown as CoupleHistoryEntry[];
    } catch {
      return [];
    }
  }

  async recordMarriage(userId1: string, userId2: string, guildId: string): Promise<void> {
    const [u1, u2] = [userId1, userId2].sort();
    await this.addEntry({ userId1: u1, userId2: u2, guildId, event: 'married', details: 'Became a couple' });
  }

  async recordDivorce(userId1: string, userId2: string, guildId: string): Promise<void> {
    const [u1, u2] = [userId1, userId2].sort();
    await this.addEntry({ userId1: u1, userId2: u2, guildId, event: 'divorced', details: 'Couple ended' });
  }

  async recordMilestone(userId1: string, userId2: string, guildId: string, milestone: string): Promise<void> {
    const [u1, u2] = [userId1, userId2].sort();
    await this.addEntry({ userId1: u1, userId2: u2, guildId, event: 'milestone', details: milestone });
  }

  async recordAnniversary(userId1: string, userId2: string, guildId: string, years: number): Promise<void> {
    const [u1, u2] = [userId1, userId2].sort();
    await this.addEntry({
      userId1: u1, userId2: u2, guildId,
      event: 'anniversary',
      details: `${years} year${years !== 1 ? 's' : ''} anniversary!`,
    });
  }

  formatHistoryEntry(entry: CoupleHistoryEntry): string {
    const time = `<t:${Math.floor(new Date(entry.timestamp).getTime() / 1000)}:R>`;
    const eventEmojis: Record<string, string> = {
      married: '💕', divorced: '💔', milestone: '🏆', goal_added: '🎯', anniversary: '🎉',
    };
    const emoji = eventEmojis[entry.event] || '📝';
    return `${emoji} **${entry.event}** ${time}${entry.details ? ` — ${entry.details}` : ''}`;
  }
}

export const coupleHistoryService = new CoupleHistoryService();
