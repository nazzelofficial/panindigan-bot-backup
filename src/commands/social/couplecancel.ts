import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants';
import { coupleConsentService } from '../../features/couple/CoupleConsentService';

export class CoupleCancelCommand extends BaseCommand {
  constructor() {
    super({ name: 'couplecancel', description: 'Cancel a couple request you sent 🚫', category: 'social', premiumTier: 'free', cooldown: 3, guildOnly: true, slashCommand: true, prefixCommand: true, aliases: ['cancelcouple', 'cancelrequest'], examples: ['/couplecancel', 'p!couplecancel'] } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder().setName(this.name).setDescription(this.description).setDMPermission(false)) as SlashCommandBuilder;
  }

  private async handle(userId: string, guildId: string, send: (content: any) => Promise<any>): Promise<void> {
    const result = await coupleConsentService.cancelRequest(userId, guildId);
    if (!result.success) {
      await send({ content: `❌ ${result.error || 'Walang pending request na ika-cancel.'}`, ephemeral: true });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle('🚫 Request Cancelled')
      .setDescription('Your couple request has been cancelled.')
      .setColor(COLORS.warning)
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
export default CoupleCancelCommand;
