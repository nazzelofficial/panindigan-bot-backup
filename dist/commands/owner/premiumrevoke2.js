// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import getPrismaClient from '../../database/postgresql/client.js';
export class Premiumrevoke2Command extends BaseCommand {
    constructor() {
        super({ name: 'premiumrevoke2', description: 'Revoke premium from a user by ID', category: 'owner', premiumTier: 'free', cooldown: 0, guildOnly: false, ownerOnly: true, slashCommand: true, prefixCommand: true, aliases: ['prevoke'], examples: ['p!premiumrevoke2 123456789'] });
    }
    async run(i, m, userId) {
        const send = async (e) => { if (i)
            await i.reply({ embeds: [e], flags: 64 });
        else
            await m.reply({ embeds: [e] }); };
        if (!userId)
            return send(new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Provide a user ID.'));
        try {
            const prisma = getPrismaClient();
            await prisma.user?.update({ where: { id: userId }, data: { premiumTier: 'free', premiumUntil: null } }).catch(() => null);
            await send(new EmbedBuilder().setColor(COLORS.success).setTitle('💎 Premium Revoked').setDescription(`Premium has been removed from user \`${userId}\`.`));
        }
        catch (err) {
            await send(new EmbedBuilder().setColor(COLORS.error).setDescription(`❌ ${err.message}`));
        }
    }
    async executeSlash(i) { await this.run(i, null, i.options.getString('user_id', true)); }
    async executePrefix(m, _args) { await this.run(null, m, args[0]); }
}
export default Premiumrevoke2Command;
