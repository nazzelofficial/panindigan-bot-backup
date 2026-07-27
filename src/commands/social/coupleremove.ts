// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, SlashCommandBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import { coupleProfileService } from '../../features/couple/CoupleProfileService.js';
import { coupleHistoryService } from '../../features/couple/CoupleHistoryService.js';

export class CoupleRemoveCommand extends BaseCommand {
  constructor() {
    super({ name: 'coupleremove', description: 'Remove your couple status (mutual agreement required) 💔', category: 'social', premiumTier: 'free', cooldown: 10, guildOnly: true, slashCommand: true, prefixCommand: true, aliases: ['removecouple', 'breakup'], examples: ['/coupleremove', 'p!coupleremove'] } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder().setName(this.name).setDescription(this.description).setDMPermission(false)) as SlashCommandBuilder;
  }

  private async handle(userId: string, guildId: string, send: (content: any) => Promise<any>): Promise<void> {
    const profile = await coupleProfileService.getProfile(userId, guildId);
    if (!profile) {
      await send({ content: '❌ Wala kang kasalukuyang couple status.', ephemeral: true });
      return;
    }

    const partnerId = profile.userId1 === userId ? profile.userId2 : profile.userId1;

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId(`cr_confirm:${userId}`).setLabel('💔 Oo, I-remove').setStyle(ButtonStyle.Danger),
      new ButtonBuilder().setCustomId(`cr_keep:${userId}`).setLabel('❌ Huwag').setStyle(ButtonStyle.Secondary),
    );

    const embed = new EmbedBuilder()
      .setTitle('💔 Remove Couple Status?')
      .setDescription(`Are you sure you want to remove your couple status with <@${partnerId}>?\n\nThis action cannot be undone.`)
      .setColor(COLORS.error);

    const msg = await send({ embeds: [embed], components: [row] });
    if (!msg) return;

    const collector = msg.createMessageComponentCollector({ componentType: ComponentType.Button, time: 30000, filter: (i: any) => i.user.id === userId });

    collector.on('collect', async (i: any) => {
      if (i.customId.startsWith('cr_confirm')) {
        await coupleHistoryService.recordDivorce(userId, partnerId, guildId);
        await coupleProfileService.removeCouple(userId, guildId);
        await i.update({ embeds: [new EmbedBuilder().setDescription(`💔 Couple status removed. You and <@${partnerId}> are no longer a couple.`).setColor(COLORS.error)], components: [] });
      } else {
        await i.update({ embeds: [new EmbedBuilder().setDescription('✅ Couple status kept. Mahabang pagmamahal! 💕').setColor(COLORS.success)], components: [] });
      }
      collector.stop();
    });

    collector.on('end', async (collected: any) => {
      if (collected.size === 0) try { await msg.edit({ components: [] }); } catch { /* ignored */ }
    });
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    await this.handle(i.user.id, i.guildId!, (c) => i.reply(c));
  }

  public async executePrefix(m: Message, _args: string[]): Promise<void> {
    await this.handle(m.author.id, m.guildId!, (c) => m.reply(c));
  }
}
export default CoupleRemoveCommand;
