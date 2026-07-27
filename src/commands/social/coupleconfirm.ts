// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import { coupleConsentService } from '../../features/couple/CoupleConsentService.js';
import { coupleHistoryService } from '../../features/couple/CoupleHistoryService.js';

export class CoupleConfirmCommand extends BaseCommand {
  constructor() {
    super({ name: 'coupleconfirm', description: 'Confirm your mutual couple status ✅', category: 'social', premiumTier: 'free', cooldown: 5, guildOnly: true, slashCommand: true, prefixCommand: true, aliases: ['confirmcouple', 'confirmstatus'], examples: ['/coupleconfirm', 'p!coupleconfirm'] } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder().setName(this.name).setDescription(this.description).setDMPermission(false)) as SlashCommandBuilder;
  }

  private async handle(userId: string, guildId: string, send: (content: any) => Promise<any>): Promise<void> {
    const pending = await coupleConsentService.getPendingRequest(userId, guildId);
    if (!pending) {
      await send({ content: '❌ Wala kang pending na couple request. Gamitin ang `/couplerequest @user` para magpadala ng request.', ephemeral: true });
      return;
    }

    const result = await coupleConsentService.acceptRequest(userId, guildId);
    if (!result.success) { await send({ content: `❌ ${result.error}`, ephemeral: true }); return; }

    await coupleHistoryService.recordMarriage(pending.requesterId, userId, guildId);

    const embed = new EmbedBuilder()
      .setTitle('✅ Couple Status Confirmed!')
      .setDescription(`🎊 **Opisyal na!**\n\n<@${userId}> and <@${pending.requesterId}> are now officially a couple!\n\n*Mahabang pagmamahal sa inyong dalawa!* 💕`)
      .setColor(0xff69b4)
      .setTimestamp();

    await send({ embeds: [embed] });
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    await this.handle(i.user.id, i.guildId!, (c) => i.reply(c));
  }

  public async executePrefix(m: Message, _args: string[]): Promise<void> {
    await this.handle(m.author.id, m.guildId!, (c) => m.reply(c));
  }
}
export default CoupleConfirmCommand;
