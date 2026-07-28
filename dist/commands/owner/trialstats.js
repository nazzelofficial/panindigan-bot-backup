// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import { getMongoDb as getMongoClient } from '../../database/mongodb/client.js';
export class TrialstatsCommand extends BaseCommand {
    constructor() {
        super({ name: 'trialstats', description: 'Show trial activations and conversion stats', category: 'owner', premiumTier: 'free', cooldown: 0, guildOnly: false, ownerOnly: true, slashCommand: true, prefixCommand: true, aliases: ['trials'], examples: ['p!trialstats'] });
    }
    async run(i, m) {
        const send = async (e) => { if (i)
            await i.reply({ embeds: [e], flags: 64 });
        else
            await m.reply({ embeds: [e] }); };
        try {
            const db = await getMongoClient();
            const total = await db.collection('trial_activations').countDocuments().catch(() => 0);
            const converted = await db.collection('trial_activations').countDocuments({ converted: true }).catch(() => 0);
            const last7 = await db.collection('trial_activations').countDocuments({ createdAt: { $gte: new Date(Date.now() - 7 * 86400000) } }).catch(() => 0);
            const rate = total > 0 ? ((converted / total) * 100).toFixed(1) : '0';
            const embed = new EmbedBuilder().setColor(COLORS.default).setTitle('📊 Trial Statistics')
                .addFields({ name: '🎯 Total Trials', value: total.toString(), inline: true }, { name: '✅ Converted', value: `${converted} (${rate}%)`, inline: true }, { name: '📅 Last 7 Days', value: last7.toString(), inline: true });
            await send(embed);
        }
        catch (err) {
            await send(new EmbedBuilder().setColor(COLORS.error).setDescription(`❌ ${err.message}`));
        }
    }
    async executeSlash(i) { await this.run(i, null); }
    async executePrefix(m) { await this.run(null, m); }
}
export default TrialstatsCommand;
