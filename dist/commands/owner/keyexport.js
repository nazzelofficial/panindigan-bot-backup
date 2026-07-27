// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import getMongoClient from '../../database/mongodb/client.js';
export class KeyexportCommand extends BaseCommand {
    constructor() {
        super({ name: 'keyexport', description: 'Export all premium keys as CSV', category: 'owner', premiumTier: 'free', cooldown: 0, guildOnly: false, ownerOnly: true, slashCommand: true, prefixCommand: true, aliases: ['kexp'], examples: ['p!keyexport'] });
    }
    async run(i, m) {
        const send = async (e) => { if (i)
            await i.reply({ embeds: [e], flags: 64 });
        else
            await m.reply({ embeds: [e] }); };
        const db = await getMongoClient();
        const keys = await db.collection('premium_keys').find({}).toArray();
        if (!keys.length)
            return send(new EmbedBuilder().setColor(COLORS.default).setDescription('No keys found.'));
        const csv = ['key,tier,activated,activatedBy,activatedAt,createdAt',
            ...keys.map(k => `${k.key},${k.tier},${k.activated ?? false},${k.activatedBy ?? ''},${k.activatedAt ?? ''},${k.createdAt ?? ''}`)
        ].join('\n');
        const embed = new EmbedBuilder().setColor(COLORS.default).setTitle('📋 Premium Keys Export')
            .setDescription(`\`\`\`csv\n${csv.slice(0, 1800)}\n\`\`\``)
            .setFooter({ text: `${keys.length} keys total` });
        await send(embed);
    }
    async executeSlash(i) { await this.run(i, null); }
    async executePrefix(m) { await this.run(null, m); }
}
export default KeyexportCommand;
