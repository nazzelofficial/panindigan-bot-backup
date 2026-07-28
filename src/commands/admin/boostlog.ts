// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits, ChannelType } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';

export class BoostLogCommand extends BaseCommand {
  constructor() {
    super({ name: 'boostlog', description: 'Set up boost notification logging channel 🚀', category: 'admin', premiumTier: 'bronze', cooldown: 5, guildOnly: true, slashCommand: true, prefixCommand: true, userPermissions: [PermissionFlagsBits.ManageGuild], aliases: ['setboostlog', 'boostchannel', 'boostnotify'], examples: ['/boostlog #boosts', 'p!boostlog #boost-log'] } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder().setName(this.name).setDescription(this.description)
      .addChannelOption(o => o.setName('channel').setDescription('Channel for boost notifications (leave empty to disable)').setRequired(false).addChannelTypes(ChannelType.GuildText))
      .addStringOption(o => o.setName('message').setDescription('Custom boost message (use {user} for username)').setRequired(false).setMaxLength(500))
      .setDMPermission(false)) as SlashCommandBuilder;
  }

  private async handle(guildId: string, channelId: string | null, customMsg: string | null, send: (c: any) => Promise<any>): Promise<void> {
    const prisma = getPrismaClient();

    const defaultMsg = '🚀 {user} just boosted the server! Thank you for the boost! ❤️';

    await prisma.guild.upsert({
      where: { guildId },
      create: { guildId, boostLogChannelId: channelId, boostMessage: customMsg || defaultMsg } as any,
      update: { boostLogChannelId: channelId, boostMessage: customMsg || defaultMsg } as any,
    });

    const embed = new EmbedBuilder()
      .setTitle('🚀 Boost Log Updated')
      .setColor(COLORS.success)
      .addFields(
        { name: '📍 Channel', value: channelId ? `<#${channelId}>` : '❌ Disabled', inline: true },
        { name: '💬 Message', value: customMsg || defaultMsg, inline: false },
      )
      .setDescription(channelId
        ? 'Boost notifications will be sent to the configured channel when members boost the server.'
        : 'Boost notifications have been disabled.')
      .setTimestamp();

    await send({ embeds: [embed] });
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    const channel = i.options.getChannel('channel');
    const msg = i.options.getString('message');
    await this.handle(i.guildId!, channel?.id || null, msg, (c) => i.reply(c));
  }

  public async executePrefix(m: Message, args: string[]): Promise<void> {
    if (args[0]?.toLowerCase() === 'disable') {
      await this.handle(m.guildId!, null, null, (c) => m.reply(c));
      return;
    }
    const channel = m.mentions.channels.first();
    const msg = args.slice(1).join(' ') || null;
    await this.handle(m.guildId!, channel?.id || null, msg, (c) => m.reply(c));
  }
}
export default BoostLogCommand;
