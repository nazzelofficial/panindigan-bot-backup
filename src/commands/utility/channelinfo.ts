import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, ChannelType } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';
import { Formatter } from '../../utils/Formatter';

export class ChannelInfoCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'channelinfo',
      description: 'Display information about a channel',
      category: 'utility',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['channel', 'ci'],
      examples: ['/channelinfo', '/channelinfo #general', 'p!channelinfo #general'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const channel = interaction.options.getChannel('channel') || interaction.channel;

    if (!channel || !('guild' in channel)) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('This command can only be used in server channels.')
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed] });
      return;
    }

    const guildChannel = channel;
    const channelType = this.getChannelType(guildChannel.type);
    const createdAt = guildChannel.createdAt.toLocaleString();
    const topic = 'topic' in guildChannel && guildChannel.topic ? guildChannel.topic : 'None';
    const nsfw = 'nsfw' in guildChannel && guildChannel.nsfw ? 'Yes' : 'No';

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} ${guildChannel.name} Information`)
      .setColor(COLORS.info)
      .addFields([
        { name: 'Name', value: guildChannel.name, inline: true },
        { name: 'Type', value: channelType, inline: true },
        { name: 'ID', value: guildChannel.id, inline: true },
        { name: 'Created', value: createdAt, inline: true },
        { name: 'NSFW', value: nsfw, inline: true },
        { name: 'Topic', value: topic || 'None', inline: false },
      ])
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const channel = message.mentions.channels.first() || message.channel;

    if (!channel || !('guild' in channel)) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('This command can only be used in server channels.')
        .setTimestamp();

      await message.reply({ embeds: [errorEmbed] });
      return;
    }

    const guildChannel = channel;
    const channelType = this.getChannelType(guildChannel.type);
    const createdAt = guildChannel.createdAt.toLocaleString();
    const topic = 'topic' in guildChannel && guildChannel.topic ? guildChannel.topic : 'None';
    const nsfw = 'nsfw' in guildChannel && guildChannel.nsfw ? 'Yes' : 'No';

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} ${guildChannel.name} Information`)
      .setColor(COLORS.info)
      .addFields([
        { name: 'Name', value: guildChannel.name, inline: true },
        { name: 'Type', value: channelType, inline: true },
        { name: 'ID', value: guildChannel.id, inline: true },
        { name: 'Created', value: createdAt, inline: true },
        { name: 'NSFW', value: nsfw, inline: true },
        { name: 'Topic', value: topic || 'None', inline: false },
      ])
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }

  private getChannelType(type: ChannelType): string {
    const types: Record<ChannelType, string> = {
      [ChannelType.GuildText]: 'Text',
      [ChannelType.GuildVoice]: 'Voice',
      [ChannelType.GuildCategory]: 'Category',
      [ChannelType.GuildAnnouncement]: 'Announcement',
      [ChannelType.GuildStageVoice]: 'Stage',
      [ChannelType.GuildForum]: 'Forum',
      [ChannelType.GuildMedia]: 'Media',
      [ChannelType.PrivateThread]: 'Private Thread',
      [ChannelType.PublicThread]: 'Public Thread',
      [ChannelType.DM]: 'DM',
      [ChannelType.GroupDM]: 'Group DM',
      [ChannelType.GuildDirectory]: 'Directory',
    };
    return types[type] || 'Unknown';
  }
}

export default ChannelInfoCommand;
