// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';

export class RaidModeCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'raidmode',
      description: 'Enable or disable raid protection mode',
      category: 'moderation',
      cooldown: 3,
      userPermissions: [PermissionFlagsBits.Administrator],
      botPermissions: [PermissionFlagsBits.ManageGuild],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['lockdown', 'raidprotection'],
      examples: ['/raidmode enable', 'p!raidmode disable'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const action = interaction.options.getString('action') || 'toggle';

    if (!interaction.guild) return;

    try {
      const prisma = getPrismaClient();
      const guild = await prisma.guild.findUnique({
        where: { guildId: interaction.guild.id },
      });

      const currentRaidMode = guild?.raidMode || false;
      let newRaidMode = currentRaidMode;

      if (action === 'enable') {
        newRaidMode = true;
      } else if (action === 'disable') {
        newRaidMode = false;
      } else {
        newRaidMode = !currentRaidMode;
      }

      await prisma.guild.update({
        where: { guildId: interaction.guild.id },
        data: { raidMode: newRaidMode },
      });

      if (newRaidMode) {
        await interaction.guild.members.me?.setNickname('🔒 RAID MODE');
      } else {
        await interaction.guild.members.me?.setNickname(null);
      }

      const embed = new EmbedBuilder()
        .setTitle(`${newRaidMode ? EMOJIS.moderation : EMOJIS.success} Raid Mode ${newRaidMode ? 'Enabled' : 'Disabled'}`)
        .setColor(newRaidMode ? COLORS.error : COLORS.success)
        .addFields([
          { name: 'Status', value: newRaidMode ? '🔒 Enabled' : '🔓 Disabled', inline: true },
          { name: 'Moderator', value: interaction.user.tag, inline: true },
          { name: 'Effect', value: newRaidMode ? 'New joins will be automatically kicked' : 'Normal join behavior', inline: false },
        ])
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ content: '❌ Failed to toggle raid mode.', ephemeral: true });
    }
  }

  public async executePrefix(message: Message, _args: string[]): Promise<void> {
    const action = args[0] || 'toggle';

    if (!message.guild) return;

    try {
      const prisma = getPrismaClient();
      const guild = await prisma.guild.findUnique({
        where: { guildId: message.guild.id },
      });

      const currentRaidMode = guild?.raidMode || false;
      let newRaidMode = currentRaidMode;

      if (action === 'enable' || action === 'on') {
        newRaidMode = true;
      } else if (action === 'disable' || action === 'off') {
        newRaidMode = false;
      } else {
        newRaidMode = !currentRaidMode;
      }

      await prisma.guild.update({
        where: { guildId: message.guild.id },
        data: { raidMode: newRaidMode },
      });

      if (newRaidMode) {
        await message.guild.members.me?.setNickname('🔒 RAID MODE');
      } else {
        await message.guild.members.me?.setNickname(null);
      }

      const embed = new EmbedBuilder()
        .setTitle(`${newRaidMode ? EMOJIS.moderation : EMOJIS.success} Raid Mode ${newRaidMode ? 'Enabled' : 'Disabled'}`)
        .setColor(newRaidMode ? COLORS.error : COLORS.success)
        .addFields([
          { name: 'Status', value: newRaidMode ? '🔒 Enabled' : '🔓 Disabled', inline: true },
          { name: 'Moderator', value: message.author.tag, inline: true },
          { name: 'Effect', value: newRaidMode ? 'New joins will be automatically kicked' : 'Normal join behavior', inline: false },
        ])
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      await message.reply('❌ Failed to toggle raid mode.');
    }
  }
}

export default RaidModeCommand;
