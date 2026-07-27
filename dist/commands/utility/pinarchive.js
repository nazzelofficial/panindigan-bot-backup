// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, ChannelType } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
export class PinarchiveCommand extends BaseCommand {
    constructor() {
        super({ name: 'pinarchive', description: 'Archive all pinned messages in current channel', category: 'utility', premiumTier: 'free', cooldown: 10, guildOnly: true, ownerOnly: false, slashCommand: true, prefixCommand: true, aliases: ['archivepins', 'pins'], examples: ['/pinarchive', 'p!pinarchive'] });
    }
    async run(i, m) {
        const channel = i?.channel ?? m?.channel;
        if (!channel || channel.type !== ChannelType.GuildText)
            return;
        const send = async (e) => { if (i)
            await i.reply({ embeds: [e] });
        else
            await m.reply({ embeds: [e] }); };
        const pins = await channel.messages.fetchPinned();
        if (!pins.size)
            return send(new EmbedBuilder().setColor(COLORS.default).setDescription('📌 No pinned messages in this channel.'));
        const embed = new EmbedBuilder().setColor(COLORS.default).setTitle(`📌 Pinned Messages Archive (${pins.size})`);
        const lines = [...pins.values()].map(p => `• [${p.author.tag}](${p.url}): ${p.content.slice(0, 80) || '[Attachment/Embed]'}`);
        embed.setDescription(lines.slice(0, 25).join('\n'));
        if (pins.size > 25)
            embed.setFooter({ text: `Showing 25 of ${pins.size} pins` });
        await send(embed);
    }
    async executeSlash(i) { await this.run(i, null); }
    async executePrefix(m) { await this.run(null, m); }
}
export default PinarchiveCommand;
