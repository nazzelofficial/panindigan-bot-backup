import { EmbedBuilder } from 'discord.js';
import { COLORS } from '../../constants/DesignSystem.js';
export class CoupleMessageService {
    async sendPrivateMessage(client, fromUser, toUserId, message, isAnonymous = false) {
        try {
            const toUser = await client.users.fetch(toUserId);
            if (!toUser)
                return { success: false, error: 'Could not find user.' };
            const embed = new EmbedBuilder()
                .setTitle('💌 Private Couple Message')
                .setDescription(message)
                .setColor(COLORS.diamond)
                .setTimestamp();
            if (!isAnonymous) {
                embed.setAuthor({
                    name: fromUser.username,
                    iconURL: fromUser.displayAvatarURL({ size: 64 }),
                });
                embed.setFooter({ text: `From ${fromUser.tag} • Panindigan Couple System` });
            }
            else {
                embed.setFooter({ text: 'Anonymous couple message • Panindigan' });
            }
            await toUser.send({ embeds: [embed] });
            return { success: true };
        }
        catch (error) {
            if (error.code === 50007) {
                return { success: false, error: 'Could not DM that user. They may have DMs disabled.' };
            }
            return { success: false, error: 'Failed to send private message.' };
        }
    }
    async sendLoveLetter(client, fromUser, toUserId, letter) {
        try {
            const toUser = await client.users.fetch(toUserId);
            if (!toUser)
                return { success: false, error: 'Could not find user.' };
            const embed = new EmbedBuilder()
                .setTitle('💝 Love Letter')
                .setDescription(`*"${letter}"*`)
                .setColor(0xff69b4)
                .setAuthor({
                name: fromUser.username,
                iconURL: fromUser.displayAvatarURL({ size: 64 }),
            })
                .setFooter({ text: 'Sent with love • Panindigan Couple System' })
                .setTimestamp();
            await toUser.send({ embeds: [embed] });
            return { success: true };
        }
        catch {
            return { success: false, error: 'Failed to send love letter. User may have DMs disabled.' };
        }
    }
    async sendAnniversaryNotification(client, userId1, userId2, channelId, years) {
        try {
            const [user1, user2] = await Promise.all([
                client.users.fetch(userId1),
                client.users.fetch(userId2),
            ]);
            const channel = await client.channels.fetch(channelId);
            if (!channel?.isTextBased())
                return;
            const embed = new EmbedBuilder()
                .setTitle('🎉 Anniversary!')
                .setDescription(`Happy **${years} Year${years !== 1 ? 's' : ''}** Anniversary, ${user1} & ${user2}! 🎊\n\n` +
                `Maraming salamat sa inyong pagmamahal sa isa't isa. Nawa ay marami pa kayong masamahan sa buhay! 💕`)
                .setColor(0xff69b4)
                .setTimestamp();
            await channel.send({ embeds: [embed] });
        }
        catch { /* Optional */ }
    }
}
export const coupleMessageService = new CoupleMessageService();
//# sourceMappingURL=CoupleMessageService.js.map