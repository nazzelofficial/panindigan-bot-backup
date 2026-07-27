// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';
export class ServerPremiumCommand extends BaseCommand {
    constructor() {
        super({ name: 'serverpremium', description: 'View this server\'s premium status and perks', category: 'premium', premiumTier: 'free', cooldown: 5, guildOnly: true, slashCommand: true, prefixCommand: true, aliases: ['guildpremium', 'serverstatus'], examples: ['/serverpremium'] });
    }
    async executeSlash(i) {
        const prisma = getPrismaClient();
        const premium = await prisma.premium.findFirst({ where: { guildId: i.guildId, active: true }, orderBy: { tier: 'desc' } });
        const guild = await prisma.guild.findUnique({ where: { guildId: i.guildId } });
        if (!premium) {
            const embed = new EmbedBuilder().setTitle('🆓 Server Status: Free').setColor(COLORS.default)
                .setDescription('This server is on the **Free** plan.\n\nGuild owners can upgrade at `/premium` for server-wide perks!')
                .addFields({ name: '🎁 Free Perks', value: '• 20 AI requests/day\n• Basic music (50 queue)\n• Standard XP', inline: false });
            await i.reply({ embeds: [embed] });
            return;
        }
        const tierColors = { bronze: COLORS.bronze, silver: COLORS.silver, gold: COLORS.gold, diamond: COLORS.diamond };
        const embed = new EmbedBuilder()
            .setTitle(`✨ Server Status: ${premium.tier?.toUpperCase()}`)
            .setColor(tierColors[premium.tier || 'bronze'] || COLORS.gold)
            .addFields({ name: '🏆 Tier', value: premium.tier?.toUpperCase() || 'Unknown', inline: true }, { name: '👤 Activated by', value: `<@${premium.userId}>`, inline: true }, { name: '📅 Since', value: `<t:${Math.floor(new Date(premium.activatedAt || Date.now()).getTime() / 1000)}:D>`, inline: true }, { name: '📊 Total Members', value: `${i.guild?.memberCount || 0}`, inline: true })
            .setTimestamp();
        await i.reply({ embeds: [embed] });
    }
    async executePrefix(m) {
        const prisma = getPrismaClient();
        const premium = await prisma.premium.findFirst({ where: { guildId: m.guildId, active: true } });
        if (!premium) {
            await m.reply('🆓 This server is on the **Free** plan.');
            return;
        }
        await m.reply(`✨ Server premium: **${premium.tier?.toUpperCase()}**`);
    }
}
export default ServerPremiumCommand;
