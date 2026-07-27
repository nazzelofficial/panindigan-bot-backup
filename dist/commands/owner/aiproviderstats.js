// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import getMongoClient from '../../database/mongodb/client.js';
export class AiproviderstatsCommand extends BaseCommand {
    constructor() {
        super({ name: 'aiproviderstats', description: 'Show per-provider AI request statistics', category: 'owner', premiumTier: 'free', cooldown: 0, guildOnly: false, ownerOnly: true, slashCommand: true, prefixCommand: true, aliases: ['aistats'], examples: ['p!aiproviderstats'] });
    }
    async run(i, m) {
        const send = async (e) => { if (i)
            await i.reply({ embeds: [e], flags: 64 });
        else
            await m.reply({ embeds: [e] }); };
        try {
            const db = await getMongoClient();
            const pipeline = [
                { $group: { _id: '$provider', requests: { $sum: 1 }, tokens: { $sum: '$tokensUsed' }, avgLatency: { $avg: '$latencyMs' } } },
                { $sort: { requests: -1 } }
            ];
            const stats = await db.collection('ai_requests').aggregate(pipeline).toArray();
            const embed = new EmbedBuilder().setColor(COLORS.default).setTitle('📊 AI Provider Stats')
                .setDescription(stats.length ? stats.map(s => `**${s._id ?? 'unknown'}**: ${s.requests.toLocaleString()} reqs | ${(s.tokens ?? 0).toLocaleString()} tokens | ${Math.round(s.avgLatency ?? 0)}ms avg`).join('\n') : 'No data yet.');
            await send(embed);
        }
        catch (err) {
            await send(new EmbedBuilder().setColor(COLORS.error).setDescription(`❌ ${err.message}`));
        }
    }
    async executeSlash(i) { await this.run(i, null); }
    async executePrefix(m) { await this.run(null, m); }
}
export default AiproviderstatsCommand;
