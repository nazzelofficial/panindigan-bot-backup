// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import getPrismaClient from '../../database/postgresql/client.js';
import getMongoClient from '../../database/mongodb/client.js';
export class UserresetCommand extends BaseCommand {
    constructor() {
        super({ name: 'userreset', description: 'Reset user data (all/economy/level/moderation)', category: 'owner', premiumTier: 'free', cooldown: 0, guildOnly: false, ownerOnly: true, slashCommand: true, prefixCommand: true, aliases: ['ureset'], examples: ['p!userreset 123456789 economy', 'p!userreset 123456789 all'] });
    }
    async run(i, m, userId, type) {
        const send = async (e) => { if (i)
            await i.reply({ embeds: [e], flags: 64 });
        else
            await m.reply({ embeds: [e] }); };
        if (!userId)
            return send(new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Usage: `userreset <user_id> [all|economy|level|moderation]`'));
        const resetType = type || 'all';
        try {
            const prisma = getPrismaClient();
            const db = await getMongoClient();
            const actions = [];
            if (resetType === 'economy' || resetType === 'all') {
                await prisma.economy?.deleteMany({ where: { userId } }).catch(() => null);
                actions.push('Economy');
            }
            if (resetType === 'level' || resetType === 'all') {
                await prisma.userLevel?.deleteMany({ where: { userId } }).catch(() => null);
                actions.push('Level/XP');
            }
            if (resetType === 'moderation' || resetType === 'all') {
                await prisma.moderationCase?.deleteMany({ where: { userId } }).catch(() => null);
                actions.push('Moderation Cases');
            }
            if (resetType === 'all') {
                await db.collection('user_notes').deleteMany({ userId });
                await db.collection('virtual_pets').deleteMany({ userId });
                actions.push('MongoDB Data');
            }
            await send(new EmbedBuilder().setColor(COLORS.success).setTitle('✅ User Data Reset')
                .addFields({ name: 'User ID', value: userId, inline: true }, { name: 'Reset', value: actions.join(', ') || 'None', inline: true }));
        }
        catch (err) {
            await send(new EmbedBuilder().setColor(COLORS.error).setDescription(`❌ ${err.message}`));
        }
    }
    async executeSlash(i) { await this.run(i, null, i.options.getString('user_id', true), i.options.getString('type') ?? 'all'); }
    async executePrefix(m, _args) { await this.run(null, m, args[0], args[1] ?? 'all'); }
}
export default UserresetCommand;
