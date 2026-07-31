import { EmbedBuilder } from 'discord.js';
import { COLORS } from '../constants/DesignSystem.js';
export const event = {
    name: 'roleUpdate',
    once: false,
    async execute(oldRole, newRole, client) {
        try {
            const { getPrismaClient } = await import('../database/postgresql/client.js');
            const prisma = getPrismaClient();
            const guildData = await prisma.guild.findUnique({
                where: { guildId: newRole.guild.id },
                select: { logChannelId: true },
            });
            if (!guildData?.logChannelId)
                return;
            const logChannel = newRole.guild.channels.cache.get(guildData.logChannelId);
            if (!logChannel?.isTextBased())
                return;
            const changes = [];
            if (oldRole.name !== newRole.name)
                changes.push(`Name: \`${oldRole.name}\` → \`${newRole.name}\``);
            if (oldRole.color !== newRole.color)
                changes.push(`Color: \`${oldRole.hexColor}\` → \`${newRole.hexColor}\``);
            if (oldRole.hoist !== newRole.hoist)
                changes.push(`Hoisted: ${oldRole.hoist} → ${newRole.hoist}`);
            if (oldRole.mentionable !== newRole.mentionable)
                changes.push(`Mentionable: ${oldRole.mentionable} → ${newRole.mentionable}`);
            if (!changes.length)
                return;
            const embed = new EmbedBuilder()
                .setTitle('🔄 Role Updated')
                .setColor(newRole.color || COLORS.warning)
                .addFields({ name: 'Role', value: `${newRole.name} (${newRole.id})`, inline: true }, { name: 'Changes', value: changes.join('\n'), inline: false })
                .setTimestamp();
            await logChannel.send({ embeds: [embed] });
        }
        catch { /* Optional */ }
    },
};
//# sourceMappingURL=roleUpdate.js.map