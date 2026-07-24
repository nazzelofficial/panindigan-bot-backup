import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';
import { getRedisClient } from '../../database/redis/client';
import config from '../../../config.json';

export class SnipeCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'snipe',
      description: 'Show the last deleted message in the channel',
      category: 'info',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: [],
      examples: ['/snipe', 'p!snipe'],
    };
    super(options);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .setDMPermission(false) as SlashCommandBuilder;
  }

  private async getSnipeData(guildId: string, channelId: string): Promise<any | null> {
    try {
      const redis = getRedisClient();
      const raw = await redis.get(`${config.databases.redis.keyPrefix}snipe:${guildId}:${channelId}`);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const data = await this.getSnipeData(interaction.guildId!, interaction.channelId);
    if (!data) {
      await interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.warning).setDescription(`${EMOJIS.warning} No recently deleted messages found in this channel.`)] });
      return;
    }
    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} 🔫 Sniped Message`)
      .setColor(COLORS.error)
      .setDescription(data.content?.slice(0, 2048) || '[No text content]')
      .setFooter({ text: `Author: ${data.authorTag} • Deleted ${new Date(data.deletedAt).toLocaleTimeString()}` })
      .setTimestamp(new Date(data.deletedAt));
    if (data.authorAvatar) embed.setThumbnail(data.authorAvatar);
    if (data.attachments?.length) embed.addFields({ name: '📎 Attachments', value: data.attachments.join('\n').slice(0, 512), inline: false });
    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const data = await this.getSnipeData(message.guildId!, message.channelId);
    if (!data) {
      await message.reply({ embeds: [new EmbedBuilder().setColor(COLORS.warning).setDescription(`${EMOJIS.warning} No recently deleted messages found.`)] });
      return;
    }
    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} 🔫 Sniped Message`)
      .setColor(COLORS.error)
      .setDescription(data.content?.slice(0, 2048) || '[No text content]')
      .setFooter({ text: `Author: ${data.authorTag} • Deleted ${new Date(data.deletedAt).toLocaleTimeString()}` })
      .setTimestamp(new Date(data.deletedAt));
    if (data.authorAvatar) embed.setThumbnail(data.authorAvatar);
    await message.reply({ embeds: [embed] });
  }
}

export default SnipeCommand;
