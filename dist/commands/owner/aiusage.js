// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import getMongoClient from '../../database/mongodb/client.js';
export class AiusageCommand extends BaseCommand {
    constructor() {
        super({ name: 'aiusage', description: 'Show AI usage statistics per provider', category: 'owner', premiumTier: 'free', cooldown: 0, guildOnly: false, ownerOnly: true, slashCommand: true, prefixCommand: true, aliases: ['aiuse'], examples: ['p!aiusage'] });
    }
    async run(i, m) {
        const send = async (e) => { if (i)
            await i.reply({ embeds: [e], flags: 64 });
        else
            await m.reply({ embeds: [e] }); };
        try {
            const db = await getMongoClient();
            const results = await db.collection('ai_requests').aggregate([
                { $group: { _id: '$provider', requests: { $sum: 1 }, tokens: { $sum: '$tokensUsed' } } },
                { $sort: { requests: -1 } }
            ]).toArray();
            const embed = new EmbedBuilder().setColor(COLORS.default).setTitle('🤖 AI Usage Statistics')
                .setDescription(results.length ? results.map(r => `**${r._id ?? 'unknown'}**: ${r.requests.toLocaleString()} requests, ${(r.tokens ?? 0).toLocaleString()} tokens`).join('\n') : 'No AI request data yet.');
            await send(embed);
        }
        catch (err) {
            await send(new EmbedBuilder().setColor(COLORS.error).setDescription(`❌ ${err.message}`));
        }
    }
    async executeSlash(i) { await this.run(i, null); }
    async executePrefix(m) { await this.run(null, m); }
}
export default AiusageCommand;
