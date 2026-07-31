// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, ApplicationCommandType, } from 'discord.js';
import { COLORS } from '../../constants/DesignSystem.js';
export class MessageInfoContextCommand extends BaseCommand {
    constructor() {
        super({
            name: 'Message Info',
            description: 'Get information about a message',
            category: 'context',
            premiumTier: 'free',
            cooldown: 3,
            guildOnly: false,
            slashCommand: false,
            contextMenuCommand: true,
            contextMenuType: ApplicationCommandType.Message,
        });
    }
    async executeContext(i) {
        await i.deferReply({ ephemeral: true });
        const message = i.targetMessage;
        try {
            const embed = new EmbedBuilder()
                .setTitle('📝 Message Information')
                .setColor(COLORS.info)
                .addFields({ name: '👤 Author', value: message.author.tag, inline: true }, { name: '🆔 Message ID', value: message.id, inline: true }, { name: '📅 Created', value: `<t:${Math.floor(message.createdTimestamp / 1000)}:R>`, inline: true }, { name: '📺 Channel', value: `<#${message.channelId}>`, inline: true }, { name: '🔗 Jump', value: `[Jump to message](${message.url})`, inline: true }, { name: '📝 Content', value: message.content.slice(0, 100) + (message.content.length > 100 ? '...' : ''), inline: false })
                .setTimestamp();
            await i.editReply({ embeds: [embed] });
        }
        catch (error) {
            await i.editReply({ content: '❌ Error fetching message info' });
        }
    }
}
export default MessageInfoContextCommand;
//# sourceMappingURL=message-info.js.map