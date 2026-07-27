// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import { coupleProfileService } from '../../features/couple/CoupleProfileService.js';
import { coupleConsentService } from '../../features/couple/CoupleConsentService.js';

export class CoupleStatusCommand extends BaseCommand {
  constructor() {
    super({ name: 'couplestatus', description: 'Check if you\'re single, have a pending request, or are in a couple 💭', category: 'social', premiumTier: 'free', cooldown: 3, guildOnly: true, slashCommand: true, prefixCommand: true, aliases: ['relationshipstatus', 'rs'], examples: ['/couplestatus', 'p!couplestatus'] } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder().setName(this.name).setDescription(this.description)
      .addUserOption(o => o.setName('user').setDescription('Check another user\'s status').setRequired(false))
      .setDMPermission(false)) as SlashCommandBuilder;
  }

  private async handle(userId: string, guildId: string, send: (content: any) => Promise<any>, client: any): Promise<void> {
    const profile = await coupleProfileService.getProfile(userId, guildId);
    const pending = await coupleConsentService.getPendingRequest(userId, guildId);

    const embed = new EmbedBuilder().setTitle('💭 Relationship Status').setTimestamp();
    let user;
    try { user = await client.users.fetch(userId); } catch { /* ignored */ }
    if (user) embed.setThumbnail(user.displayAvatarURL({ extension: 'png', size: 128 }));

    if (profile) {
      const partnerId = profile.userId1 === userId ? profile.userId2 : profile.userId1;
      const days = Math.floor((Date.now() - new Date(profile.marriedAt).getTime()) / 86400000);
      embed.setColor(0xff69b4)
        .setDescription(`💑 **In a Couple**\n\nPartner: <@${partnerId}>\nTogether for: **${days} day${days !== 1 ? 's' : ''}**\nSince: <t:${Math.floor(new Date(profile.marriedAt).getTime() / 1000)}:D>`);
    } else if (pending) {
      embed.setColor(COLORS.warning)
        .setDescription(`⏳ **Pending Request**\n\nYou have a couple request from <@${pending.requesterId}>.\nUse \`/coupleaccept\` to accept or \`/coupledecline\` to decline.`);
    } else {
      embed.setColor(COLORS.info)
        .setDescription('💔 **Single**\n\nYou are not in a couple. Use `/marry @user` or `/couplerequest @user` to start!');
    }

    await send({ embeds: [embed] });
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    const target = i.options.getUser('user') || i.user;
    await this.handle(target.id, i.guildId!, (c) => i.reply(c), i.client);
  }

  public async executePrefix(m: Message, _args: string[]): Promise<void> {
    const target = m.mentions.users.first() || m.author;
    await this.handle(target.id, m.guildId!, (c) => m.reply(c), m.client);
  }
}
export default CoupleStatusCommand;
