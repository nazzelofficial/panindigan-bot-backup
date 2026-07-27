// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';
const ACHIEVEMENT_DEFS = {
    'first_couple': { emoji: '💑', desc: 'Got into your first couple', condition: 'Be in a couple' },
    'long_lasting': { emoji: '💍', desc: 'Together for 30+ days', condition: 'Stay in a couple for 30 days' },
    'social_butterfly': { emoji: '🦋', desc: 'Used 10+ social commands', condition: 'Use 10 social commands' },
    'rep_collector': { emoji: '⭐', desc: 'Received 10+ reputation points', condition: 'Earn 10 reputation points' },
    'generous': { emoji: '🎁', desc: 'Gave 10+ reputation points', condition: 'Give 10 reputation points' },
    'hugger': { emoji: '🤗', desc: 'Hugged 20+ people', condition: 'Hug 20 people' },
    'anniversary': { emoji: '🎂', desc: 'Celebrated a 100-day anniversary', condition: 'Reach 100 days with your partner' },
};
export class AchievementCommand extends BaseCommand {
    constructor() {
        super({ name: 'achievement', description: 'View your unlocked social achievements 🏆', category: 'social', premiumTier: 'gold', cooldown: 5, guildOnly: true, slashCommand: true, prefixCommand: true, aliases: ['achievements', 'badges-social'], examples: ['/achievement', 'p!achievement'] });
    }
    buildSlashCommand() {
        return (new SlashCommandBuilder().setName(this.name).setDescription(this.description)
            .addUserOption(o => o.setName('user').setDescription('View another user\'s achievements').setRequired(false))
            .setDMPermission(false));
    }
    async handle(userId, guildId, send, client) {
        const prisma = getPrismaClient();
        const user = await prisma.user.findUnique({ where: { userId } }).catch(() => null);
        const unlocked = user?.achievements || [];
        let targetUser;
        try {
            targetUser = await client.users.fetch(userId);
        }
        catch { /* ignored */ }
        const embed = new EmbedBuilder()
            .setTitle(`🏆 Achievements — ${targetUser?.username || userId}`)
            .setColor(COLORS.gold)
            .setTimestamp();
        if (targetUser)
            embed.setThumbnail(targetUser.displayAvatarURL({ extension: 'png', size: 128 }));
        const lines = Object.entries(ACHIEVEMENT_DEFS).map(([key, def]) => {
            const earned = unlocked.includes(key);
            return `${earned ? def.emoji : '🔒'} **${def.desc}**${earned ? '' : `\n> ${def.condition}`}`;
        });
        embed.setDescription(lines.join('\n\n'));
        embed.setFooter({ text: `${unlocked.length}/${Object.keys(ACHIEVEMENT_DEFS).length} achievements unlocked` });
        await send({ embeds: [embed] });
    }
    async executeSlash(i) {
        const target = i.options.getUser('user') || i.user;
        await this.handle(target.id, i.guildId, (c) => i.reply(c), i.client);
    }
    async executePrefix(m, _args) {
        const target = m.mentions.users.first() || m.author;
        await this.handle(target.id, m.guildId, (c) => m.reply(c), m.client);
    }
}
export default AchievementCommand;
