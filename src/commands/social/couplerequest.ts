import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, SlashCommandBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants';
import { coupleConsentService } from '../../features/couple/CoupleConsentService';
import { coupleHistoryService } from '../../features/couple/CoupleHistoryService';

export class CoupleRequestCommand extends BaseCommand {
  constructor() {
    super({ name: 'couplerequest', description: 'Send a couple request to another member 💕', category: 'social', premiumTier: 'free', cooldown: 10, guildOnly: true, slashCommand: true, prefixCommand: true, aliases: ['cr', 'daterequest'], examples: ['/couplerequest @user', 'p!couplerequest @user'] } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder().setName(this.name).setDescription(this.description)
      .addUserOption(o => o.setName('user').setDescription('Who to send a couple request to').setRequired(true))
      .setDMPermission(false)) as SlashCommandBuilder;
  }

  private async handle(senderId: string, targetId: string, guildId: string, send: (content: any) => Promise<any>): Promise<void> {
    if (senderId === targetId) { await send({ content: '❌ Hindi ka makakapag-send ng request sa iyong sarili!', ephemeral: true }); return; }

    const result = await coupleConsentService.sendRequest(senderId, targetId, guildId);
    if (!result.success) { await send({ content: `❌ ${result.error}`, ephemeral: true }); return; }

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId(`cr_accept:${senderId}:${targetId}`).setLabel('💕 Tanggapin').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId(`cr_decline:${senderId}:${targetId}`).setLabel('💔 Tanggihan').setStyle(ButtonStyle.Danger),
    );

    const embed = new EmbedBuilder()
      .setTitle('💕 Couple Request!')
      .setDescription(`<@${senderId}> is sending a couple request to <@${targetId}>!\n\n<@${targetId}>, do you accept?`)
      .setColor(0xff69b4)
      .setFooter({ text: 'This request expires in 5 minutes.' });

    const msg = await send({ embeds: [embed], components: [row] });
    if (!msg) return;

    const collector = msg.createMessageComponentCollector({ componentType: ComponentType.Button, time: 300000, filter: (i: any) => i.user.id === targetId });

    collector.on('collect', async (i: any) => {
      if (i.customId.startsWith('cr_accept')) {
        const acceptResult = await coupleConsentService.acceptRequest(targetId, guildId);
        if (!acceptResult.success) { await i.update({ content: `❌ ${acceptResult.error}`, components: [], embeds: [] }); return; }
        await coupleHistoryService.recordMarriage(senderId, targetId, guildId);
        const successEmbed = new EmbedBuilder()
          .setTitle('💑 Sila na!')
          .setDescription(`🎊 <@${senderId}> at <@${targetId}> ay opisyal na isang couple!\n\n*Mahabang pagmamahal!* 💕`)
          .setColor(0xff69b4).setTimestamp();
        await i.update({ embeds: [successEmbed], components: [] });
      } else {
        await coupleConsentService.declineRequest(targetId, guildId);
        await i.update({ embeds: [new EmbedBuilder().setDescription(`💔 <@${targetId}> declined the request.`).setColor(COLORS.error)], components: [] });
      }
      collector.stop();
    });

    collector.on('end', async (collected: any) => {
      if (collected.size === 0) {
        await coupleConsentService.declineRequest(targetId, guildId);
        try { await msg.edit({ components: [] }); } catch { /* ignored */ }
      }
    });
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    const t = i.options.getUser('user', true);
    await this.handle(i.user.id, t.id, i.guildId!, (c) => i.reply(c));
  }

  public async executePrefix(m: Message, args: string[]): Promise<void> {
    const t = m.mentions.users.first();
    if (!t) { await m.reply('❌ Mention mo ang taong gusto mong maging couple!'); return; }
    await this.handle(m.author.id, t.id, m.guildId!, (c) => m.reply(c));
  }
}
export default CoupleRequestCommand;
