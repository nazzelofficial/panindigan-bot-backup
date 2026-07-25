import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants';
import { coupleConsentService } from '../../features/couple/CoupleConsentService';

export class CoupleDeclineCommand extends BaseCommand {
  constructor() {
    super({ name: 'coupledecline', description: 'Decline a pending couple request 💔', category: 'social', premiumTier: 'free', cooldown: 3, guildOnly: true, slashCommand: true, prefixCommand: true, aliases: ['declinecouple', 'rejectrequest'], examples: ['/coupledecline', 'p!coupledecline'] } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder().setName(this.name).setDescription(this.description).setDMPermission(false)) as SlashCommandBuilder;
  }

  private async handle(userId: string, guildId: string, send: (content: any) => Promise<any>): Promise<void> {
    const pendingRequest = await coupleConsentService.getPendingRequest(userId, guildId);
    if (!pendingRequest) {
      await send({ content: '❌ Wala kang pending na couple request na tatanggihan.', ephemeral: true });
      return;
    }

    await coupleConsentService.declineRequest(userId, guildId);

    const embed = new EmbedBuilder()
      .setTitle('💔 Request Declined')
      .setDescription(`You have declined the couple request from <@${pendingRequest.requesterId}>.`)
      .setColor(COLORS.error)
      .setTimestamp();

    await send({ embeds: [embed], ephemeral: true });
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    await this.handle(i.user.id, i.guildId!, (c) => i.reply(c));
  }

  public async executePrefix(m: Message, _args: string[]): Promise<void> {
    await this.handle(m.author.id, m.guildId!, (c) => m.reply(c));
  }
}
export default CoupleDeclineCommand;
