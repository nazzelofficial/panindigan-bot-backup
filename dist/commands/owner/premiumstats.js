// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import getPrismaClient from '../../database/postgresql/client.js';
export class PremiumstatsCommand extends BaseCommand {
    constructor() {
        super({ name: 'premiumstats', description: 'Show premium user counts per tier', category: 'owner', premiumTier: 'free', cooldown: 0, guildOnly: false, ownerOnly: true, slashCommand: true, prefixCommand: true, aliases: ['pstats'], examples: ['p!premiumstats'] });
    }
    async run(i, m) {
        const send = async (e) => { if (i)
            await i.reply({ embeds: [e], flags: 64 });
        else
            await m.reply({ embeds: [e] }); };
        try {
            const prisma = getPrismaClient();
            const tiers = ['bronze', 'silver', 'gold', 'diamond'];
            const counts = await Promise.all(tiers.map(async (t) => {
                const count = await prisma.user?.count({ where: { premiumTier: t } }).catch(() => 0) ?? 0;
                return { tier: t, count };
            }));
            const embed = new EmbedBuilder().setColor(COLORS.default).setTitle('💎 Premium Statistics')
                .addFields(counts.map(({ tier, count }) => ({
                name: `${tier === 'bronze' ? '🥉' : tier === 'silver' ? '🥈' : tier === 'gold' ? '🥇' : '💎'} ${tier.charAt(0).toUpperCase() + tier.slice(1)}`,
                value: count.toString(),
                inline: true
            })));
            await send(embed);
        }
        catch (err) {
            await send(new EmbedBuilder().setColor(COLORS.error).setDescription(`❌ ${err.message}`));
        }
    }
    async executeSlash(i) { await this.run(i, null); }
    async executePrefix(m) { await this.run(null, m); }
}
export default PremiumstatsCommand;
