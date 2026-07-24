import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class InviteToPlaylistCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'invitetoplaylist',
      description: 'Invite a user to collaborate on a playlist',
      category: 'music',
      cooldown: 5,
      userPermissions: [PermissionFlagsBits.Connect],
      botPermissions: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['invitepl', 'collaborate'],
      examples: ['/invitetoplaylist @user', 'p!invitetoplaylist @user'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const user = interaction.options.getUser('user');
    const playlistName = interaction.options.getString('playlist');

    if (!user) {
      await interaction.reply({ content: '❌ Please provide a user to invite.', ephemeral: true });
      return;
    }

    if (!playlistName) {
      await interaction.reply({ content: '❌ Please provide a playlist name.', ephemeral: true });
      return;
    }

    if (!interaction.guildId) return;

    try {
      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.music} Playlist Invitation`)
        .setColor(COLORS.info)
        .addFields([
          { name: 'Invited by', value: interaction.user.tag, inline: true },
          { name: 'Playlist', value: playlistName, inline: true },
          { name: 'Invited user', value: user.tag, inline: true },
        ])
        .setDescription(`${user.toString()} has been invited to collaborate on playlist "${playlistName}"`)
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ content: '❌ Failed to send invitation.', ephemeral: true });
    }
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const userMention = args[0];
    const playlistName = args.slice(1).join(' ');

    if (!userMention || !playlistName) {
      await message.reply('❌ Please provide a user and playlist name.');
      return;
    }

    try {
      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.music} Playlist Invitation`)
        .setColor(COLORS.info)
        .addFields([
          { name: 'Invited by', value: message.author.tag, inline: true },
          { name: 'Playlist', value: playlistName, inline: true },
          { name: 'Invited user', value: userMention, inline: true },
        ])
        .setDescription(`${userMention} has been invited to collaborate on playlist "${playlistName}"`)
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      await message.reply('❌ Failed to send invitation.');
    }
  }
}

export default InviteToPlaylistCommand;
