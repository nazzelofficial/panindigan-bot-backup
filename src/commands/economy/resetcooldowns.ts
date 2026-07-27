// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { getRedisClient } from '../../database/redis/client.js';

export class ResetCooldownsCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'resetcooldowns',
      description: 'Reset cooldowns for a user (Admin)',
      category: 'economy',
      cooldown: 5,
      userPermissions: [PermissionFlagsBits.Administrator],
      botPermissions: [],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['clearcooldowns', 'resetcd'],
      examples: ['/resetcooldowns @user', 'p!resetcooldowns @user'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const targetUser = interaction.options.getUser('user');

    if (!targetUser) {
      await interaction.reply({ content: '❌ Please provide a user.', ephemeral: true });
      return;
    }

    if (!interaction.guildId) return;

    try {
      const redis = getRedisClient();

      const pattern = `cooldown:${interaction.guildId}:${targetUser.id}:*`;
      const keys = await redis.keys(pattern);

      if (keys.length > 0) {
        await redis.del(...keys);
      }

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.economy} Cooldowns Reset`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'User', value: targetUser.tag, inline: true },
          { name: 'Cooldowns Cleared', value: keys.length.toString(), inline: true },
        ])
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ content: '❌ Failed to reset cooldowns.', ephemeral: true });
    }
  }

  public async executePrefix(message: Message, _args: string[]): Promise<void> {
    const targetUser = message.mentions.users.first();

    if (!targetUser) {
      await message.reply('❌ Please provide a user.');
      return;
    }

    if (!message.guildId) return;

    try {
      const redis = getRedisClient();

      const pattern = `cooldown:${message.guildId}:${targetUser.id}:*`;
      const keys = await redis.keys(pattern);

      if (keys.length > 0) {
        await redis.del(...keys);
      }

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.economy} Cooldowns Reset`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'User', value: targetUser.tag, inline: true },
          { name: 'Cooldowns Cleared', value: keys.length.toString(), inline: true },
        ])
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      await message.reply('❌ Failed to reset cooldowns.');
    }
  }
}

export default ResetCooldownsCommand;
