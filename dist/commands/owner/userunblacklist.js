// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import { getMongoDb as getMongoClient } from '../../database/mongodb/client.js';
export class UserunblacklistCommand extends BaseCommand {
    constructor() {
        super({ name: 'userunblacklist', description: 'Remove a user from the global bot blacklist', category: 'owner', premiumTier: 'free', cooldown: 0, guildOnly: false, ownerOnly: true, slashCommand: true, prefixCommand: true, aliases: ['uublk'], examples: ['p!userunblacklist 123456789'] });
    }
    async run(i, m, userId) {
        const send = async (e) => { if (i)
            await i.reply({ embeds: [e], flags: 64 });
        else
            await m.reply({ embeds: [e] }); };
        if (!userId)
            return send(new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Provide a user ID.'));
        try {
            const db = await getMongoClient();
            const result = await db.collection('global_blacklist').deleteOne({ userId, type: 'user' });
            const embed = new EmbedBuilder().setColor(result.deletedCount ? COLORS.success : COLORS.error)
                .setTitle(result.deletedCount ? '✅ User Unblacklisted' : '❌ Not Found')
                .setDescription(result.deletedCount ? `User \`${userId}\` removed from blacklist.` : `User \`${userId}\` was not blacklisted.`);
            await send(embed);
        }
        catch (err) {
            await send(new EmbedBuilder().setColor(COLORS.error).setDescription(`❌ ${err.message}`));
        }
    }
    async executeSlash(i) { await this.run(i, null, i.options.getString('user_id', true)); }
    async executePrefix(m, _args) { await this.run(null, m, args[0]); }
}
export default UserunblacklistCommand;
