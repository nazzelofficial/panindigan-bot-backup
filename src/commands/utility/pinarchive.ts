import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, ChannelType } from 'discord.js';
import { COLORS } from '../../utils/Constants';

export class PinarchiveCommand extends BaseCommand {
  constructor() {
    super({ name: 'pinarchive', description: 'Archive all pinned messages in current channel', category: 'utility', premiumTier: 'free', cooldown: 10, guildOnly: true, ownerOnly: false, slashCommand: true, prefixCommand: true, aliases: ['archivepins', 'pins'], examples: ['/pinarchive', 'p!pinarchive'] } as CommandOptions);
  }
  private async run(i: ChatInputCommandInteraction | null, m: Message | null): Promise<void> {
    const channel = i?.channel ?? m?.channel;
    if (!channel || channel.type !== ChannelType.GuildText) return;
    const send = async (e: EmbedBuilder) => { if (i) await i.reply({ embeds: [e] }); else await m!.reply({ embeds: [e] }); };
    const pins = await channel.messages.fetchPinned();
    if (!pins.size) return send(new EmbedBuilder().setColor(COLORS.default).setDescription('📌 No pinned messages in this channel.'));
    const embed = new EmbedBuilder().setColor(COLORS.default).setTitle(`📌 Pinned Messages Archive (${pins.size})`);
    const lines = [...pins.values()].map(p => `• [${p.author.tag}](${p.url}): ${p.content.slice(0, 80) || '[Attachment/Embed]'}`);
    embed.setDescription(lines.slice(0, 25).join('\n'));
    if (pins.size > 25) embed.setFooter({ text: `Showing 25 of ${pins.size} pins` });
    await send(embed);
  }
  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> { await this.run(i, null); }
  public async executePrefix(m: Message): Promise<void> { await this.run(null, m); }
}
export default PinarchiveCommand;
