// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import { getMongoDb as getMongoClient } from '../../database/mongodb/client.js';
export class TopcommandsCommand extends BaseCommand {
    constructor() {
        super({ name: 'topcommands', description: 'Show top 10 most used commands globally', category: 'owner', premiumTier: 'free', cooldown: 0, guildOnly: false, ownerOnly: true, slashCommand: true, prefixCommand: true, aliases: ['topcmds'], examples: ['p!topcommands'] });
    }
    async run(i, m) {
        const send = async (e) => { if (i)
            await i.reply({ embeds: [e], flags: 64 });
        else
            await m.reply({ embeds: [e] }); };
        try {
            const db = await getMongoClient();
            const results = await db.collection('command_executions').aggregate([
                { $group: { _id: '$command', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 10 }
            ]).toArray();
            const embed = new EmbedBuilder().setColor(COLORS.default).setTitle('📊 Top Commands (Global)')
                .setDescription(results.length ? results.map((r, idx) => `**${idx + 1}.** \`${r._id}\` — ${r.count.toLocaleString()} uses`).join('\n') : 'No data yet.');
            await send(embed);
        }
        catch (err) {
            await send(new EmbedBuilder().setColor(COLORS.error).setDescription(`❌ ${err.message}`));
        }
    }
    async executeSlash(i) { await this.run(i, null); }
    async executePrefix(m) { await this.run(null, m); }
}
export default TopcommandsCommand;
