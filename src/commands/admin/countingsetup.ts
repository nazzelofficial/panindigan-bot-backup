import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits, ChannelType } from 'discord.js';
import { COLORS } from '../../utils/Constants';
import { getPrismaClient } from '../../database/postgresql/client';

export class CountingSetupCommand extends BaseCommand {
  constructor() {
    super({ name: 'countingsetup', description: 'Set up a counting channel for the server 🔢', category: 'admin', premiumTier: 'bronze', cooldown: 5, guildOnly: true, slashCommand: true, prefixCommand: true, userPermissions: [PermissionFlagsBits.ManageGuild], aliases: ['setupcounting', 'counting'], examples: ['/countingsetup #counting', '/countingsetup disable', 'p!countingsetup #counting'] } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder().setName(this.name).setDescription(this.description)
      .addSubcommand(s => s.setName('set').setDescription('Set up the counting channel')
        .addChannelOption(o => o.setName('channel').setDescription('Channel to use for counting').setRequired(true).addChannelTypes(ChannelType.GuildText))
        .addIntegerOption(o => o.setName('start').setDescription('Starting number (default: 0)').setRequired(false).setMinValue(0)))
      .addSubcommand(s => s.setName('disable').setDescription('Disable the counting channel'))
      .addSubcommand(s => s.setName('info').setDescription('View current counting channel info'))
      .addSubcommand(s => s.setName('reset').setDescription('Reset the count to 0'))
      .setDMPermission(false)) as SlashCommandBuilder;
  }

  private async handle(sub: string, guildId: string, channelId: string | null, startNum: number, send: (c: any) => Promise<any>): Promise<void> {
    const prisma = getPrismaClient();

    if (sub === 'set') {
      await prisma.guild.upsert({
        where: { guildId },
        create: { guildId, countingChannelId: channelId, countingCurrent: startNum } as any,
        update: { countingChannelId: channelId, countingCurrent: startNum } as any,
      });

      const embed = new EmbedBuilder()
        .setTitle('🔢 Counting Channel Set!')
        .setColor(COLORS.success)
        .addFields(
          { name: '📍 Channel', value: `<#${channelId}>`, inline: true },
          { name: '🔢 Starting At', value: `${startNum}`, inline: true },
        )
        .setDescription('Members must count up by 1 each message. Wrong numbers will be deleted!')
        .setTimestamp();
      await send({ embeds: [embed] });

    } else if (sub === 'disable') {
      await prisma.guild.upsert({ where: { guildId }, create: { guildId, countingChannelId: null } as any, update: { countingChannelId: null } as any });
      await send({ content: '✅ Counting channel disabled.', ephemeral: true });

    } else if (sub === 'info') {
      const guild = await prisma.guild.findUnique({ where: { guildId } });
      const chId = (guild as any)?.countingChannelId;
      const current = (guild as any)?.countingCurrent || 0;
      const embed = new EmbedBuilder()
        .setTitle('🔢 Counting Channel Info')
        .setColor(COLORS.info)
        .addFields(
          { name: '📍 Channel', value: chId ? `<#${chId}>` : 'Not set', inline: true },
          { name: '🔢 Current Count', value: `${current}`, inline: true },
        )
        .setTimestamp();
      await send({ embeds: [embed] });

    } else if (sub === 'reset') {
      await prisma.guild.upsert({ where: { guildId }, create: { guildId, countingCurrent: 0 } as any, update: { countingCurrent: 0 } as any });
      await send({ content: '✅ Count has been reset to 0!', ephemeral: false });
    }
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    const sub = i.options.getSubcommand();
    const channel = i.options.getChannel('channel');
    const startNum = i.options.getInteger('start') ?? 0;
    await this.handle(sub, i.guildId!, channel?.id || null, startNum, (c) => i.reply(c));
  }

  public async executePrefix(m: Message, args: string[]): Promise<void> {
    const sub = args[0]?.toLowerCase() === 'disable' ? 'disable' : args[0]?.toLowerCase() === 'info' ? 'info' : args[0]?.toLowerCase() === 'reset' ? 'reset' : 'set';
    const channel = m.mentions.channels.first();
    const startNum = parseInt(args.find(a => /^\d+$/.test(a)) || '0') || 0;
    await this.handle(sub, m.guildId!, channel?.id || null, startNum, (c) => m.reply(c));
  }
}
export default CountingSetupCommand;
