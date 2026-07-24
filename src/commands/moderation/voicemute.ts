import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits, VoiceState } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class VoiceMuteCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'voicemute',
      description: 'Mute a user in voice channels',
      category: 'moderation',
      cooldown: 3,
      userPermissions: [PermissionFlagsBits.MuteMembers],
      botPermissions: [PermissionFlagsBits.MuteMembers],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['vmute', 'vcmute'],
      examples: ['/voicemute @user', 'p!voicemute @user'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const target = interaction.options.getUser('target');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    if (!target) {
      await interaction.reply({ content: '❌ Please provide a user to voice mute.', ephemeral: true });
      return;
    }

    if (target.id === interaction.user.id) {
      await interaction.reply({ content: '❌ You cannot voice mute yourself.', ephemeral: true });
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
      await interaction.reply({ content: '❌ I cannot voice mute this user due to role hierarchy.', ephemeral: true });
      return;
    }

    try {
      await member.voice.setMute(true, reason);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.moderation} User Voice Muted`)
        .setColor(COLORS.warning)
        .addFields([
          { name: 'User', value: `${target.tag} (${target.id})`, inline: true },
          { name: 'Moderator', value: interaction.user.tag, inline: true },
          { name: 'Reason', value: reason, inline: false },
        ])
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ content: '❌ Failed to voice mute user.', ephemeral: true });
    }
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const target = message.mentions.users.first();
    const reason = args.slice(1).join(' ') || 'No reason provided';

    if (!target) {
      await message.reply('❌ Please mention a user to voice mute.');
      return;
    }

    if (target.id === message.author.id) {
      await message.reply('❌ You cannot voice mute yourself.');
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
      await message.reply('❌ I cannot voice mute this user due to role hierarchy.');
      return;
    }

    try {
      await member.voice.setMute(true, reason);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.moderation} User Voice Muted`)
        .setColor(COLORS.warning)
        .addFields([
          { name: 'User', value: `${target.tag} (${target.id})`, inline: true },
          { name: 'Moderator', value: message.author.tag, inline: true },
          { name: 'Reason', value: reason, inline: false },
        ])
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      await message.reply('❌ Failed to voice mute user.');
    }
  }
}

export default VoiceMuteCommand;
