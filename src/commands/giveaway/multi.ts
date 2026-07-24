import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits, ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants';
import { getPrismaClient } from '../../database/postgresql/client';

export class GiveawayMultiCommand extends BaseCommand {
  constructor() {
    super({ name: 'gmulti', description: 'Start a multi-prize giveaway with multiple winners', category: 'giveaway', premiumTier: 'free', cooldown: 10, guildOnly: true, slashCommand: true, prefixCommand: true, userPermissions: [PermissionFlagsBits.ManageGuild], aliases: ['giveaway-multi', 'gw-multi', 'multiprize'], examples: ['/gmulti', 'p!gmulti "Nitro,VIP,Role" 1h 3'] } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder().setName(this.name).setDescription(this.description)
      .addStringOption(o => o.setName('prizes').setDescription('Prizes (comma-separated): "Nitro,VIP,Role"').setRequired(true))
      .addStringOption(o => o.setName('duration').setDescription('Duration e.g. 1h, 30m, 1d').setRequired(true))
      .setDMPermission(false)) as SlashCommandBuilder;
  }

  private parseDuration(str: string): number {
    const units: Record<string, number> = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
    const match = str.match(/^(\d+)([smhd])$/i);
    return match ? parseInt(match[1]) * (units[match[2].toLowerCase()] || 0) : 0;
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    const prizesStr = i.options.getString('prizes', true);
    const duration = i.options.getString('duration', true);
    const prizes = prizesStr.split(',').map(p => p.trim()).filter(Boolean);
    if (!prizes.length) { await i.reply({ content: '❌ No prizes provided.', ephemeral: true }); return; }

    const ms = this.parseDuration(duration);
    if (!ms) { await i.reply({ content: '❌ Invalid duration.', ephemeral: true }); return; }

    const prisma = getPrismaClient();
    const endsAt = new Date(Date.now() + ms);
    const label = prizes.join(' + ');

    const g = await prisma.giveaway.create({ data: { guildId: i.guildId!, channelId: i.channelId!, prize: label, winnerCount: prizes.length, hostId: i.user.id, endsAt, active: true } });

    const embed = new EmbedBuilder().setTitle('🎉 MULTI-PRIZE GIVEAWAY!').setColor(COLORS.gold)
      .setDescription(`Multiple prizes available!\n\nClick below to enter for a chance to win one of:\n${prizes.map((p, idx) => `${idx + 1}. **${p}**`).join('\n')}`)
      .addFields({ name: '🎁 Prizes', value: `${prizes.length} prizes total`, inline: true }, { name: '🕐 Ends', value: `<t:${Math.floor(endsAt.getTime() / 1000)}:R>`, inline: true })
      .setTimestamp(endsAt);

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId(`giveaway_enter:${g.id}`).setLabel('🎉 Enter Giveaway').setStyle(ButtonStyle.Primary),
    );

    const msg = await i.channel?.send({ embeds: [embed], components: [row] });
    if (msg) await prisma.giveaway.update({ where: { id: g.id }, data: { messageId: msg.id } });
    await i.reply({ content: `✅ Multi-prize giveaway started!`, ephemeral: true });
  }

  public async executePrefix(m: Message, args: string[]): Promise<void> {
    if (args.length < 2) { await m.reply('❌ Usage: `p!gmulti "<prize1,prize2,prize3>" <duration>`\nExample: `p!gmulti "Nitro,VIP,Role" 1h`'); return; }
    const prizesStr = args[0].replace(/"/g, '');
    const duration = args[1];
    const prizes = prizesStr.split(',').map(p => p.trim()).filter(Boolean);
    const ms = this.parseDuration(duration);
    if (!ms) { await m.reply('❌ Invalid duration.'); return; }
    const endsAt = new Date(Date.now() + ms);
    const prisma = getPrismaClient();
    const g = await prisma.giveaway.create({ data: { guildId: m.guildId!, channelId: m.channelId, prize: prizes.join(' + '), winnerCount: prizes.length, hostId: m.author.id, endsAt, active: true } });
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(new ButtonBuilder().setCustomId(`giveaway_enter:${g.id}`).setLabel('🎉 Enter').setStyle(ButtonStyle.Primary));
    const msg = await m.channel.send({ content: `🎉 **MULTI-PRIZE GIVEAWAY!**\nPrizes: ${prizes.map(p => `**${p}**`).join(', ')}\nEnds: <t:${Math.floor(endsAt.getTime() / 1000)}:R>`, components: [row] });
    await prisma.giveaway.update({ where: { id: g.id }, data: { messageId: msg.id } });
    await m.reply(`✅ Multi-prize giveaway started! ID: \`${g.id}\``);
  }
}
export default GiveawayMultiCommand;
