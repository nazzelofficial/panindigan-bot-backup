// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { getRedisClient } from '../../database/redis/client.js';

export class EditsnipeCommand extends BaseCommand {
  constructor() {
    super({
      name: 'editsnipe',
      description: 'Shows the last edited message (before and after) in this channel',
      category: 'utility',
      premiumTier: 'free',
      cooldown: 5,
      ownerOnly: false,
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['es'],
      examples: ['p!editsnipe'],
    } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .setDMPermission(false) as SlashCommandBuilder;
  }

  private async getEditSnipe(channelId: string): Promise<EmbedBuilder> {
    try {
      const redis = await getRedisClient();
      const data = await redis.hGetAll(`panindigan:editsnipe:${channelId}`);
      if (!data || !data.before) {
        return new EmbedBuilder()
          .setColor(COLORS.warning)
          .setDescription(`${EMOJIS.warning} There is no recently edited message in this channel.`);
      }
      const editedAt = data.editedAt ? new Date(data.editedAt) : new Date();
      return new EmbedBuilder()
        .setTitle(`${EMOJIS.utility} Edit Sniped Message`)
        .setColor(COLORS.default)
        .addFields(
          { name: 'Before', value: (data.before ?? 'N/A').slice(0, 1024), inline: false },
          { name: 'After', value: (data.after ?? 'N/A').slice(0, 1024), inline: false },
          { name: 'Author', value: data.author ?? 'Unknown', inline: true },
          { name: 'Edited At', value: `<t:${Math.floor(editedAt.getTime() / 1000)}:R>`, inline: true },
        )
        .setTimestamp();
    } catch (err) {
      return new EmbedBuilder().setColor(COLORS.error).setDescription(`${EMOJIS.error} Failed to retrieve edit sniped message.`);
    }
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    try {
      const embed = await this.getEditSnipe(i.channelId);
      await i.reply({ embeds: [embed] });
    } catch (err) {
      await i.reply({ embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription(`${EMOJIS.error} An error occurred.`)], ephemeral: true });
    }
  }

  public async executePrefix(m: Message, _args: string[]): Promise<void> {
    try {
      const embed = await this.getEditSnipe(m.channelId);
      await m.reply({ embeds: [embed] });
    } catch (err) {
      await m.reply({ embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription(`${EMOJIS.error} An error occurred.`)] });
    }
  }
}

export default EditsnipeCommand;
