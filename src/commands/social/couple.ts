import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants';
import { coupleProfileService } from '../../features/couple/CoupleProfileService';

export class CoupleCommand extends BaseCommand {
  constructor() {
    super({ name: 'couple', description: 'View your couple profile 💑', category: 'social', premiumTier: 'free', cooldown: 5, guildOnly: true, slashCommand: true, prefixCommand: true, aliases: ['couplestatus'], examples: ['/couple', 'p!couple'] } as CommandOptions);
  }
  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    const profile = await coupleProfileService.getProfile(i.user.id, i.guildId!);
    if (!profile) { await i.reply({ content: '💔 You are not in a couple. Use `/marry @user` to propose!', ephemeral: true }); return; }
    const partnerId = profile.userId1 === i.user.id ? profile.userId2 : profile.userId1;
    const partner = await i.client.users.fetch(partnerId).catch(() => null);
    const days = Math.floor((Date.now() - new Date(profile.marriedAt).getTime()) / 86400000);
    const embed = new EmbedBuilder()
      .setTitle('💑 Couple Profile')
      .setColor(0xff69b4)
      .setDescription(profile.sharedNickname ? `*"${profile.sharedNickname}"*` : undefined)
      .addFields(
        { name: '💕 Partners', value: `${i.user} & ${partner || `<@${partnerId}>`}`, inline: false },
        { name: '📅 Together since', value: `<t:${Math.floor(new Date(profile.marriedAt).getTime() / 1000)}:D>`, inline: true },
        { name: '⏰ Days together', value: `${days} day${days !== 1 ? 's' : ''}`, inline: true },
        { name: '💬 Interactions', value: `${profile.interactions}`, inline: true },
      ).setTimestamp();
    await i.reply({ embeds: [embed] });
  }
  public async executePrefix(m: Message, args: string[]): Promise<void> {
    const profile = await coupleProfileService.getProfile(m.author.id, m.guildId!);
    if (!profile) { await m.reply('💔 You are not in a couple. Use `p!marry @user` to propose!'); return; }
    const partnerId = profile.userId1 === m.author.id ? profile.userId2 : profile.userId1;
    const days = Math.floor((Date.now() - new Date(profile.marriedAt).getTime()) / 86400000);
    const embed = new EmbedBuilder().setTitle('💑 Couple Profile').setColor(0xff69b4)
      .addFields({ name: '💕 Partners', value: `${m.author} & <@${partnerId}>`, inline: false }, { name: '⏰ Days together', value: `${days}`, inline: true }).setTimestamp();
    await m.reply({ embeds: [embed] });
  }
}
export default CoupleCommand;
