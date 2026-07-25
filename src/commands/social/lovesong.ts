import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants';
import { coupleProfileService } from '../../features/couple/CoupleProfileService';
import { aiEngine } from '../../structures/AIEngine';

export class LovesongCommand extends BaseCommand {
  constructor() {
    super({ name: 'lovesong', description: 'Generate an AI-personalized love song for your partner 🎵', category: 'social', premiumTier: 'gold', cooldown: 30, guildOnly: true, slashCommand: true, prefixCommand: true, aliases: ['songforpartner', 'aisong'], examples: ['/lovesong', 'p!lovesong'] } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder().setName(this.name).setDescription(this.description)
      .addStringOption(o => o.setName('theme').setDescription('Theme of the song (optional)').setRequired(false).setMaxLength(100))
      .setDMPermission(false)) as SlashCommandBuilder;
  }

  private async handle(userId: string, guildId: string, theme: string | null, send: (c: any) => Promise<any>, client: any): Promise<void> {
    const profile = await coupleProfileService.getProfile(userId, guildId);
    if (!profile) { await send({ content: '❌ Wala kang kasalukuyang couple status. Use `/marry @user` first!', ephemeral: true }); return; }

    const partnerId = profile.userId1 === userId ? profile.userId2 : profile.userId1;
    const days = Math.floor((Date.now() - new Date(profile.marriedAt).getTime()) / 86400000);
    let partnerName = partnerId;
    try { const u = await client.users.fetch(partnerId); partnerName = u.username; } catch { /* ignored */ }

    const prompt = `Write a short, sweet, and romantic love song (2 verses + chorus) for a couple who have been together for ${days} days. The singer's name is not important, the partner is named "${partnerName}". Theme: ${theme || 'eternal love and togetherness'}. Make it heartfelt and a bit poetic. Include a title. Keep it under 25 lines.`;

    try {
      const result = await aiEngine.chat([{ role: 'user', content: prompt }], { provider: 'openai', maxTokens: 500 });
      const embed = new EmbedBuilder()
        .setTitle('🎵 AI Love Song')
        .setDescription(result.content || 'Could not generate song.')
        .setColor(0xff69b4)
        .addFields({ name: '💑 For', value: `<@${userId}> & <@${partnerId}> (${days} days together)`, inline: false })
        .setFooter({ text: 'AI-generated love song • Panindigan Social' })
        .setTimestamp();
      await send({ embeds: [embed] });
    } catch (e: any) {
      await send({ content: `❌ Failed to generate love song: ${e.message || 'AI unavailable.'}`, ephemeral: true });
    }
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    await this.handle(i.user.id, i.guildId!, i.options.getString('theme'), (c) => i.editReply(c), i.client);
  }

  public async executePrefix(m: Message, args: string[]): Promise<void> {
    const thinking = await m.reply('🎵 Composing your love song...');
    await this.handle(m.author.id, m.guildId!, args.join(' ') || null, async (c) => { await thinking.edit(c.content || ''); if (c.embeds) await thinking.edit({ content: '', ...c }); }, m.client);
  }
}
export default LovesongCommand;
