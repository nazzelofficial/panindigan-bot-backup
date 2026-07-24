import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';
import { getPrismaClient } from '../../database/postgresql/client';

export class VoiceXpCommand extends BaseCommand {
  constructor() {
    super({
      name: 'voicexp',
      description: 'Configure voice channel XP earning',
      category: 'leveling',
      premiumTier: 'silver',
      cooldown: 5,
      ownerOnly: false,
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      userPermissions: [PermissionFlagsBits.ManageGuild],
      aliases: ['voicexpconfig'],
      examples: [
        'p!voicexp enable',
        'p!voicexp disable',
        '/voicexp enable',
        '/voicexp status',
      ],
    } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addSubcommand(s => s.setName('enable').setDescription('Enable voice XP earning'))
      .addSubcommand(s => s.setName('disable').setDescription('Disable voice XP earning'))
      .addSubcommand(s => s.setName('status').setDescription('Check current voice XP configuration'))
      .setDMPermission(false)) as SlashCommandBuilder;
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    const sub = i.options.getSubcommand();
    const prisma = getPrismaClient();
    const guildId = i.guildId!;
    try {
      if (sub === 'enable') {
        await prisma.guild.upsert({ where: { guildId }, create: { guildId, voiceXpEnabled: true }, update: { voiceXpEnabled: true } });
        await i.reply({ content: `${EMOJIS.success} Voice XP is now **enabled**. Members will earn XP while in voice channels.`, ephemeral: true });
      } else if (sub === 'disable') {
        await prisma.guild.upsert({ where: { guildId }, create: { guildId, voiceXpEnabled: false }, update: { voiceXpEnabled: false } });
        await i.reply({ content: `${EMOJIS.success} Voice XP is now **disabled**.`, ephemeral: true });
      } else if (sub === 'status') {
        const guild = await prisma.guild.findUnique({ where: { guildId } });
        const embed = new EmbedBuilder()
          .setTitle('🎙️ Voice XP Configuration')
          .setColor(COLORS.default)
          .addFields(
            { name: 'Status', value: guild?.voiceXpEnabled ? '✅ Enabled' : '❌ Disabled', inline: true },
            { name: 'XP Rate', value: '5 XP per minute (configured in bot settings)', inline: true },
          )
          .setTimestamp();
        await i.reply({ embeds: [embed] });
      }
    } catch {
      await i.reply({ content: `${EMOJIS.error} Failed to update voice XP settings.`, ephemeral: true });
    }
  }

  public async executePrefix(m: Message, args: string[]): Promise<void> {
    if (!m.member?.permissions.has(PermissionFlagsBits.ManageGuild)) {
      await m.reply(`${EMOJIS.error} You need **Manage Server** permission.`);
      return;
    }
    const sub = args[0]?.toLowerCase();
    const prisma = getPrismaClient();
    const guildId = m.guildId!;
    try {
      if (sub === 'enable') {
        await prisma.guild.upsert({ where: { guildId }, create: { guildId, voiceXpEnabled: true }, update: { voiceXpEnabled: true } });
        await m.reply(`${EMOJIS.success} Voice XP is now **enabled**.`);
      } else if (sub === 'disable') {
        await prisma.guild.upsert({ where: { guildId }, create: { guildId, voiceXpEnabled: false }, update: { voiceXpEnabled: false } });
        await m.reply(`${EMOJIS.success} Voice XP is now **disabled**.`);
      } else {
        const guild = await prisma.guild.findUnique({ where: { guildId } });
        const embed = new EmbedBuilder()
          .setTitle('🎙️ Voice XP Configuration')
          .setColor(COLORS.default)
          .addFields(
            { name: 'Status', value: guild?.voiceXpEnabled ? '✅ Enabled' : '❌ Disabled', inline: true },
            { name: 'XP Rate', value: '5 XP per minute', inline: true },
          )
          .setFooter({ text: 'Usage: p!voicexp enable | disable' })
          .setTimestamp();
        await m.reply({ embeds: [embed] });
      }
    } catch {
      await m.reply(`${EMOJIS.error} Failed to update voice XP settings.`);
    }
  }
}
export default VoiceXpCommand;
