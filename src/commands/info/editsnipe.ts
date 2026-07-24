import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';
import { getRedisClient } from '../../database/redis/client';
import config from '../../../config.json';

export class EditSnipeCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'editsnipe',
      description: 'Show the last edited message in the channel',
      category: 'info',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['esnipe'],
      examples: ['/editsnipe', 'p!editsnipe'],
    };
    super(options);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .setDMPermission(false) as SlashCommandBuilder;
  }

  private async getEditSnipeData(guildId: string, channelId: string): Promise<any | null> {
    try {
      const redis = getRedisClient();
      const raw = await redis.get(`${config.databases.redis.keyPrefix}editsnipe:${guildId}:${channelId}`);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const data = await this.getEditSnipeData(interaction.guildId!, interaction.channelId);
    if (!data) {
      await interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.warning).setDescription(`${EMOJIS.warning} No recently edited messages found in this channel.`)] });
      return;
    }
    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} ✏️ Edit Snipe`)
      .setColor(COLORS.warning)
      .addFields(
        { name: '📝 Before', value: data.oldContent?.slice(0, 1024) || '[No text]', inline: false },
        { name: '✏️ After', value: data.newContent?.slice(0, 1024) || '[No text]', inline: false },
        { name: '🔗 Jump', value: data.messageUrl ? `[Click here](${data.messageUrl})` : 'N/A', inline: true }
      )
      .setFooter({ text: `Author: ${data.authorTag} • Edited ${new Date(data.editedAt).toLocaleTimeString()}` })
      .setTimestamp(new Date(data.editedAt));
    if (data.authorAvatar) embed.setThumbnail(data.authorAvatar);
    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const data = await this.getEditSnipeData(message.guildId!, message.channelId);
    if (!data) {
      await message.reply({ embeds: [new EmbedBuilder().setColor(COLORS.warning).setDescription(`${EMOJIS.warning} No recently edited messages found.`)] });
      return;
    }
    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} ✏️ Edit Snipe`)
      .setColor(COLORS.warning)
      .addFields(
        { name: '📝 Before', value: data.oldContent?.slice(0, 1024) || '[No text]', inline: false },
        { name: '✏️ After', value: data.newContent?.slice(0, 1024) || '[No text]', inline: false },
      )
      .setFooter({ text: `Author: ${data.authorTag} • Edited ${new Date(data.editedAt).toLocaleTimeString()}` })
      .setTimestamp(new Date(data.editedAt));
    if (data.authorAvatar) embed.setThumbnail(data.authorAvatar);
    await message.reply({ embeds: [embed] });
  }
}

export default EditSnipeCommand;
