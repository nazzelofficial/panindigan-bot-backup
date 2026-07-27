// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits, ChannelType } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';

export class BulkdeleteCommand extends BaseCommand {
  constructor() {
    super({ name: 'bulkdelete', description: 'Bulk delete messages from a specific user', category: 'utility', premiumTier: 'gold', cooldown: 10, guildOnly: true, ownerOnly: false, slashCommand: true, prefixCommand: true, userPermissions: [PermissionFlagsBits.ManageMessages], botPermissions: [PermissionFlagsBits.ManageMessages], aliases: ['purgeuser', 'cleanuser'], examples: ['/bulkdelete @user 50', 'p!bulkdelete @user 30'] } as CommandOptions);
  }
  private async run(i: ChatInputCommandInteraction | null, m: Message | null, userId: string, count: number): Promise<void> {
    const channel = i?.channel ?? m?.channel;
    if (!channel || channel.type !== ChannelType.GuildText) return;
    const send = async (e: EmbedBuilder) => { if (i) await i.reply({ embeds: [e], flags: 64 }); else await m!.reply({ embeds: [e] }); };
    if (!userId) return send(new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Mention a user.'));
    const fetchCount = Math.min(count || 50, 100);
    const messages = await channel.messages.fetch({ limit: 200 });
    const toDelete = messages.filter(msg => msg.author.id === userId && (Date.now() - msg.createdTimestamp) < 14 * 24 * 60 * 60 * 1000).first(fetchCount);
    if (!toDelete.length) return send(new EmbedBuilder().setColor(COLORS.error).setDescription('❌ No recent messages found from that user.'));
    await channel.bulkDelete(toDelete, true);
    await send(new EmbedBuilder().setColor(COLORS.success).setTitle('🗑️ Bulk Delete Complete').setDescription(`Deleted **${toDelete.length}** messages from <@${userId}>.`));
  }
  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> { await this.run(i, null, i.options.getUser('user', true).id, i.options.getInteger('count') ?? 50); }
  public async executePrefix(m: Message, _args: string[]): Promise<void> { await this.run(null, m, args[0]?.replace(/[<@!>]/g, ''), parseInt(args[1]) || 50); }
}
export default BulkdeleteCommand;
