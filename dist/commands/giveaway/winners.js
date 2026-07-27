// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';
export class GiveawayWinnersCommand extends BaseCommand {
    constructor() {
        super({ name: 'gwinners', description: 'List all winners of past giveaways', category: 'giveaway', premiumTier: 'free', cooldown: 5, guildOnly: true, slashCommand: true, prefixCommand: true, aliases: ['giveaway-winners', 'gw-winners'], examples: ['/gwinners', 'p!gwinners'] });
    }
    async executeSlash(i) {
        await i.deferReply();
        const prisma = getPrismaClient();
        const giveaways = await prisma.giveaway.findMany({ where: { guildId: i.guildId, active: false, winnerId: { not: null } }, orderBy: { endsAt: 'desc' }, take: 15 });
        if (!giveaways.length) {
            await i.editReply({ content: '📭 No giveaway winners found.' });
            return;
        }
        const embed = new EmbedBuilder().setTitle('🏆 Giveaway Winners').setColor(COLORS.gold)
            .setDescription(giveaways.map((g, idx) => `**${idx + 1}.** ${g.prize}\nWinner(s): ${(g.winnerId || '').split(',').map(id => `<@${id}>`).join(', ')}\n<t:${Math.floor(new Date(g.endsAt).getTime() / 1000)}:D>`).join('\n\n'))
            .setTimestamp();
        await i.editReply({ embeds: [embed] });
    }
    async executePrefix(m) {
        const prisma = getPrismaClient();
        const giveaways = await prisma.giveaway.findMany({ where: { guildId: m.guildId, active: false, winnerId: { not: null } }, orderBy: { endsAt: 'desc' }, take: 10 });
        if (!giveaways.length) {
            await m.reply('📭 No winners found.');
            return;
        }
        const embed = new EmbedBuilder().setTitle('🏆 Giveaway Winners').setColor(COLORS.gold)
            .setDescription(giveaways.map((g, i) => `**${i + 1}.** ${g.prize} — ${(g.winnerId || '').split(',').map(id => `<@${id}>`).join(', ')}`).join('\n'));
        await m.reply({ embeds: [embed] });
    }
}
export default GiveawayWinnersCommand;
