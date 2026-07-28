// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { Formatter } from '../../utils/Formatter.js';

export class ChannelInfoCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'channelinfo',
      description: 'View detailed information about a channel',
      category: 'moderation',
      cooldown: 3,
      userPermissions: [PermissionFlagsBits.ManageChannels],
      botPermissions: [PermissionFlagsBits.ManageChannels],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['channel', 'cinfo'],
      examples: ['/channelinfo #general', 'p!channelinfo #general'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const channel = interaction.options.getChannel('target') || interaction.channel;

    if (!channel || !interaction.guild) return;

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} Channel Information`)
      .setColor(COLORS.info)
      .addFields([
        { name: 'Name', value: channel.name, inline: true },
        { name: 'ID', value: channel.id, inline: true },
        { name: 'Type', value: channel.type.toString(), inline: true },
        { name: 'Created', value: Formatter.formatDate(channel.createdAt), inline: true },
      ])
      .setTimestamp();

    if (channel.isTextBased()) {
      const topic = (channel as any).topic || 'No topic';
      embed.addFields({ name: 'Topic', value: topic.substring(0, 1024), inline: false });
      embed.addFields({ name: 'NSFW', value: (channel as any).nsfw ? 'Yes' : 'No', inline: true });
    }

    if (channel.isVoiceBased()) {
      embed.addFields({ name: 'Bitrate', value: `${(channel as any).bitrate}bps`, inline: true });
      embed.addFields({ name: 'User Limit', value: (channel as any).userLimit ? (channel as any).userLimit.toString() : 'Unlimited', inline: true });
    }

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message, _args: string[]): Promise<void> {
    const channel = message.mentions.channels.first() || message.channel;

    if (!channel || !message.guild) return;

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} Channel Information`)
      .setColor(COLORS.info)
      .addFields([
        { name: 'Name', value: channel.name, inline: true },
        { name: 'ID', value: channel.id, inline: true },
        { name: 'Type', value: channel.type.toString(), inline: true },
        { name: 'Created', value: Formatter.formatDate(channel.createdAt), inline: true },
      ])
      .setTimestamp();

    if (channel.isTextBased()) {
      const topic = (channel as any).topic || 'No topic';
      embed.addFields({ name: 'Topic', value: topic.substring(0, 1024), inline: false });
      embed.addFields({ name: 'NSFW', value: (channel as any).nsfw ? 'Yes' : 'No', inline: true });
    }

    if (channel.isVoiceBased()) {
      embed.addFields({ name: 'Bitrate', value: `${(channel as any).bitrate}bps`, inline: true });
      embed.addFields({ name: 'User Limit', value: (channel as any).userLimit ? (channel as any).userLimit.toString() : 'Unlimited', inline: true });
    }

    await message.reply({ embeds: [embed] });
  }
}

export default ChannelInfoCommand;
