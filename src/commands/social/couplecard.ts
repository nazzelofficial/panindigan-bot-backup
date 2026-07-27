// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, AttachmentBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import { coupleProfileService } from '../../features/couple/CoupleProfileService.js';
import { createCanvas, loadImage } from 'canvas';

export class CouplecardCommand extends BaseCommand {
  constructor() {
    super({ name: 'couplecard', description: 'Generate a premium couple image card with avatars and details 💑', category: 'social', premiumTier: 'gold', cooldown: 10, guildOnly: true, slashCommand: true, prefixCommand: true, aliases: ['lovecard', 'couplepic'], examples: ['/couplecard', 'p!couplecard'] } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder().setName(this.name).setDescription(this.description).setDMPermission(false)) as SlashCommandBuilder;
  }

  private async handle(userId: string, guildId: string, send: (c: any) => Promise<any>, client: any): Promise<void> {
    const profile = await coupleProfileService.getProfile(userId, guildId);
    if (!profile) { await send({ content: '❌ You are not in a couple! Use `/marry @user` to start.', ephemeral: true }); return; }

    const partnerId = profile.userId1 === userId ? profile.userId2 : profile.userId1;
    let user1, user2;
    try {
      user1 = await client.users.fetch(userId);
      user2 = await client.users.fetch(partnerId);
    } catch { await send({ content: '❌ Could not fetch user data.', ephemeral: true }); return; }

    const days = Math.floor((Date.now() - new Date(profile.marriedAt).getTime()) / 86400000);

    try {
      const W = 700, H = 250;
      const canvas = createCanvas(W, H);
      const ctx = canvas.getContext('2d');

      // Background gradient
      const grad = ctx.createLinearGradient(0, 0, W, H);
      grad.addColorStop(0, '#2d0036');
      grad.addColorStop(0.5, '#5c0042');
      grad.addColorStop(1, '#2d0036');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // Decorative hearts
      ctx.font = '24px Arial';
      ctx.fillStyle = 'rgba(255,105,180,0.15)';
      for (let x = 20; x < W; x += 60) for (let y = 20; y < H; y += 60) ctx.fillText('❤', x, y);

      // Avatars
      const aSize = 150;
      const av1 = await loadImage(user1.displayAvatarURL({ extension: 'png', size: 256 })).catch(() => null);
      const av2 = await loadImage(user2.displayAvatarURL({ extension: 'png', size: 256 })).catch(() => null);
      if (av1) { ctx.save(); ctx.beginPath(); ctx.arc(90, H / 2, aSize / 2, 0, Math.PI * 2); ctx.clip(); ctx.drawImage(av1, 90 - aSize / 2, H / 2 - aSize / 2, aSize, aSize); ctx.restore(); }
      if (av2) { ctx.save(); ctx.beginPath(); ctx.arc(W - 90, H / 2, aSize / 2, 0, Math.PI * 2); ctx.clip(); ctx.drawImage(av2, W - 90 - aSize / 2, H / 2 - aSize / 2, aSize, aSize); ctx.restore(); }

      // Center text
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 28px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('❤', W / 2, H / 2 + 10);
      ctx.font = '16px Arial';
      ctx.fillStyle = '#ffb6c1';
      ctx.fillText(`${days} days together`, W / 2, H / 2 + 40);
      if (profile.sharedNickname) { ctx.font = 'italic 14px Arial'; ctx.fillStyle = '#ffd6e7'; ctx.fillText(`"${profile.sharedNickname}"`, W / 2, H / 2 + 62); }

      // Names
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(user1.username, 90, H - 20);
      ctx.fillText(user2.username, W - 90, H - 20);

      const buf = canvas.toBuffer('image/png');
      const embed = new EmbedBuilder().setTitle('💑 Couple Card').setColor(0xff69b4).setImage('attachment://couplecard.png');
      await send({ embeds: [embed], files: [new AttachmentBuilder(buf, { name: 'couplecard.png' })] });
    } catch (e: any) {
      await send({ content: `❌ Failed to generate card: ${e.message}`, ephemeral: true });
    }
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    await this.handle(i.user.id, i.guildId!, (c) => i.editReply(c), i.client);
  }

  public async executePrefix(m: Message, _args: string[]): Promise<void> {
    await this.handle(m.author.id, m.guildId!, (c) => m.reply(c), m.client);
  }
}
export default CouplecardCommand;
