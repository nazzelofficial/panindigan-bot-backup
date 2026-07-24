import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class UnlockCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'unlock',
      description: 'Unlock a channel to allow members to send messages',
      category: 'moderation',
      cooldown: 3,
      userPermissions: [PermissionFlagsBits.ManageChannels],
      botPermissions: [PermissionFlagsBits.ManageChannels],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['open', 'unlockdown'],
      examples: ['/unlock', 'p!unlock #general'],
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
        SendMessages: null,
      }, reason);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.success} Channel Unlocked`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Channel', value: channel.toString(), inline: true },
          { name: 'Moderator', value: interaction.user.tag, inline: true },
          { name: 'Reason', value: reason, inline: false },
        ])
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ content: '❌ Failed to unlock channel.', ephemeral: true });
    }
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const channel = message.mentions.channels.first() || message.channel;
    const reason = args.slice(1).join(' ') || 'No reason provided';

    if (!channel || !channel.isTextBased()) {
      await message.reply('❌ Please provide a valid text channel.');
      return;
    }

    try {
      await channel.permissionOverwrites.edit(message.guild!.roles.everyone, {
        SendMessages: null,
      }, reason);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.success} Channel Unlocked`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Channel', value: channel.toString(), inline: true },
          { name: 'Moderator', value: message.author.tag, inline: true },
          { name: 'Reason', value: reason, inline: false },
        ])
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      await message.reply('❌ Failed to unlock channel.');
    }
  }
}

export default UnlockCommand;
