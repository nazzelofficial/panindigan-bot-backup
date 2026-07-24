import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits, ChannelType } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class NukeCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'nuke',
      description: 'Delete and recreate a channel (clears all messages)',
      category: 'moderation',
      cooldown: 30,
      userPermissions: [PermissionFlagsBits.ManageChannels],
      botPermissions: [PermissionFlagsBits.ManageChannels],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['recreate', 'rebuild'],
      examples: ['/nuke', 'p!nuke'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.channel || !interaction.channel.isTextBased()) return;

    if (!interaction.guild) return;

    try {
      await interaction.deferReply();

      const channel = interaction.channel;
      const channelData = {
        name: channel.name,
        type: channel.type,
        position: channel.position,
        topic: (channel as any).topic,
        nsfw: (channel as any).nsfw,
        rateLimitPerUser: (channel as any).rateLimitPerUser,
        parent: (channel as any).parent,
        permissionOverwrites: channel.permissionOverwrites.cache,
      };

      await channel.delete('Nuked by ' + interaction.user.tag);

      const newChannel = await interaction.guild.channels.create({
        name: channelData.name,
        type: channelData.type as ChannelType,
        position: channelData.position,
        topic: channelData.topic,
        nsfw: channelData.nsfw,
        rateLimitPerUser: channelData.rateLimitPerUser,
        parent: channelData.parent,
        permissionOverwrites: channelData.permissionOverwrites,
        reason: 'Nuked by ' + interaction.user.tag,
      });

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.moderation} Channel Nuked`)
        .setColor(COLORS.error)
        .setDescription('This channel has been nuked and recreated.')
        .addFields([
          { name: 'Nuked by', value: interaction.user.tag, inline: true },
        ])
        .setTimestamp();

      await newChannel.send({ embeds: [embed] });

      await interaction.editReply({ content: '✅ Channel nuked successfully.' });
    } catch (error) {
      await interaction.editReply({ content: '❌ Failed to nuke channel.' });
    }
  }

  public async executePrefix(message: Message): Promise<void> {
    if (!message.channel || !message.channel.isTextBased()) return;

    if (!message.guild) return;

    try {
      await message.reply('Nuking channel...');

      const channel = message.channel;
      const channelData = {
        name: channel.name,
        type: channel.type,
        position: channel.position,
        topic: (channel as any).topic,
        nsfw: (channel as any).nsfw,
        rateLimitPerUser: (channel as any).rateLimitPerUser,
        parent: (channel as any).parent,
        permissionOverwrites: channel.permissionOverwrites.cache,
      };

      await channel.delete('Nuked by ' + message.author.tag);

      const newChannel = await message.guild.channels.create({
        name: channelData.name,
        type: channelData.type as ChannelType,
        position: channelData.position,
        topic: channelData.topic,
        nsfw: channelData.nsfw,
        rateLimitPerUser: channelData.rateLimitPerUser,
        parent: channelData.parent,
        permissionOverwrites: channelData.permissionOverwrites,
        reason: 'Nuked by ' + message.author.tag,
      });

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.moderation} Channel Nuked`)
        .setColor(COLORS.error)
        .setDescription('This channel has been nuked and recreated.')
        .addFields([
          { name: 'Nuked by', value: message.author.tag, inline: true },
        ])
        .setTimestamp();

      await newChannel.send({ embeds: [embed] });
    } catch (error) {
      await message.reply('❌ Failed to nuke channel.');
    }
  }
}

export default NukeCommand;
