// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';
export class PremiumgrantCommand extends BaseCommand {
    constructor() {
        super({ name: 'premiumgrant', description: 'Grant premium tier to a user', category: 'owner', premiumTier: 'free', cooldown: 0, guildOnly: false, ownerOnly: true, slashCommand: true, prefixCommand: true, aliases: ['pgrant'], examples: ['p!premiumgrant 123456789 gold'] });
    }
    async run(i, m, userId, tier) {
        const send = async (e) => { if (i)
            await i.reply({ embeds: [e], flags: 64 });
        else
            await m.reply({ embeds: [e] }); };
        if (!userId || !tier)
            return send(new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Usage: `premiumgrant <user_id> <bronze|silver|gold|diamond>`'));
        const validTiers = ['bronze', 'silver', 'gold', 'diamond'];
        if (!validTiers.includes(tier.toLowerCase()))
            return send(new EmbedBuilder().setColor(COLORS.error).setDescription(`❌ Invalid tier. Valid: ${validTiers.join(', ')}`));
        try {
            const prisma = getPrismaClient();
            const until = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
            await prisma.user?.upsert({ where: { id: userId }, update: { premiumTier: tier.toLowerCase(), premiumUntil: until }, create: { id: userId, premiumTier: tier.toLowerCase(), premiumUntil: until } }).catch(() => null);
            await send(new EmbedBuilder().setColor(COLORS.success).setTitle('💎 Premium Granted')
                .addFields({ name: 'User ID', value: userId, inline: true }, { name: 'Tier', value: tier.toLowerCase(), inline: true }, { name: 'Expires', value: until.toDateString(), inline: true }));
        }
        catch (err) {
            await send(new EmbedBuilder().setColor(COLORS.error).setDescription(`❌ ${err.message}`));
        }
    }
    async executeSlash(i) { await this.run(i, null, i.options.getString('user_id', true), i.options.getString('tier', true)); }
    async executePrefix(m, _args) { await this.run(null, m, args[0], args[1]); }
}
export default PremiumgrantCommand;
