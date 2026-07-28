// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import { coupleProfileService } from '../../features/couple/CoupleProfileService.js';
import { getPrismaClient } from '../../database/postgresql/client.js';

export class CoupleNicknameCommand extends BaseCommand {
  constructor() {
    super({ name: 'couplenickname', description: 'Set a shared premium couple nickname 💕', category: 'social', premiumTier: 'gold', cooldown: 5, guildOnly: true, slashCommand: true, prefixCommand: true, aliases: ['couplenicke', 'setcouplenick', 'sharedname'], examples: ['/couplenickname ForeverUs', 'p!couplenickname The Dream Team'] } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder().setName(this.name).setDescription(this.description)
      .addSubcommand(s => s.setName('set').setDescription('Set your couple nickname')
        .addStringOption(o => o.setName('nickname').setDescription('Shared couple nickname').setRequired(true).setMaxLength(50)))
      .addSubcommand(s => s.setName('view').setDescription('View your current couple nickname'))
      .addSubcommand(s => s.setName('remove').setDescription('Remove couple nickname'))
      .setDMPermission(false)) as SlashCommandBuilder;
  }

  private async handle(sub: string, userId: string, guildId: string, nickname: string | null, send: (c: any) => Promise<any>): Promise<void> {
    const profile = await coupleProfileService.getProfile(userId, guildId);
    if (!profile) { await send({ content: '❌ You are not in a couple!', ephemeral: true }); return; }

    const partnerId = profile.userId1 === userId ? profile.userId2 : profile.userId1;
    const prisma = getPrismaClient();

    if (sub === 'set') {
      await (prisma as any).couple?.update?.({ where: { id: profile.id }, data: { sharedNickname: nickname } }).catch(() => null);
      const embed = new EmbedBuilder()
        .setTitle('💕 Couple Nickname Set!')
        .setDescription(`Your couple nickname is now: **"${nickname}"**\n\nBoth <@${userId}> and <@${partnerId}> share this nickname on your couple profile.`)
        .setColor(0xff69b4).setTimestamp();
      await send({ embeds: [embed] });

    } else if (sub === 'view') {
      const currentNick = (profile as any).sharedNickname;
      const embed = new EmbedBuilder()
        .setTitle('💕 Couple Nickname')
        .setDescription(currentNick ? `**${currentNick}**\n\nShared by <@${userId}> and <@${partnerId}>` : 'No couple nickname set yet. Use `/couplenickname set <nickname>` to set one!')
        .setColor(0xff69b4).setTimestamp();
      await send({ embeds: [embed] });

    } else if (sub === 'remove') {
      await (prisma as any).couple?.update?.({ where: { id: profile.id }, data: { sharedNickname: null } }).catch(() => null);
      await send({ content: '✅ Couple nickname removed.', ephemeral: true });
    }
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    const sub = i.options.getSubcommand();
    await this.handle(sub, i.user.id, i.guildId!, i.options.getString('nickname'), (c) => i.reply(c));
  }

  public async executePrefix(m: Message, args: string[]): Promise<void> {
    const sub = args[0]?.toLowerCase() === 'set' || args[0]?.toLowerCase() === 'view' || args[0]?.toLowerCase() === 'remove' ? args[0].toLowerCase() : 'set';
    const nickname = sub === 'set' ? (args[1] ? args.slice(sub === 'set' && args[0].toLowerCase() === 'set' ? 1 : 0).join(' ') : args.join(' ')) : null;
    await this.handle(sub, m.author.id, m.guildId!, nickname, (c) => m.reply(c));
  }
}
export default CoupleNicknameCommand;
