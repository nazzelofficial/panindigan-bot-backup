// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import getMongoClient from '../../database/mongodb/client.js';
export class KeydeleteCommand extends BaseCommand {
    constructor() {
        super({ name: 'keydelete', description: 'Delete a premium key from the database', category: 'owner', premiumTier: 'free', cooldown: 0, guildOnly: false, ownerOnly: true, slashCommand: true, prefixCommand: true, aliases: ['kdel'], examples: ['p!keydelete XXXX-XXXX-XXXX-XXXX'] });
    }
    async run(i, m, key) {
        const send = async (e) => { if (i)
            await i.reply({ embeds: [e], flags: 64 });
        else
            await m.reply({ embeds: [e] }); };
        if (!key)
            return send(new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Provide a key.'));
        const db = await getMongoClient();
        const result = await db.collection('premium_keys').deleteOne({ key });
        await send(new EmbedBuilder().setColor(result.deletedCount ? COLORS.success : COLORS.error)
            .setTitle(result.deletedCount ? '✅ Key Deleted' : '❌ Key Not Found')
            .setDescription(result.deletedCount ? `Key \`${key}\` has been deleted.` : `Key \`${key}\` was not found.`));
    }
    async executeSlash(i) { await this.run(i, null, i.options.getString('key', true)); }
    async executePrefix(m, _args) { await this.run(null, m, args[0]); }
}
export default KeydeleteCommand;
