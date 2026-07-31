// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, SlashCommandBuilder, PermissionFlagsBits, TextChannel, EmbedBuilder } from 'discord.js';
import { DashboardUI } from '../../structures/DashboardUI.js';
import { SuccessHandler } from '../../handlers/SuccessHandler.js';
import { ErrorHandler } from '../../handlers/ErrorHandler.js';
import { getPrismaClient } from '../../database/postgresql/client.js';
import { COLORS } from '../../constants/DesignSystem.js';

export class StarboardCommand extends BaseCommand {
  constructor() {
    super({ name: 'starboard', description: 'Configure the starboard system', category: 'starboard', premiumTier: 'free', cooldown: 5, guildOnly: true, slashCommand: true, prefixCommand: true, userPermissions: [PermissionFlagsBits.ManageGuild], aliases: ['star', 'sb'], examples: ['/starboard setup #channel', '/starboard threshold 5', '/starboard emoji ⭐', '/starboard lock', '/starboard info'] } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder().setName(this.name).setDescription(this.description)
      .addSubcommand(s => s.setName('setup').setDescription('Set the starboard channel').addChannelOption(o => o.setName('channel').setDescription('Starboard channel').setRequired(true)))
      .addSubcommand(s => s.setName('threshold').setDescription('Set minimum stars').addIntegerOption(o => o.setName('amount').setDescription('Stars needed').setRequired(true).setMinValue(1).setMaxValue(50)))
      .addSubcommand(s => s.setName('emoji').setDescription('Set the star emoji').addStringOption(o => o.setName('emoji').setDescription('Emoji to use').setRequired(true)))
      .addSubcommand(s => s.setName('lock').setDescription('Lock/unlock the starboard'))
      .addSubcommand(s => s.setName('disable').setDescription('Disable the starboard'))
      .addSubcommand(s => s.setName('info').setDescription('View starboard settings'))
      .addSubcommand(s => s.setName('stats').setDescription('View starboard statistics'))
      .addSubcommand(s => s.setName('leaderboard').setDescription('View top starred messages'))
      .addSubcommand(s => s.setName('random').setDescription('View a random starred message'))
      .addSubcommand(s => s.setName('ignore').setDescription('Ignore a channel')
        .addChannelOption(o => o.setName('channel').setDescription('Channel to ignore').setRequired(true)))
      .addSubcommand(s => s.setName('unignore').setDescription('Unignore a channel')
        .addChannelOption(o => o.setName('channel').setDescription('Channel to unignore').setRequired(true)))
      .addSubcommand(s => s.setName('reset').setDescription('Reset starboard data'))
      .addSubcommand(s => s.setName('unlock').setDescription('Unlock starboard'))
      .setDMPermission(false)) as SlashCommandBuilder;
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    const sub = i.options.getSubcommand();
    const prisma = getPrismaClient();
    await i.deferReply({ ephemeral: true });

    if (sub === 'setup') {
      const ch = i.options.getChannel('channel', true) as TextChannel;
      await prisma.guild.upsert({ where: { guildId: i.guildId! }, create: { guildId: i.guildId!, starboardChannelId: ch.id }, update: { starboardChannelId: ch.id } });
      await SuccessHandler.configuration(i, 'Starboard Channel', `<#${ch.id}>`);
    } else if (sub === 'threshold') {
      const amount = i.options.getInteger('amount', true);
      await prisma.guild.upsert({ where: { guildId: i.guildId! }, create: { guildId: i.guildId!, starboardThreshold: amount }, update: { starboardThreshold: amount } });
      await SuccessHandler.configuration(i, 'Starboard Threshold', `${amount} stars`);
    } else if (sub === 'emoji') {
      const emoji = i.options.getString('emoji', true);
      await prisma.guild.upsert({ where: { guildId: i.guildId! }, create: { guildId: i.guildId!, starboardEmoji: emoji }, update: { starboardEmoji: emoji } });
      await SuccessHandler.configuration(i, 'Starboard Emoji', emoji);
    } else if (sub === 'lock') {
      const guild = await prisma.guild.upsert({ where: { guildId: i.guildId! }, create: { guildId: i.guildId! }, update: {} });
      const locked = !(guild as any).starboardLocked;
      await prisma.guild.update({ where: { guildId: i.guildId! }, data: { starboardLocked: locked } });
      await SuccessHandler.configuration(i, 'Starboard Lock', locked ? 'Locked' : 'Unlocked');
    } else if (sub === 'disable') {
      await prisma.guild.upsert({ where: { guildId: i.guildId! }, create: { guildId: i.guildId! }, update: { starboardChannelId: null } });
      await SuccessHandler.configuration(i, 'Starboard', 'Disabled');
    } else if (sub === 'info') {
      const guild = await prisma.guild.findUnique({ where: { guildId: i.guildId! } });
      const embed = DashboardUI.createSettings('Starboard Settings', {
        prefix: '',
        language: '',
        welcomeChannel: guild?.starboardChannelId ? `<#${guild.starboardChannelId}>` : undefined,
        goodbyeChannel: undefined,
        logChannel: undefined,
        musicChannel: undefined,
        levelUpChannel: undefined,
      });
      embed.addFields(
        { name: 'Emoji', value: (guild as any)?.starboardEmoji || '⭐', inline: true },
        { name: 'Threshold', value: `${guild?.starboardThreshold || 3} stars`, inline: true },
        { name: 'Status', value: (guild as any)?.starboardLocked ? '🔒 Locked' : '✅ Active', inline: true },
      );
      await i.editReply({ embeds: [embed] });
    } else if (sub === 'stats') {
      await this.handleStats(i);
    } else if (sub === 'leaderboard') {
      await this.handleLeaderboard(i);
    } else if (sub === 'random') {
      await this.handleRandom(i);
    } else if (sub === 'ignore') {
      await this.handleIgnore(i);
    } else if (sub === 'unignore') {
      await this.handleUnignore(i);
    } else if (sub === 'reset') {
      await this.handleReset(i);
    } else if (sub === 'unlock') {
      await this.handleUnlock(i);
    }
  }

