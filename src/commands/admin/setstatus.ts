// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits, ActivityType } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';

export class SetStatusCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'setstatus',
      description: 'Change the bot\'s status (Owner only)',
      category: 'admin',
      cooldown: 10,
      userPermissions: [PermissionFlagsBits.Administrator],
      botPermissions: [PermissionFlagsBits.ManageGuild],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['status', 'botstatus'],
      examples: ['/setstatus Playing Minecraft', 'p!setstatus Watching YouTube'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const type = interaction.options.getString('type') || 'playing';
    const status = interaction.options.getString('status') || '';

    const validTypes = ['playing', 'watching', 'listening', 'competing', 'streaming'];
    if (!validTypes.includes(type)) {
      await interaction.reply({ content: '❌ Type must be one of: playing, watching, listening, competing, streaming', ephemeral: true });
      return;
    }

    try {
      let activityType: ActivityType;
      switch (type) {
        case 'playing':
          activityType = ActivityType.Playing;
          break;
        case 'watching':
          activityType = ActivityType.Watching;
          break;
        case 'listening':
          activityType = ActivityType.Listening;
          break;
        case 'competing':
          activityType = ActivityType.Competing;
          break;
        case 'streaming':
          activityType = ActivityType.Streaming;
          break;
        default:
          activityType = ActivityType.Playing;
      }

      await interaction.client.user.setActivity(status, { type: activityType });

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.success} Status Updated`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Type', value: type, inline: true },
          { name: 'Status', value: status || 'None', inline: true },
          { name: 'Updated by', value: interaction.user.tag, inline: false },
        ])
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ content: '❌ Failed to update status.', ephemeral: true });
    }
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const type = args[0]?.toLowerCase() || 'playing';
    const status = args.slice(1).join(' ') || '';

    const validTypes = ['playing', 'watching', 'listening', 'competing', 'streaming'];
    if (!validTypes.includes(type)) {
      await message.reply('❌ Type must be one of: playing, watching, listening, competing, streaming');
      return;
    }

    try {
      let activityType: ActivityType;
      switch (type) {
        case 'playing':
          activityType = ActivityType.Playing;
          break;
        case 'watching':
          activityType = ActivityType.Watching;
          break;
        case 'listening':
          activityType = ActivityType.Listening;
          break;
        case 'competing':
          activityType = ActivityType.Competing;
          break;
        case 'streaming':
          activityType = ActivityType.Streaming;
          break;
        default:
          activityType = ActivityType.Playing;
      }

      await message.client.user.setActivity(status, { type: activityType });

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.success} Status Updated`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Type', value: type, inline: true },
          { name: 'Status', value: status || 'None', inline: true },
          { name: 'Updated by', value: message.author.tag, inline: false },
        ])
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      await message.reply('❌ Failed to update status.');
    }
  }
}

export default SetStatusCommand;
