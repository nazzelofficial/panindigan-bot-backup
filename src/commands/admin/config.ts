import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';
import { getPrismaClient } from '../../database/postgresql/client';

export class ConfigCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'config',
      description: 'View and modify server configuration',
      category: 'admin',
      cooldown: 5,
      userPermissions: [PermissionFlagsBits.Administrator],
      botPermissions: [PermissionFlagsBits.ManageGuild],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['settings', 'configure'],
      examples: ['/config', 'p!config'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    await this.showConfig(interaction);
  }

  public async executePrefix(message: Message): Promise<void> {
    await this.showConfig(message);
  }

  private async showConfig(interaction: ChatInputCommandInteraction | Message): Promise<void> {
    if (!interaction.guild) return;

    const prisma = getPrismaClient();
    const guild = await prisma.guild.findUnique({
      where: { guildId: interaction.guild.id },
    });

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.settings} Server Configuration`)
      .setDescription('Current server settings for Panindigan')
      .setColor(COLORS.info)
      .addFields([
        { name: 'Prefix', value: guild?.prefix || 'p!', inline: true },
        { name: 'Language', value: guild?.language || 'en', inline: true },
        { name: 'Welcome Channel', value: guild?.welcomeChannelId ? `<#${guild.welcomeChannelId}>` : 'None', inline: true },
        { name: 'Auto Role', value: guild?.autoRoleId ? `<@&${guild.autoRoleId}>` : 'None', inline: true },
        { name: 'Goodbye Channel', value: guild?.goodbyeChannelId ? `<#${guild.goodbyeChannelId}>` : 'None', inline: true },
        { name: 'Mod Log Channel', value: guild?.modLogChannelId ? `<#${guild.modLogChannelId}>` : 'None', inline: true },
        { name: 'Level Lock', value: guild?.levelLock ? `Level ${guild.levelLock}+` : 'Disabled', inline: true },
        { name: 'Raid Mode', value: guild?.raidMode ? '🔒 Enabled' : '🔓 Disabled', inline: true },
      ])
      .setTimestamp();

    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('config_prefix')
          .setLabel('Change Prefix')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('config_language')
          .setLabel('Change Language')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('config_welcome')
          .setLabel('Welcome Settings')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('config_autorole')
          .setLabel('Auto Role Settings')
          .setStyle(ButtonStyle.Secondary),
      );

    if (interaction instanceof ChatInputCommandInteraction) {
      await interaction.reply({ embeds: [embed], components: [row] });
    } else {
      await interaction.reply({ embeds: [embed], components: [row] });
    }
  }
}

export default ConfigCommand;
