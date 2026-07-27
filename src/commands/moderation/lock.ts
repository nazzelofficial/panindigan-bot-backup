// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits, ChannelType } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';

export class LockCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'lock',
      description: 'Lock a channel to prevent members from sending messages',
      category: 'moderation',
      cooldown: 3,
      userPermissions: [PermissionFlagsBits.ManageChannels],
      botPermissions: [PermissionFlagsBits.ManageChannels],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['close', 'lockdown'],
      examples: ['/lock', 'p!lock #general'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const channel = interaction.options.getChannel('channel') || interaction.channel;
    const reason = interaction.options.getString('reason') || 'No reason provided';

    if (!channel || !channel.isTextBased()) {
      await interaction.reply({ content: '❌ Please provide a valid text channel.', ephemeral: true });
      return;
    }

    try {
      await channel.permissionOverwrites.edit(interaction.guild!.roles.everyone, {
        SendMessages: false,
      }, reason);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.moderation} Channel Locked`)
        .setColor(COLORS.warning)
        .addFields([
          { name: 'Channel', value: channel.toString(), inline: true },
          { name: 'Moderator', value: interaction.user.tag, inline: true },
          { name: 'Reason', value: reason, inline: false },
        ])
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ content: '❌ Failed to lock channel.', ephemeral: true });
    }
  }

  public async executePrefix(message: Message, _args: string[]): Promise<void> {
    const channel = message.mentions.channels.first() || message.channel;
    const reason = _args.slice(1).join(' ') || 'No reason provided';

    if (!channel || !channel.isTextBased()) {
      await message.reply('❌ Please provide a valid text channel.');
      return;
    }

    try {
      await channel.permissionOverwrites.edit(message.guild!.roles.everyone, {
        SendMessages: false,
      }, reason);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.moderation} Channel Locked`)
        .setColor(COLORS.warning)
        .addFields([
          { name: 'Channel', value: channel.toString(), inline: true },
          { name: 'Moderator', value: message.author.tag, inline: true },
          { name: 'Reason', value: reason, inline: false },
        ])
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      await message.reply('❌ Failed to lock channel.');
    }
  }
}

export default LockCommand;
