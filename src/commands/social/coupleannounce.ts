// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import { coupleProfileService } from '../../features/couple/CoupleProfileService.js';

export class CoupleAnnounceCommand extends BaseCommand {
  constructor() {
    super({ name: 'coupleannounce', description: 'Publish a couple or anniversary announcement with advanced formatting 📢', category: 'social', premiumTier: 'gold', cooldown: 30, guildOnly: true, slashCommand: true, prefixCommand: true, aliases: ['announcecouple', 'loveannounce'], examples: ['/coupleannounce', 'p!coupleannounce'] } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder().setName(this.name).setDescription(this.description)
      .addStringOption(o => o.setName('type').setDescription('Announcement type').setRequired(true)
        .addChoices({ name: '💑 New Couple', value: 'new' }, { name: '🎂 Anniversary', value: 'anniversary' }, { name: '💔 Breakup', value: 'breakup' }))
      .addStringOption(o => o.setName('message').setDescription('Custom message (optional)').setRequired(false).setMaxLength(300))
      .setDMPermission(false)) as SlashCommandBuilder;
  }

  private async handle(userId: string, guildId: string, type: string, customMsg: string | null, send: (c: any) => Promise<any>, channel: any): Promise<void> {
    const profile = await coupleProfileService.getProfile(userId, guildId);
    if (!profile) { await send({ content: '❌ You are not in a couple!', ephemeral: true }); return; }

    const partnerId = profile.userId1 === userId ? profile.userId2 : profile.userId1;
    const days = Math.floor((Date.now() - new Date(profile.marriedAt).getTime()) / 86400000);

    let embed: EmbedBuilder;
    if (type === 'new') {
      embed = new EmbedBuilder()
        .setTitle('💑 New Couple Alert! 🎊')
        .setDescription(`💕 **<@${userId}>** and **<@${partnerId}>** are officially a couple!\n\n${customMsg || '*Wishing them endless love and happiness!*'}\n\n*Together for **${days}** day${days !== 1 ? 's' : ''}*`)
        .setColor(0xff69b4);
    } else if (type === 'anniversary') {
      embed = new EmbedBuilder()
        .setTitle(`🎂 Anniversary — ${days} Days Together! 🎉`)
        .setDescription(`🥂 **<@${userId}>** and **<@${partnerId}>** are celebrating **${days} days** of love!\n\n${customMsg || '*Congratulations on your milestone!*'}`)
        .setColor(COLORS.gold);
    } else {
      embed = new EmbedBuilder()
        .setTitle('💔 Update')
        .setDescription(`**<@${userId}>** and **<@${partnerId}>** have ended their relationship.\n\n${customMsg || '*Wishing them both well.*'}`)
        .setColor(COLORS.error);
    }

    embed.setTimestamp().setFooter({ text: 'Panindigan Social' });

    // Post in the channel where command was used
    if (channel?.isTextBased()) {
      await channel.send({ embeds: [embed] });
      await send({ content: '✅ Announcement published!', ephemeral: true });
    } else {
      await send({ embeds: [embed] });
    }
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    await this.handle(i.user.id, i.guildId!, i.options.getString('type', true), i.options.getString('message'), (c) => i.reply(c), i.channel);
  }

  public async executePrefix(m: Message, _args: string[]): Promise<void> {
    const type = args[0]?.toLowerCase() || 'new';
    const customMsg = _args.slice(1).join(' ') || null;
    await this.handle(m.author.id, m.guildId!, type, customMsg, (c) => m.reply(c), m.channel);
  }
}
export default CoupleAnnounceCommand;
