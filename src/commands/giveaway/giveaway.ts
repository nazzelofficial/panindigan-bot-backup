import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import {
  ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder,
  PermissionFlagsBits, ButtonBuilder, ButtonStyle, ActionRowBuilder, ComponentType, TextChannel,
} from 'discord.js';
import { COLORS } from '../../utils/Constants';
import { getPrismaClient } from '../../database/postgresql/client';

export class GiveawayCommand extends BaseCommand {
  constructor() {
    super({
      name: 'giveaway',
      description: 'Create and manage giveaways',
      category: 'giveaway',
      premiumTier: 'free',
      cooldown: 5,
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      userPermissions: [PermissionFlagsBits.ManageGuild],
      aliases: ['gw', 'give'],
      examples: ['/giveaway start', '/giveaway end <id>', '/giveaway reroll <id>'],
    } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder()
      .setName(this.name).setDescription(this.description)
      .addSubcommand(s => s.setName('start').setDescription('Start a new giveaway')
        .addStringOption(o => o.setName('prize').setDescription('What is being given away').setRequired(true))
        .addStringOption(o => o.setName('duration').setDescription('Duration (e.g. 1h, 30m, 1d)').setRequired(true))
        .addIntegerOption(o => o.setName('winners').setDescription('Number of winners').setRequired(false).setMinValue(1).setMaxValue(20))
        .addChannelOption(o => o.setName('channel').setDescription('Channel for giveaway').setRequired(false)))
      .addSubcommand(s => s.setName('end').setDescription('End a giveaway early').addStringOption(o => o.setName('id').setDescription('Giveaway message ID').setRequired(true)))
      .addSubcommand(s => s.setName('reroll').setDescription('Reroll winners').addStringOption(o => o.setName('id').setDescription('Giveaway message ID').setRequired(true)))
      .addSubcommand(s => s.setName('list').setDescription('List active giveaways'))
      .setDMPermission(false)) as SlashCommandBuilder;
  }

  private parseDuration(str: string): number {
    const units: Record<string, number> = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
    const match = str.match(/^(\d+)([smhd])$/i);
    if (!match) return 0;
    return parseInt(match[1]) * (units[match[2].toLowerCase()] || 0);
  }

  private async startGiveaway(guildId: string, channelId: string, prize: string, duration: string, winners: number, hostId: string, client: any): Promise<string> {
    const ms = this.parseDuration(duration);
    if (!ms || ms < 10000) return '❌ Invalid duration. Use format like `1h`, `30m`, `2d`. Minimum 10 seconds.';
    if (ms > 30 * 86400000) return '❌ Maximum giveaway duration is 30 days.';

    const endsAt = new Date(Date.now() + ms);
    const channel = client.channels.cache.get(channelId) as TextChannel;
    if (!channel?.isTextBased()) return '❌ Invalid channel.';

    const embed = new EmbedBuilder()
      .setTitle('🎉 GIVEAWAY!')
      .setDescription(`**Prize:** ${prize}\n\n**Hosted by:** <@${hostId}>\n**Ends:** <t:${Math.floor(endsAt.getTime() / 1000)}:R>\n**Winners:** ${winners}\n\nClick the button below to enter!`)
      .setColor(COLORS.gold)
      .setFooter({ text: `Ends at` })
      .setTimestamp(endsAt);

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId('giveaway_enter').setLabel('🎉 Enter').setStyle(ButtonStyle.Primary),
    );

    const msg = await channel.send({ embeds: [embed], components: [row] });

    const prisma = getPrismaClient();
    await prisma.guild.upsert({ where: { guildId }, create: { guildId }, update: {} });
    await (prisma as any).giveaway.create({
      data: {
        guildId, channelId, messageId: msg.id, prize,
        winnersCount: winners, hostId, endsAt, active: true,
      },
    });

    // Schedule end
    setTimeout(async () => {
      await this.endGiveaway(msg.id, guildId, client, false);
    }, ms);

