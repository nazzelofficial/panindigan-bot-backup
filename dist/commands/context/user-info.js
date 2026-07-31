// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, ApplicationCommandType, } from 'discord.js';
import { getPrismaClient } from '../../database/postgresql/client.js';
import { COLORS } from '../../constants/DesignSystem.js';
export class UserInfoContextCommand extends BaseCommand {
    constructor() {
        super({
            name: 'User Info',
            description: 'Get information about a user',
            category: 'context',
            premiumTier: 'free',
            cooldown: 3,
            guildOnly: false,
            slashCommand: false,
            contextMenuCommand: true,
            contextMenuType: ApplicationCommandType.User,
        });
    }
    async executeContext(i) {
        await i.deferReply({ ephemeral: true });
        const target = i.targetUser;
        const prisma = getPrismaClient();
        try {
            const dbUser = await prisma.user.findUnique({ where: { userId: target.id } });
            const guilds = i.client.guilds.cache.filter(g => g.members.cache.has(target.id)).size;
            const embed = new EmbedBuilder()
                .setTitle(`👤 ${target.tag}`)
                .setColor(COLORS.info)
                .setThumbnail(target.displayAvatarURL())
                .addFields({ name: '🆔 ID', value: target.id, inline: true }, { name: '📅 Created', value: `<t:${Math.floor(target.createdAt.getTime() / 1000)}:R>`, inline: true }, { name: '🏠 Guilds', value: `${guilds}`, inline: true }, { name: '💎 Premium', value: dbUser?.premiumTier || 'free', inline: true }, { name: '🚫 Blacklisted', value: dbUser?.blacklisted ? 'Yes' : 'No', inline: true }, { name: '🤖 Bot', value: target.bot ? 'Yes' : 'No', inline: true })
                .setTimestamp();
            await i.editReply({ embeds: [embed] });
        }
        catch (error) {
            await i.editReply({ content: '❌ Error fetching user info' });
        }
    }
}
export default UserInfoContextCommand;
//# sourceMappingURL=user-info.js.map