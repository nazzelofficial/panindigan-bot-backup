import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS } from '../../utils/Constants';
import { getPrismaClient } from '../../database/postgresql/client';

export class GiveawayScheduleCommand extends BaseCommand {
  constructor() {
    super({ name: 'gschedule', description: 'Schedule a giveaway to start at a future time', category: 'giveaway', premiumTier: 'free', cooldown: 10, guildOnly: true, slashCommand: true, prefixCommand: true, userPermissions: [PermissionFlagsBits.ManageGuild], aliases: ['giveaway-schedule', 'gw-schedule'], examples: ['/gschedule', 'p!gschedule Nitro 2d 1h 1'] } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder().setName(this.name).setDescription(this.description)
      .addStringOption(o => o.setName('prize').setDescription('Giveaway prize').setRequired(true))
      .addStringOption(o => o.setName('start_in').setDescription('When to start (e.g. 2h, 1d)').setRequired(true))
      .addStringOption(o => o.setName('duration').setDescription('Giveaway duration (e.g. 1h, 2d)').setRequired(true))
      .addIntegerOption(o => o.setName('winners').setDescription('Number of winners').setRequired(false).setMinValue(1).setMaxValue(20))
      .setDMPermission(false)) as SlashCommandBuilder;
  }

  private parseDuration(str: string): number {
    const units: Record<string, number> = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
    const match = str.match(/^(\d+)([smhd])$/i);
    return match ? parseInt(match[1]) * (units[match[2].toLowerCase()] || 0) : 0;
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    const prize = i.options.getString('prize', true);
    const startIn = i.options.getString('start_in', true);
    const duration = i.options.getString('duration', true);
    const winners = i.options.getInteger('winners') || 1;

    const startMs = this.parseDuration(startIn);
    const durationMs = this.parseDuration(duration);
    if (!startMs) { await i.reply({ content: '❌ Invalid start_in format. Use: 1h, 2d, etc.', ephemeral: true }); return; }
    if (!durationMs) { await i.reply({ content: '❌ Invalid duration format.', ephemeral: true }); return; }

    const startAt = new Date(Date.now() + startMs);
    const endsAt = new Date(startAt.getTime() + durationMs);

    const prisma = getPrismaClient();
    const g = await prisma.giveaway.create({
      data: { guildId: i.guildId!, channelId: i.channelId!, prize, winnerCount: winners, hostId: i.user.id, endsAt, active: false, scheduledAt: startAt },
    });

    const embed = new EmbedBuilder().setTitle('📅 Giveaway Scheduled').setColor(COLORS.gold)
      .addFields(
        { name: '🎁 Prize', value: prize, inline: true },
        { name: '👥 Winners', value: `${winners}`, inline: true },
        { name: '🕐 Starts', value: `<t:${Math.floor(startAt.getTime() / 1000)}:F>`, inline: false },
        { name: '🏁 Ends', value: `<t:${Math.floor(endsAt.getTime() / 1000)}:F>`, inline: false },
        { name: '🎫 ID', value: `\`${g.id}\``, inline: true },
      ).setTimestamp();
    await i.reply({ embeds: [embed] });
  }

  public async executePrefix(m: Message, args: string[]): Promise<void> {
    if (args.length < 4) { await m.reply('❌ Usage: `p!gschedule <prize> <start_in> <duration> [winners]`\nExample: `p!gschedule "Nitro" 2h 1d 1`'); return; }
    const [prize, startIn, duration, wStr] = args;
    const startMs = this.parseDuration(startIn);
    const durationMs = this.parseDuration(duration);
    if (!startMs || !durationMs) { await m.reply('❌ Invalid duration format.'); return; }
    const startAt = new Date(Date.now() + startMs);
    const endsAt = new Date(startAt.getTime() + durationMs);
    const prisma = getPrismaClient();
    const g = await prisma.giveaway.create({ data: { guildId: m.guildId!, channelId: m.channelId, prize, winnerCount: parseInt(wStr) || 1, hostId: m.author.id, endsAt, active: false, scheduledAt: startAt } });
    await m.reply(`✅ Giveaway scheduled! Starts <t:${Math.floor(startAt.getTime() / 1000)}:R>. ID: \`${g.id}\``);
  }
}
export default GiveawayScheduleCommand;
