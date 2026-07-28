// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import { getMongoDb as getMongoClient } from '../../database/mongodb/client.js';
export class OwnersCommand extends BaseCommand {
    constructor() {
        super({ name: 'owners', description: 'List all bot owners and co-owners', category: 'owner', premiumTier: 'free', cooldown: 0, guildOnly: false, ownerOnly: true, slashCommand: true, prefixCommand: true, aliases: ['coowners'], examples: ['p!owners'] });
    }
    async run(i, m) {
        const client = i?.client ?? m.client;
        const send = async (e) => { if (i)
            await i.reply({ embeds: [e], flags: 64 });
        else
            await m.reply({ embeds: [e] }); };
        const mainOwners = (process.env.OWNER_IDS ?? '').split(',').map(s => s.trim()).filter(Boolean);
        const db = await getMongoClient();
        const coOwners = await db.collection('bot_owners').find({}).toArray();
        const fetchTag = async (id) => { try {
            const u = await client.users.fetch(id);
            return u.tag;
        }
        catch {
            return id;
        } };
        const mainTags = await Promise.all(mainOwners.map(fetchTag));
        const coTags = await Promise.all(coOwners.map(co => fetchTag(co.userId)));
        const embed = new EmbedBuilder().setColor(COLORS.default).setTitle('👑 Bot Owners')
            .addFields({ name: '⭐ Main Owners', value: mainTags.map(t => `• ${t}`).join('\n') || 'None configured', inline: false }, { name: '🌟 Co-Owners', value: coTags.map(t => `• ${t}`).join('\n') || 'None', inline: false });
        await send(embed);
    }
    async executeSlash(i) { await this.run(i, null); }
    async executePrefix(m) { await this.run(null, m); }
}
export default OwnersCommand;
