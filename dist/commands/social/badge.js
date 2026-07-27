// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';
const BADGES = {
    'early_supporter': { emoji: '🌟', name: 'Early Supporter', desc: 'Joined Panindigan early', price: null },
    'diamond_vip': { emoji: '👑', name: 'Diamond VIP', desc: 'Diamond premium subscriber', price: null },
    'couple_goals': { emoji: '💑', name: 'Couple Goals', desc: 'In a couple for 30+ days', price: null },
    'social_star': { emoji: '⭐', name: 'Social Star', desc: '100+ reputation points', price: null },
    'bug_hunter': { emoji: '🐛', name: 'Bug Hunter', desc: 'Reported a verified bug', price: null },
    'heart_badge': { emoji: '❤️', name: 'Heart', desc: 'Cosmetic heart badge', price: 500 },
    'fire_badge': { emoji: '🔥', name: 'Fire', desc: 'Cosmetic fire badge', price: 500 },
    'crown_badge': { emoji: '👑', name: 'Crown', desc: 'Cosmetic crown badge', price: 1000 },
    'verified': { emoji: '✅', name: 'Verified', desc: 'Verified notable user', price: null },
};
export class BadgeCommand extends BaseCommand {
    constructor() {
        super({ name: 'badge', description: 'View all your earned and available badges (Diamond) 🏅', category: 'social', premiumTier: 'diamond', cooldown: 5, guildOnly: false, slashCommand: true, prefixCommand: true, aliases: ['badges', 'mybadges'], examples: ['/badge', '/badge @user', 'p!badge'] });
    }
    buildSlashCommand() {
        return (new SlashCommandBuilder().setName(this.name).setDescription(this.description)
            .addUserOption(o => o.setName('user').setDescription('View another user\'s badges').setRequired(false)));
    }
    async handle(userId, send, client) {
        const prisma = getPrismaClient();
        const userData = await prisma.user.findUnique({ where: { userId } }).catch(() => null);
        const earned = userData?.badges || [];
        let user;
        try {
            user = await client.users.fetch(userId);
        }
        catch { /* ignored */ }
        const embed = new EmbedBuilder()
            .setTitle(`🏅 Badges — ${user?.username || userId}`)
            .setColor(COLORS.diamond)
            .setTimestamp();
        if (user)
            embed.setThumbnail(user.displayAvatarURL({ extension: 'png', size: 128 }));
        const earnedBadges = Object.entries(BADGES).filter(([key]) => earned.includes(key));
        const shopBadges = Object.entries(BADGES).filter(([, b]) => b.price !== null && !earned.includes(BADGES[Object.keys(BADGES).find(k => BADGES[k] === b)]?.name));
        embed.setDescription((earnedBadges.length > 0
            ? `**Earned Badges:**\n${earnedBadges.map(([, b]) => `${b.emoji} **${b.name}** — ${b.desc}`).join('\n')}\n\n`
            : 'No badges earned yet.\n\n') +
            (shopBadges.length > 0
                ? `**Available in Shop:**\n${shopBadges.map(([, b]) => `${b.emoji} **${b.name}** — ${b.price} coins`).join('\n')}`
                : ''));
        embed.setFooter({ text: `${earned.length} badge${earned.length !== 1 ? 's' : ''} earned • Use /badgeshop to buy cosmetic badges` });
        await send({ embeds: [embed] });
    }
    async executeSlash(i) {
        const target = i.options.getUser('user') || i.user;
        await this.handle(target.id, (c) => i.reply(c), i.client);
    }
    async executePrefix(m, _args) {
        const target = m.mentions.users.first() || m.author;
        await this.handle(target.id, (c) => m.reply(c), m.client);
    }
}
export default BadgeCommand;
