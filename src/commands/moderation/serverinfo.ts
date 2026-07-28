// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { Formatter } from '../../utils/Formatter.js';
import { getPrismaClient } from '../../database/postgresql/client.js';

export class ServerInfoCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'modserverinfo',
      description: 'View detailed information about the server',
      category: 'moderation',
      cooldown: 5,
      userPermissions: [PermissionFlagsBits.ModerateMembers],
      botPermissions: [PermissionFlagsBits.ModerateMembers],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['guildinfo', 'server'],
      examples: ['/serverinfo', 'p!serverinfo'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    await this.showServerInfo(interaction);
  }

  public async executePrefix(message: Message): Promise<void> {
    await this.showServerInfo(message);
  }

  private async showServerInfo(interaction: ChatInputCommandInteraction | Message): Promise<void> {
    if (!interaction.guild) return;

    const guild = interaction.guild;
    const owner = await guild.fetchOwner();
    
    const prisma = getPrismaClient();
    const guildData = await prisma.guild.findUnique({
      where: { guildId: guild.id },
    });

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} Server Information`)
      .setColor(COLORS.info)
      .setThumbnail(guild.iconURL() || null)
      .addFields([
        { name: 'Name', value: guild.name, inline: true },
        { name: 'ID', value: guild.id, inline: true },
        { name: 'Owner', value: owner.user.tag, inline: true },
        { name: 'Members', value: Formatter.formatNumber(guild.memberCount), inline: true },
        { name: 'Channels', value: guild.channels.cache.size.toString(), inline: true },
        { name: 'Roles', value: guild.roles.cache.size.toString(), inline: true },
        { name: 'Created', value: Formatter.formatDate(guild.createdAt), inline: true },
        { name: 'Verification Level', value: guild.verificationLevel.toString(), inline: true },
      ])
      .setTimestamp();

    if (guildData) {
      embed.addField('Prefix', guildData.prefix, true);
      embed.addField('Language', guildData.language, true);
      embed.addField('Raid Mode', guildData.raidMode ? '🔒 Enabled' : '🔓 Disabled', true);
    }

    if (interaction instanceof ChatInputCommandInteraction) {
      await interaction.reply({ embeds: [embed] });
    } else {
      await interaction.reply({ embeds: [embed] });
    }
  }
}

export default ServerInfoCommand;