  private async handleStats(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply({ ephemeral: true });
    const prisma = getPrismaClient();
    
    try {
      const guild = await prisma.guild.findUnique({ where: { guildId: i.guildId! } });
      const starredMessages = await prisma.starboardMessage.count({ where: { guildId: i.guildId! } });
      const ignoredChannels = await prisma.starboardIgnoredChannel.count({ where: { guildId: i.guildId! } });

      const embed = new EmbedBuilder()
        .setTitle('📊 Starboard Statistics')
        .setColor(COLORS.info)
        .addFields(
          { name: '🌟 Starred Messages', value: `${starredMessages}`, inline: true },
          { name: '🚫 Ignored Channels', value: `${ignoredChannels}`, inline: true },
          { name: '⭐ Threshold', value: `${guild?.starboardThreshold || 3}`, inline: true },
          { name: '🔒 Status', value: (guild as any)?.starboardLocked ? 'Locked' : 'Active', inline: true },
        )
        .setTimestamp();
      await i.editReply({ embeds: [embed] });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleLeaderboard(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply({ ephemeral: true });
    const prisma = getPrismaClient();
    
    try {
      const topMessages = await prisma.starboardMessage.findMany({
        where: { guildId: i.guildId! },
        orderBy: { stars: 'desc' },
        take: 10,
      });

      const embed = new EmbedBuilder()
        .setTitle('🏆 Starboard Leaderboard')
        .setColor(COLORS.success)
        .setDescription(topMessages.length > 0 
          ? topMessages.map((m, i) => `${i + 1}. ⭐ ${m.stars} stars - [Message](${m.originalMessageUrl})`).join('\n')
          : 'No starred messages yet')
        .setTimestamp();
      await i.editReply({ embeds: [embed] });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleRandom(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply({ ephemeral: true });
    const prisma = getPrismaClient();
    
    try {
      const messages = await prisma.starboardMessage.findMany({ where: { guildId: i.guildId! } });
      if (messages.length === 0) {
        await ErrorHandler.generic(i, new Error('No starred messages found'));
        return;
      }

      const random = messages[Math.floor(Math.random() * messages.length)];
      const embed = new EmbedBuilder()
        .setTitle('🎲 Random Starred Message')
        .setColor(COLORS.info)
        .setDescription(`⭐ ${random.stars} stars`)
        .addFields(
          { name: '🔗 Original', value: `[Jump to message](${random.originalMessageUrl})`, inline: true },
        )
        .setTimestamp();
      await i.editReply({ embeds: [embed] });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleIgnore(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply({ ephemeral: true });
    const ch = i.options.getChannel('channel', true);
    const prisma = getPrismaClient();
    
    try {
      await prisma.starboardIgnoredChannel.upsert({
        where: { channelId: ch.id },
        create: { channelId: ch.id, guildId: i.guildId! },
        update: {},
      });
      await SuccessHandler.command(i, 'ignore', `Ignored channel ${ch.name}`);
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleUnignore(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply({ ephemeral: true });
    const ch = i.options.getChannel('channel', true);
    const prisma = getPrismaClient();
    
    try {
      await prisma.starboardIgnoredChannel.delete({ where: { channelId: ch.id } });
      await SuccessHandler.command(i, 'unignore', `Unignored channel ${ch.name}`);
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleReset(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply({ ephemeral: true });
    const prisma = getPrismaClient();
    
    try {
      const deleted = await prisma.starboardMessage.deleteMany({ where: { guildId: i.guildId! } });
      await SuccessHandler.command(i, 'reset', `Reset ${deleted.count} starred messages`);
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleUnlock(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply({ ephemeral: true });
    const prisma = getPrismaClient();
    
    try {
      await prisma.guild.update({ 
        where: { guildId: i.guildId! },
        data: { starboardLocked: false },
      });
      await SuccessHandler.command(i, 'unlock', 'Starboard unlocked');
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  public async executePrefix(m: Message, _args: string[]): Promise<void> {
    await m.reply('Please use `/starboard` for this command.');
  }
}
export default StarboardCommand;
