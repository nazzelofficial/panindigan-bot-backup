// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import getMongoClient from '../../database/mongodb/client.js';
import crypto from 'crypto';
function generateKey() {
    return Array.from({ length: 4 }, () => crypto.randomBytes(2).toString('hex').toUpperCase()).join('-');
}
export class KeybulkCommand extends BaseCommand {
    constructor() {
        super({ name: 'keybulk', description: 'Bulk generate premium keys', category: 'owner', premiumTier: 'free', cooldown: 0, guildOnly: false, ownerOnly: true, slashCommand: true, prefixCommand: true, aliases: ['kbulk'], examples: ['p!keybulk gold 5'] });
    }
    async run(i, m, tier, count) {
        const send = async (e) => { if (i)
            await i.reply({ embeds: [e], flags: 64 });
        else
            await m.reply({ embeds: [e] }); };
        if (!tier || !count)
            return send(new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Usage: `keybulk <tier> <count>`'));
        const safeCount = Math.min(Math.max(count, 1), 25);
        const keys = Array.from({ length: safeCount }, () => ({ key: generateKey(), tier, activated: false, createdAt: new Date() }));
        const db = await getMongoClient();
        await db.collection('premium_keys').insertMany(keys);
        const embed = new EmbedBuilder().setColor(COLORS.success).setTitle(`🔑 Generated ${safeCount} ${tier} Keys`)
            .setDescription('```\n' + keys.map(k => k.key).join('\n') + '\n```');
        await send(embed);
    }
    async executeSlash(i) { await this.run(i, null, i.options.getString('tier', true), i.options.getInteger('count', true)); }
    async executePrefix(m, _args) { await this.run(null, m, args[0], parseInt(args[1]) || 1); }
}
export default KeybulkCommand;
