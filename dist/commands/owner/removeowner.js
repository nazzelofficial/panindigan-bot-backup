// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import getMongoClient from '../../database/mongodb/client.js';
export class RemoveownerCommand extends BaseCommand {
    constructor() {
        super({ name: 'removeowner', description: 'Remove a co-owner from the bot', category: 'owner', premiumTier: 'free', cooldown: 0, guildOnly: false, ownerOnly: true, slashCommand: true, prefixCommand: true, aliases: ['remco'], examples: ['p!removeowner 123456789'] });
    }
    async run(i, m, userId) {
        const send = async (e) => { if (i)
            await i.reply({ embeds: [e], flags: 64 });
        else
            await m.reply({ embeds: [e] }); };
        if (!userId)
            return send(new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Provide a user ID.'));
        const db = await getMongoClient();
        const result = await db.collection('bot_owners').deleteOne({ userId });
        await send(new EmbedBuilder().setColor(result.deletedCount ? COLORS.success : COLORS.error)
            .setTitle(result.deletedCount ? '✅ Co-Owner Removed' : '❌ Not Found')
            .setDescription(result.deletedCount ? `User \`${userId}\` removed from co-owners.` : `User \`${userId}\` was not a co-owner.`));
    }
    async executeSlash(i) { await this.run(i, null, i.options.getString('user_id', true)); }
    async executePrefix(m, _args) { await this.run(null, m, args[0]); }
}
export default RemoveownerCommand;
