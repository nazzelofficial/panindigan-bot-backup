// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import { getMongoDb as getMongoClient } from '../../database/mongodb/client.js';
export class KeyrevokeCommand extends BaseCommand {
    constructor() {
        super({ name: 'keyrevoke', description: 'Revoke an activated premium key', category: 'owner', premiumTier: 'free', cooldown: 0, guildOnly: false, ownerOnly: true, slashCommand: true, prefixCommand: true, aliases: ['krevoke'], examples: ['p!keyrevoke XXXX-XXXX-XXXX-XXXX'] });
    }
    async run(i, m, key) {
        const send = async (e) => { if (i)
            await i.reply({ embeds: [e], flags: 64 });
        else
            await m.reply({ embeds: [e] }); };
        if (!key)
            return send(new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Provide a key.'));
        const db = await getMongoClient();
        const result = await db.collection('premium_keys').updateOne({ key }, { $set: { activated: false, revokedAt: new Date(), activatedBy: null } });
        await send(new EmbedBuilder().setColor(result.modifiedCount ? COLORS.success : COLORS.error)
            .setTitle(result.modifiedCount ? '✅ Key Revoked' : '❌ Key Not Found')
            .setDescription(result.modifiedCount ? `Key \`${key}\` has been revoked and is now available again.` : `Key \`${key}\` not found.`));
    }
    async executeSlash(i) { await this.run(i, null, i.options.getString('key', true)); }
    async executePrefix(m, _args) { await this.run(null, m, args[0]); }
}
export default KeyrevokeCommand;
