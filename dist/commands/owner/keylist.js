// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import { getMongoDb as getMongoClient } from '../../database/mongodb/client.js';
export class KeylistCommand extends BaseCommand {
    constructor() {
        super({ name: 'keylist', description: 'List all premium keys with status', category: 'owner', premiumTier: 'free', cooldown: 0, guildOnly: false, ownerOnly: true, slashCommand: true, prefixCommand: true, aliases: ['klist'], examples: ['p!keylist'] });
    }
    async run(i, m) {
        const send = async (e) => { if (i)
            await i.reply({ embeds: [e], flags: 64 });
        else
            await m.reply({ embeds: [e] }); };
        try {
            const db = await getMongoClient();
            const keys = await db.collection('premium_keys').find({}).sort({ createdAt: -1 }).limit(20).toArray();
            if (!keys.length)
                return send(new EmbedBuilder().setColor(COLORS.default).setDescription('No premium keys found.'));
            const embed = new EmbedBuilder().setColor(COLORS.default).setTitle('🔑 Premium Keys')
                .setDescription(keys.map(k => `\`${k.key}\` — **${k.tier}** — ${k.activated ? `✅ Used by ${k.activatedBy}` : '⭕ Available'}`).join('\n'))
                .setFooter({ text: `Showing ${keys.length} keys` });
            await send(embed);
        }
        catch (err) {
            await send(new EmbedBuilder().setColor(COLORS.error).setDescription(`❌ ${err.message}`));
        }
    }
    async executeSlash(i) { await this.run(i, null); }
    async executePrefix(m) { await this.run(null, m); }
}
export default KeylistCommand;
