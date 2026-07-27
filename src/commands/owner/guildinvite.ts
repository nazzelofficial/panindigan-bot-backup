// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, ChannelType } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';

export class GuildinviteCommand extends BaseCommand {
  constructor() {
    super({ name: 'guildinvite', description: 'Create an invite link for any guild', category: 'owner', premiumTier: 'free', cooldown: 0, guildOnly: false, ownerOnly: true, slashCommand: true, prefixCommand: true, aliases: ['ginv'], examples: ['p!guildinvite 123456789'] } as CommandOptions);
  }
  private async run(i: ChatInputCommandInteraction | null, m: Message | null, guildId: string): Promise<void> {
    const client = i?.client ?? m!.client;
    const send = async (e: EmbedBuilder) => { if (i) await i.reply({ embeds: [e], flags: 64 }); else await m!.reply({ embeds: [e] }); };
    if (!guildId) return send(new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Provide a guild ID.'));
    const guild = client.guilds.cache.get(guildId);
    if (!guild) return send(new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Bot is not in that guild.'));
    const channel = guild.channels.cache.find(c => c.type === ChannelType.GuildText && (c as any).permissionsFor(guild.members.me!)?.has('CreateInstantInvite'));
    if (!channel) return send(new EmbedBuilder().setColor(COLORS.error).setDescription('❌ No suitable channel found to create invite.'));
    try {
      const invite = await (channel as any).createInvite({ maxAge: 3600, maxUses: 1, reason: 'Owner invite' });
      await send(new EmbedBuilder().setColor(COLORS.success).setTitle(`🔗 Invite: ${guild.name}`)
        .addFields(
          { name: '🔗 Link', value: invite.url, inline: false },
          { name: '⏱️ Expires', value: '1 hour', inline: true },
          { name: '🎫 Max Uses', value: '1', inline: true }
        ));
    } catch (err: any) {
      await send(new EmbedBuilder().setColor(COLORS.error).setDescription(`❌ ${err.message}`));
    }
  }
  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> { await this.run(i, null, i.options.getString('guild_id', true)); }
  public async executePrefix(m: Message, _args: string[]): Promise<void> { await this.run(null, m, args[0]); }
}
export default GuildinviteCommand;
