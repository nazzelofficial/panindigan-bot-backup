import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, ChannelType } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';
import { Formatter } from '../../utils/Formatter';

export class ChannelsCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'channels',
      description: 'List all channels in the server',
      category: 'info',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['listchannels', 'allchannels'],
      examples: ['/channels', 'p!channels'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const guild = interaction.guild!;
    
    const textChannels = guild.channels.cache.filter(c => c.type === ChannelType.GuildText).size;
    const voiceChannels = guild.channels.cache.filter(c => c.type === ChannelType.GuildVoice).size;
    const categoryChannels = guild.channels.cache.filter(c => c.type === ChannelType.GuildCategory).size;
    const announcementChannels = guild.channels.cache.filter(c => c.type === ChannelType.GuildAnnouncement).size;

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} Server Channels`)
      .setColor(COLORS.info)
      .addFields([
        { name: 'Text Channels', value: Formatter.formatNumber(textChannels), inline: true },
        { name: 'Voice Channels', value: Formatter.formatNumber(voiceChannels), inline: true },
        { name: 'Categories', value: Formatter.formatNumber(categoryChannels), inline: true },
        { name: 'Announcement Channels', value: Formatter.formatNumber(announcementChannels), inline: true },
        { name: 'Total Channels', value: Formatter.formatNumber(guild.channels.cache.size), inline: true },
      ])
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const guild = message.guild!;
    
    const textChannels = guild.channels.cache.filter(c => c.type === ChannelType.GuildText).size;
    const voiceChannels = guild.channels.cache.filter(c => c.type === ChannelType.GuildVoice).size;
    const categoryChannels = guild.channels.cache.filter(c => c.type === ChannelType.GuildCategory).size;
    const announcementChannels = guild.channels.cache.filter(c => c.type === ChannelType.GuildAnnouncement).size;

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} Server Channels`)
      .setColor(COLORS.info)
      .addFields([
        { name: 'Text Channels', value: Formatter.formatNumber(textChannels), inline: true },
        { name: 'Voice Channels', value: Formatter.formatNumber(voiceChannels), inline: true },
        { name: 'Categories', value: Formatter.formatNumber(categoryChannels), inline: true },
        { name: 'Announcement Channels', value: Formatter.formatNumber(announcementChannels), inline: true },
        { name: 'Total Channels', value: Formatter.formatNumber(guild.channels.cache.size), inline: true },
      ])
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default ChannelsCommand;