    return `✅ Giveaway started in <#${channelId}>! Ends <t:${Math.floor(endsAt.getTime() / 1000)}:R>`;
  }

  private async endGiveaway(messageId: string, guildId: string, client: any, forced: boolean): Promise<string> {
    const prisma = getPrismaClient();
    const giveaway = await (prisma as any).giveaway.findFirst({
      where: { messageId, guildId, active: true },
    });

    if (!giveaway) return '❌ Giveaway not found or already ended.';

    const participants = giveaway.participants as string[] || [];
    await (prisma as any).giveaway.update({ where: { id: giveaway.id }, data: { active: false, endedAt: new Date() } });

    const channel = client.channels.cache.get(giveaway.channelId) as TextChannel;
    let winners: string[] = [];

    if (participants.length >= giveaway.winnersCount) {
      const shuffled = [...participants].sort(() => Math.random() - 0.5);
      winners = shuffled.slice(0, giveaway.winnersCount);
    }

    try {
      const msg = await channel?.messages.fetch(messageId);
      const embed = new EmbedBuilder()
        .setTitle('🎉 GIVEAWAY ENDED!')
        .setDescription(`**Prize:** ${giveaway.prize}\n\n**Winners:** ${winners.length ? winners.map((w: string) => `<@${w}>`).join(', ') : 'No valid participants!'}\n\n**Hosted by:** <@${giveaway.hostId}>`)
        .setColor(COLORS.error)
        .setTimestamp();
      await msg?.edit({ embeds: [embed], components: [] });

      if (winners.length) {
        await channel?.send({ content: `🎉 Congratulations ${winners.map((w: string) => `<@${w}>`).join(', ')}! You won **${giveaway.prize}**!` });
      } else {
        await channel?.send({ content: `😔 No valid entries for **${giveaway.prize}**.` });
      }
    } catch { /* Channel/message may be gone */ }

    return `✅ Giveaway ended! Winners: ${winners.length ? winners.map((w: string) => `<@${w}>`).join(', ') : 'None'}`;
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    const sub = i.options.getSubcommand();
    await i.deferReply({ ephemeral: true });

    if (sub === 'start') {
      const prize = i.options.getString('prize', true);
      const duration = i.options.getString('duration', true);
      const winners = i.options.getInteger('winners') || 1;
      const channel = (i.options.getChannel('channel') || i.channel)!;
      const result = await this.startGiveaway(i.guildId!, channel.id, prize, duration, winners, i.user.id, i.client);
      await i.editReply({ content: result });
    } else if (sub === 'end') {
      const id = i.options.getString('id', true);
      const result = await this.endGiveaway(id, i.guildId!, i.client, true);
      await i.editReply({ content: result });
    } else if (sub === 'reroll') {
      const id = i.options.getString('id', true);
      const result = await this.endGiveaway(id, i.guildId!, i.client, true);
      await i.editReply({ content: `🔄 Rerolled: ${result}` });
    } else if (sub === 'list') {
      const prisma = getPrismaClient();
      const giveaways = await (prisma as any).giveaway.findMany({ where: { guildId: i.guildId!, active: true } });
      if (!giveaways.length) { await i.editReply({ content: '❌ No active giveaways.' }); return; }
      const embed = new EmbedBuilder().setTitle('🎉 Active Giveaways').setColor(COLORS.gold)
        .setDescription(giveaways.map((g: any) => `**${g.prize}** — <#${g.channelId}> ends <t:${Math.floor(new Date(g.endsAt).getTime() / 1000)}:R>`).join('\n'));
      await i.editReply({ embeds: [embed] });
    }
  }

  public async executePrefix(m: Message, args: string[]): Promise<void> {
    const [sub, ...rest] = args;
    if (sub === 'start') {
      const channelMention = m.mentions.channels.first();
      const channelId = channelMention?.id || m.channelId;
      const durationStr = rest.find(a => /^\d+[smhd]$/i.test(a)) || '1h';
      const winnersStr = rest.find(a => a.startsWith('w:'));
      const winners = winnersStr ? parseInt(winnersStr.split(':')[1]) : 1;
      const prize = rest.filter(a => !a.match(/^\d+[smhd]$/) && !a.match(/^w:\d+/) && !a.match(/^<#/)).join(' ');
      if (!prize) { await m.reply('❌ Please provide a prize.'); return; }
      const result = await this.startGiveaway(m.guildId!, channelId, prize, durationStr, winners, m.author.id, m.client);
      await m.reply(result);
    } else {
      await m.reply('❌ Use `/giveaway start` for full options, or `p!giveaway start <duration> <prize>`');
    }
  }
}
export default GiveawayCommand;
