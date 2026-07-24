import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class MuteAllCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'muteall',
      description: 'Mute all users in the current voice channel',
      category: 'moderation',
      cooldown: 10,
      userPermissions: [PermissionFlagsBits.MuteMembers],
      botPermissions: [PermissionFlagsBits.MuteMembers],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['mutemembers'],
      examples: ['/muteall', 'p!muteall'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const reason = interaction.options.getString('reason') || 'Mass mute';

    if (!interaction.member || !interaction.guild) return;

    const voiceChannel = (interaction.member as any).voice?.channel;
    if (!voiceChannel) {
      await interaction.reply({ content: '❌ You must be in a voice channel to use this command.', ephemeral: true });
      return;
    }

    const membersToMute = voiceChannel.members.filter(m => !m.user.bot && !m.voice.serverMute);

    if (membersToMute.size === 0) {
      await interaction.reply({ content: '❌ No members to mute in this channel.', ephemeral: true });
      return;
    }

    await interaction.deferReply();

    let muted = 0;
    let failed = 0;

    for (const member of membersToMute.values()) {
      try {
        await member.voice.setMute(true, reason);
        muted++;
      } catch {
        failed++;
      }
    }

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.moderation} Voice Mute Complete`)
      .setColor(COLORS.warning)
      .addFields([
        { name: 'Muted', value: muted.toString(), inline: true },
        { name: 'Failed', value: failed.toString(), inline: true },
        { name: 'Total', value: membersToMute.size.toString(), inline: true },
        { name: 'Moderator', value: interaction.user.tag, inline: false },
      ])
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const reason = args.slice(0).join(' ') || 'Mass mute';

    if (!message.member || !message.guild) return;

    const voiceChannel = (message.member as any).voice?.channel;
    if (!voiceChannel) {
      await message.reply('❌ You must be in a voice channel to use this command.');
      return;
    }

    const membersToMute = voiceChannel.members.filter(m => !m.user.bot && !m.voice.serverMute);

    if (membersToMute.size === 0) {
      await message.reply('❌ No members to mute in this channel.');
      return;
    }

    await message.reply('Starting mass voice mute...');

    let muted = 0;
    let failed = 0;

    for (const member of membersToMute.values()) {
      try {
        await member.voice.setMute(true, reason);
        muted++;
      } catch {
        failed++;
      }
    }

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.moderation} Voice Mute Complete`)
      .setColor(COLORS.warning)
      .addFields([
        { name: 'Muted', value: muted.toString(), inline: true },
        { name: 'Failed', value: failed.toString(), inline: true },
        { name: 'Total', value: membersToMute.size.toString(), inline: true },
        { name: 'Moderator', value: message.author.tag, inline: false },
      ])
      .setTimestamp();

    await message.channel.send({ embeds: [embed] });
  }
}

export default MuteAllCommand;
