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
      category: 'utility',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: true,
      slashCommand: false, // handled by info category
      prefixCommand: true,
      aliases: [],
      examples: ['p!snipe'],
    };
    super(options);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder().setName(this.name).setDescription(this.description) as SlashCommandBuilder;
  }

  private async getSnipeData(guildId: string, channelId: string): Promise<any | null> {
    try {
      const redis = getRedisClient();
      const raw = await redis.get(`${config.databases.redis.keyPrefix}snipe:${guildId}:${channelId}`);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    // Redirect to info/snipe
    await interaction.reply({ content: 'Use `/snipe` from the info category.', ephemeral: true });
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const data = await this.getSnipeData(message.guildId!, message.channelId);
    if (!data) {
      await message.reply({ embeds: [new EmbedBuilder().setColor(COLORS.warning).setDescription(`${EMOJIS.warning} No recently deleted messages.`)] });
      return;
    }
    const embed = new EmbedBuilder()
      .setTitle(`🔫 Sniped Message`)
      .setColor(COLORS.error)
      .setDescription(data.content?.slice(0, 2048) || '[No text]')
      .setFooter({ text: `Author: ${data.authorTag} • Deleted ${new Date(data.deletedAt).toLocaleTimeString()}` })
      .setTimestamp(new Date(data.deletedAt));
    if (data.authorAvatar) embed.setThumbnail(data.authorAvatar);
    await message.reply({ embeds: [embed] });
  }
}

export default SnipeCommand;
