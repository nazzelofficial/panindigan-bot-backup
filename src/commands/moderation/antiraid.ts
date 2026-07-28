// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';

export class AntiRaidCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'antiraid',
      description: 'Configure anti-raid protection settings',
      category: 'moderation',
      cooldown: 3,
      userPermissions: [PermissionFlagsBits.Administrator],
      botPermissions: [PermissionFlagsBits.ManageGuild],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['antiraidconfig', 'raidprotection'],
      examples: ['/antiraid threshold 5', 'p!antiraid enable'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const setting = interaction.options.getString('setting') || 'status';
    const value = interaction.options.getString('value') || 'toggle';

    if (!interaction.guild) return;

    const prisma = getPrismaClient();
    const guild = await prisma.guild.findUnique({
      where: { guildId: interaction.guild.id },
    });

    const antiRaidConfig = guild?.antiRaidConfig || {
      enabled: false,
      threshold: 5,
      timeWindow: 10,
      action: 'kick',
    };

    if (setting === 'enable') {
      antiRaidConfig.enabled = true;
    } else if (setting === 'disable') {
      antiRaidConfig.enabled = false;
    } else if (setting === 'threshold') {
      const threshold = parseInt(value);
      if (isNaN(threshold) || threshold < 1 || threshold > 50) {
        await interaction.reply({ content: '❌ Threshold must be between 1 and 50.', ephemeral: true });
        return;
      }
      antiRaidConfig.threshold = threshold;
    } else if (setting === 'timewindow') {
      const timeWindow = parseInt(value);
      if (isNaN(timeWindow) || timeWindow < 1 || timeWindow > 60) {
        await interaction.reply({ content: '❌ Time window must be between 1 and 60 seconds.', ephemeral: true });
        return;
      }
      antiRaidConfig.timeWindow = timeWindow;
    } else if (setting === 'action') {
      if (!['kick', 'ban', 'mute'].includes(value)) {
        await interaction.reply({ content: '❌ Action must be kick, ban, or mute.', ephemeral: true });
        return;
      }
      antiRaidConfig.action = value as 'kick' | 'ban' | 'mute';
    }

    await prisma.guild.update({
      where: { guildId: interaction.guild.id },
      data: { antiRaidConfig },
    });

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.moderation} Anti-Raid Configuration`)
      .setColor(COLORS.info)
      .addFields([
        { name: 'Enabled', value: antiRaidConfig.enabled ? '✅ Yes' : '❌ No', inline: true },
        { name: 'Threshold', value: `${antiRaidConfig.threshold} joins`, inline: true },
        { name: 'Time Window', value: `${antiRaidConfig.timeWindow}s`, inline: true },
        { name: 'Action', value: antiRaidConfig.action.toUpperCase(), inline: true },
        { name: 'Moderator', value: interaction.user.tag, inline: false },
      ])
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const setting = args[0] || 'status';
    const value = args[1] || 'toggle';

    if (!message.guild) return;

    const prisma = getPrismaClient();
    const guild = await prisma.guild.findUnique({
      where: { guildId: message.guild.id },
    });

    const antiRaidConfig = guild?.antiRaidConfig || {
      enabled: false,
      threshold: 5,
      timeWindow: 10,
      action: 'kick',
    };

    if (setting === 'enable' || setting === 'on') {
      antiRaidConfig.enabled = true;
    } else if (setting === 'disable' || setting === 'off') {
      antiRaidConfig.enabled = false;
    } else if (setting === 'threshold') {
      const threshold = parseInt(value);
      if (isNaN(threshold) || threshold < 1 || threshold > 50) {
        await message.reply('❌ Threshold must be between 1 and 50.');
        return;
      }
      antiRaidConfig.threshold = threshold;
    } else if (setting === 'timewindow') {
      const timeWindow = parseInt(value);
      if (isNaN(timeWindow) || timeWindow < 1 || timeWindow > 60) {
        await message.reply('❌ Time window must be between 1 and 60 seconds.');
        return;
      }
      antiRaidConfig.timeWindow = timeWindow;
    } else if (setting === 'action') {
      if (!['kick', 'ban', 'mute'].includes(value)) {
        await message.reply('❌ Action must be kick, ban, or mute.');
        return;
      }
      antiRaidConfig.action = value as 'kick' | 'ban' | 'mute';
    }

    await prisma.guild.update({
      where: { guildId: message.guild.id },
      data: { antiRaidConfig },
    });

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.moderation} Anti-Raid Configuration`)
      .setColor(COLORS.info)
      .addFields([
        { name: 'Enabled', value: antiRaidConfig.enabled ? '✅ Yes' : '❌ No', inline: true },
        { name: 'Threshold', value: `${antiRaidConfig.threshold} joins`, inline: true },
        { name: 'Time Window', value: `${antiRaidConfig.timeWindow}s`, inline: true },
        { name: 'Action', value: antiRaidConfig.action.toUpperCase(), inline: true },
        { name: 'Moderator', value: message.author.tag, inline: false },
      ])
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default AntiRaidCommand;
