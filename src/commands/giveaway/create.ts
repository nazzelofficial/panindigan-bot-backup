// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits, ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';

export class GiveawayCreateCommand extends BaseCommand {
  constructor() {
    super({ name: 'gcreate', description: 'Create and start a giveaway interactively', category: 'giveaway', premiumTier: 'free', cooldown: 10, guildOnly: true, slashCommand: true, prefixCommand: true, userPermissions: [PermissionFlagsBits.ManageGuild], aliases: ['giveaway-create', 'gw-create'], examples: ['/gcreate', 'p!gcreate'] } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder().setName(this.name).setDescription(this.description)
      .addStringOption(o => o.setName('prize').setDescription('What is the prize?').setRequired(true))
      .addStringOption(o => o.setName('duration').setDescription('Duration e.g. 1h, 30m, 1d').setRequired(true))
      .addIntegerOption(o => o.setName('winners').setDescription('Number of winners').setRequired(false).setMinValue(1).setMaxValue(20))
      .addChannelOption(o => o.setName('channel').setDescription('Channel for the giveaway').setRequired(false))
      .addRoleOption(o => o.setName('required_role').setDescription('Role required to enter').setRequired(false))
      .setDMPermission(false)) as SlashCommandBuilder;
  }

  private parseDuration(str: string): number {
    const units: Record<string, number> = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
    const match = str.match(/^(\d+)([smhd])$/i);
    if (!match) return 0;
    return parseInt(match[1]) * (units[match[2].toLowerCase()] || 0);
  }

  private async createGiveaway(guildId: string, channelId: string, prize: string, durationStr: string, winnerCount: number, hostId: string, requiredRoleId?: string): Promise<{ success: boolean; message?: string; giveawayId?: string }> {
    const ms = this.parseDuration(durationStr);
    if (!ms || ms < 10000) return { success: false, message: '❌ Invalid duration. Use format: 1h, 30m, 2d. Minimum 10 seconds.' };
    if (ms > 30 * 86400000) return { success: false, message: '❌ Maximum giveaway duration is 30 days.' };

    const prisma = getPrismaClient();
    const endsAt = new Date(Date.now() + ms);

    const giveaway = await prisma.giveaway.create({
      data: {
        guildId,
        channelId,
        prize,
        winnerCount,
        hostId,
        endsAt,
        active: true,
        requiredRoleId: requiredRoleId || null,
      },
    });

    return { success: true, giveawayId: giveaway.id };
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    const prize = i.options.getString('prize', true);
    const duration = i.options.getString('duration', true);
    const winners = i.options.getInteger('winners') || 1;
    const channel = i.options.getChannel('channel') || i.channel!;
    const requiredRole = i.options.getRole('required_role');

    await i.deferReply({ ephemeral: true });

    const result = await this.createGiveaway(i.guildId!, channel.id, prize, duration, winners, i.user.id, requiredRole?.id);
    if (!result.success || !result.giveawayId) { await i.editReply({ content: result.message || '❌ Failed to create giveaway.' }); return; }

    const ms = this.parseDuration(duration);
    const endsAt = new Date(Date.now() + ms);

    const embed = new EmbedBuilder()
      .setTitle('🎉 GIVEAWAY!')
      .setColor(COLORS.gold)
      .setDescription(`**Prize:** ${prize}\n\nClick the button below to enter!`)
      .addFields(
        { name: '🎁 Prize', value: prize, inline: true },
        { name: '👥 Winners', value: `${winners}`, inline: true },
        { name: '🕐 Ends', value: `<t:${Math.floor(endsAt.getTime() / 1000)}:R>`, inline: true },
        { name: '🎫 Hosted by', value: `<@${i.user.id}>`, inline: true },
        ...(requiredRole ? [{ name: '🔒 Required Role', value: `<@&${requiredRole.id}>`, inline: true }] : []),
      )
      .setFooter({ text: `Giveaway ID: ${result.giveawayId}` })
      .setTimestamp(endsAt);

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId(`giveaway_enter:${result.giveawayId}`).setLabel('🎉 Enter Giveaway').setStyle(ButtonStyle.Primary),
    );

    const targetChannel = i.guild?.channels.cache.get(channel.id);
    if (targetChannel?.isTextBased()) {
      const msg = await (targetChannel as any).send({ embeds: [embed], components: [row] });

      // Store message ID in giveaway record
      const prisma = getPrismaClient();
      await prisma.giveaway.update({ where: { id: result.giveawayId }, data: { messageId: msg.id } });

      await i.editReply({ content: `✅ Giveaway created in <#${channel.id}>!` });
    } else {
      await i.editReply({ content: '❌ Cannot send messages to that channel.' });
    }
  }

  public async executePrefix(m: Message, args: string[]): Promise<void> {
    if (!args.length) { await m.reply('❌ Usage: `p!gcreate <prize> <duration> [winners]`\nExample: `p!gcreate Nitro 1h 3`'); return; }
    const durationIdx = args.findIndex(a => /^\d+[smhd]$/i.test(a));
    if (durationIdx === -1) { await m.reply('❌ Please include a valid duration (e.g. 1h, 30m, 2d).'); return; }
    const prize = args.slice(0, durationIdx).join(' ') || 'Mystery Prize';
    const duration = args[durationIdx];
    const winners = parseInt(args[durationIdx + 1]) || 1;

    const result = await this.createGiveaway(m.guildId!, m.channelId, prize, duration, winners, m.author.id);
    if (!result.success || !result.giveawayId) { await m.reply(result.message || '❌ Failed.'); return; }

    const ms = this.parseDuration(duration);
    const endsAt = new Date(Date.now() + ms);
    const embed = new EmbedBuilder().setTitle('🎉 GIVEAWAY!').setColor(COLORS.gold)
      .setDescription(`**Prize:** ${prize}\n\nClick the button below to enter!`)
      .addFields({ name: '🎁 Prize', value: prize, inline: true }, { name: '👥 Winners', value: `${winners}`, inline: true }, { name: '🕐 Ends', value: `<t:${Math.floor(endsAt.getTime() / 1000)}:R>`, inline: true })
      .setTimestamp(endsAt);

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId(`giveaway_enter:${result.giveawayId}`).setLabel('🎉 Enter Giveaway').setStyle(ButtonStyle.Primary),
    );

    const msg = await m.channel.send({ embeds: [embed], components: [row] });
    const prisma = getPrismaClient();
    await prisma.giveaway.update({ where: { id: result.giveawayId }, data: { messageId: msg.id } });
    await m.reply(`✅ Giveaway started! ID: \`${result.giveawayId}\``);
  }
}
export default GiveawayCreateCommand;
