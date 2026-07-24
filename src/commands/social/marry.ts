import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, SlashCommandBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants';
import { coupleConsentService } from '../../features/couple/CoupleConsentService';
import { coupleHistoryService } from '../../features/couple/CoupleHistoryService';

export class MarryCommand extends BaseCommand {
  constructor() {
    super({ name: 'marry', description: 'Propose marriage to another member! 💍', category: 'social', premiumTier: 'free', cooldown: 10, guildOnly: true, slashCommand: true, prefixCommand: true, aliases: ['propose', 'couplerequest'], examples: ['/marry @user', 'p!marry @user'] } as CommandOptions);
  }
  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder().setName(this.name).setDescription(this.description).addUserOption(o => o.setName('user').setDescription('Who to propose to').setRequired(true)).setDMPermission(false)) as SlashCommandBuilder;
  }

  private async handle(proposerId: string, targetId: string, guildId: string, send: (content: any) => Promise<any>): Promise<void> {
    if (proposerId === targetId) { await send({ content: '❌ Hindi ka makakapag-propose sa iyong sarili!', ephemeral: true }); return; }
    
    const result = await coupleConsentService.sendRequest(proposerId, targetId, guildId);
    if (!result.success) { await send({ content: `❌ ${result.error}`, ephemeral: true }); return; }

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId(`marry_accept:${proposerId}:${targetId}`).setLabel('💍 Tanggapin').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId(`marry_decline:${proposerId}:${targetId}`).setLabel('💔 Tanggihan').setStyle(ButtonStyle.Danger),
    );

    const embed = new EmbedBuilder()
      .setTitle('💍 Marriage Proposal!')
      .setDescription(`<@${proposerId}> is proposing to <@${targetId}>!\n\n<@${targetId}>, will you accept?`)
      .setColor(COLORS.gold).setFooter({ text: 'This request expires in 5 minutes.' });

    const msg = await send({ embeds: [embed], components: [row] });

    if (!msg) return;
    const collector = msg.createMessageComponentCollector({ componentType: ComponentType.Button, time: 300000, filter: (i: any) => i.user.id === targetId });

    collector.on('collect', async (i: any) => {
      if (i.customId.startsWith('marry_accept')) {
        const acceptResult = await coupleConsentService.acceptRequest(targetId, guildId);
        if (!acceptResult.success) { await i.update({ content: `❌ ${acceptResult.error}`, components: [], embeds: [] }); return; }
        await coupleHistoryService.recordMarriage(proposerId, targetId, guildId);
        const successEmbed = new EmbedBuilder()
          .setTitle('💒 Sila na!')
          .setDescription(`🎊 <@${proposerId}> at <@${targetId}> ay opisyal na isang couple!\n\n*Mahabang pagmamahal sa inyong dalawa!* 💕`)
          .setColor(0xff69b4).setTimestamp();
        await i.update({ embeds: [successEmbed], components: [] });
      } else {
        await coupleConsentService.declineRequest(targetId, guildId);
        const declineEmbed = new EmbedBuilder().setDescription(`💔 <@${targetId}> ay tumanggi sa proposal ni <@${proposerId}>.`).setColor(COLORS.error);
        await i.update({ embeds: [declineEmbed], components: [] });
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
    await this.handle(i.user.id, t.id, i.guildId!, (content) => i.reply(content));
  }
  public async executePrefix(m: Message, args: string[]): Promise<void> {
    const t = m.mentions.users.first(); if (!t) { await m.reply('❌ Mention mo ang taong gusto mong i-propose!'); return; }
    await this.handle(m.author.id, t.id, m.guildId!, (content) => m.reply(content));
  }
}
export default MarryCommand;
