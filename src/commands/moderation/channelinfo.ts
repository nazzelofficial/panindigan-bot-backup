import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';
import { Formatter } from '../../utils/Formatter';

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
      embed.addField('Topic', topic.substring(0, 1024), false);
      embed.addField('NSFW', (channel as any).nsfw ? 'Yes' : 'No', true);
    }

    if (channel.isVoiceBased()) {
      embed.addField('Bitrate', `${(channel as any).bitrate}bps`, true);
      embed.addField('User Limit', (channel as any).userLimit ? (channel as any).userLimit.toString() : 'Unlimited', true);
    }

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
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
      embed.addField('Topic', topic.substring(0, 1024), false);
      embed.addField('NSFW', (channel as any).nsfw ? 'Yes' : 'No', true);
    }

    if (channel.isVoiceBased()) {
      embed.addField('Bitrate', `${(channel as any).bitrate}bps`, true);
      embed.addField('User Limit', (channel as any).userLimit ? (channel as any).userLimit.toString() : 'Unlimited', true);
    }

    await message.reply({ embeds: [embed] });
  }
}

export default ChannelInfoCommand;
