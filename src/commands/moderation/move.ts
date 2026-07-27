// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits, VoiceChannel } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';

export class MoveCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'move',
      description: 'Move a user to a different voice channel',
      category: 'moderation',
      cooldown: 3,
      userPermissions: [PermissionFlagsBits.MoveMembers],
      botPermissions: [PermissionFlagsBits.MoveMembers],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['vcmove', 'moveto'],
      examples: ['/move @user #channel', 'p!move @user #channel'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const target = interaction.options.getUser('target');
    const channel = interaction.options.getChannel('channel');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    if (!target) {
      await interaction.reply({ content: '❌ Please provide a user to move.', ephemeral: true });
      return;
    }

    if (!channel || !channel.isVoiceBased()) {
      await interaction.reply({ content: '❌ Please provide a valid voice channel.', ephemeral: true });
      return;
    }

    if (!interaction.guild) return;

    const member = await interaction.guild.members.fetch(target.id).catch(() => null);
    if (!member) {
      await interaction.reply({ content: '❌ User not found in server.', ephemeral: true });
      return;
    }

    if (!member.voice.channel) {
      await interaction.reply({ content: '❌ User is not in a voice channel.', ephemeral: true });
      return;
    }

    if (!member.moderatable) {
      await interaction.reply({ content: '❌ I cannot move this user due to role hierarchy.', ephemeral: true });
      return;
    }

    try {
      await member.voice.setChannel(channel as VoiceChannel, reason);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.success} User Moved`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'User', value: `${target.tag} (${target.id})`, inline: true },
          { name: 'Channel', value: channel.toString(), inline: true },
          { name: 'Moderator', value: interaction.user.tag, inline: true },
          { name: 'Reason', value: reason, inline: false },
        ])
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ content: '❌ Failed to move user.', ephemeral: true });
    }
  }

  public async executePrefix(message: Message, _args: string[]): Promise<void> {
    const target = message.mentions.users.first();
    const channel = message.mentions.channels.first();
    const reason = _args.slice(2).join(' ') || 'No reason provided';

    if (!target) {
      await message.reply('❌ Please mention a user to move.');
      return;
    }

    if (!channel || !channel.isVoiceBased()) {
      await message.reply('❌ Please mention a valid voice channel.');
      return;
    }

    if (!message.guild) return;

    const member = await message.guild.members.fetch(target.id).catch(() => null);
    if (!member) {
      await message.reply('❌ User not found in server.');
      return;
    }

    if (!member.voice.channel) {
      await message.reply('❌ User is not in a voice channel.');
      return;
    }

    if (!member.moderatable) {
      await message.reply('❌ I cannot move this user due to role hierarchy.');
      return;
    }

    try {
      await member.voice.setChannel(channel as VoiceChannel, reason);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.success} User Moved`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'User', value: `${target.tag} (${target.id})`, inline: true },
          { name: 'Channel', value: channel.toString(), inline: true },
          { name: 'Moderator', value: message.author.tag, inline: true },
          { name: 'Reason', value: reason, inline: false },
        ])
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      await message.reply('❌ Failed to move user.');
    }
  }
}

export default MoveCommand;
