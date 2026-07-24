import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';
import { getRedisClient } from '../../database/redis/client';
import config from '../../../config.json';

export class EditsnipeCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'editsnipe',
      description: 'Show the last edited message in the channel',
      category: 'utility',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: true,
      slashCommand: false,
      prefixCommand: true,
      aliases: ['esnipe'],
      examples: ['p!editsnipe'],
    };
    super(options);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder().setName(this.name).setDescription(this.description) as SlashCommandBuilder;
  }

  private async getEditData(guildId: string, channelId: string): Promise<any | null> {
    try {
      const redis = getRedisClient();
      const raw = await redis.get(`${config.databases.redis.keyPrefix}editsnipe:${guildId}:${channelId}`);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.reply({ content: 'Use `/editsnipe` from the info category.', ephemeral: true });
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const data = await this.getEditData(message.guildId!, message.channelId);
    if (!data) {
      await message.reply({ embeds: [new EmbedBuilder().setColor(COLORS.warning).setDescription(`${EMOJIS.warning} No recently edited messages.`)] });
      return;
    }
    const embed = new EmbedBuilder()
      .setTitle(`✏️ Edit Snipe`)
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

export default EditsnipeCommand;
