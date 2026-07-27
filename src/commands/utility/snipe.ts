// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { getRedisClient } from '../../database/redis/client.js';

export class SnipeCommand extends BaseCommand {
  constructor() {
    super({
      name: 'snipe',
      description: 'Shows the last deleted message in this channel',
      category: 'utility',
      premiumTier: 'free',
      cooldown: 5,
      ownerOnly: false,
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: [],
      examples: ['p!snipe'],
    } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .setDMPermission(false) as SlashCommandBuilder;
  }

  private async getSnipe(channelId: string): Promise<EmbedBuilder> {
    try {
      const redis = await getRedisClient();
      const data = await redis.hGetAll(`panindigan:snipe:${channelId}`);
      if (!data || !data.content) {
        return new EmbedBuilder()
          .setColor(COLORS.warning)
          .setDescription(`${EMOJIS.warning} There is no recently deleted message in this channel.`);
      }
      const deletedAt = data.deletedAt ? new Date(data.deletedAt) : new Date();
      return new EmbedBuilder()
        .setTitle(`${EMOJIS.utility} Sniped Message`)
        .setColor(COLORS.default)
        .setDescription(data.content.slice(0, 4000))
        .addFields(
          { name: 'Author', value: data.author ?? 'Unknown', inline: true },
          { name: 'Deleted At', value: `<t:${Math.floor(deletedAt.getTime() / 1000)}:R>`, inline: true },
        )
        .setTimestamp();
    } catch (err) {
      return new EmbedBuilder().setColor(COLORS.error).setDescription(`${EMOJIS.error} Failed to retrieve sniped message.`);
    }
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    try {
      const embed = await this.getSnipe(i.channelId);
      await i.reply({ embeds: [embed] });
    } catch (err) {
      await i.reply({ embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription(`${EMOJIS.error} An error occurred.`)], ephemeral: true });
    }
  }

  public async executePrefix(m: Message, _args: string[]): Promise<void> {
    try {
      const embed = await this.getSnipe(m.channelId);
      await m.reply({ embeds: [embed] });
    } catch (err) {
      await m.reply({ embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription(`${EMOJIS.error} An error occurred.`)] });
    }
  }
}

export default SnipeCommand;
