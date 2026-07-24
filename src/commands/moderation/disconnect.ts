import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class DisconnectCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'disconnect',
      description: 'Disconnect a user from their voice channel',
      category: 'moderation',
      cooldown: 3,
      userPermissions: [PermissionFlagsBits.MoveMembers],
      botPermissions: [PermissionFlagsBits.MoveMembers],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['vcdisconnect', 'vckick'],
      examples: ['/disconnect @user', 'p!disconnect @user'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const target = interaction.options.getUser('target');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    if (!target) {
      await interaction.reply({ content: '❌ Please provide a user to disconnect.', ephemeral: true });
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
      await interaction.reply({ content: '❌ I cannot disconnect this user due to role hierarchy.', ephemeral: true });
      return;
    }

    try {
      await member.voice.disconnect(reason);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.moderation} User Disconnected`)
        .setColor(COLORS.warning)
        .addFields([
          { name: 'User', value: `${target.tag} (${target.id})`, inline: true },
          { name: 'Moderator', value: interaction.user.tag, inline: true },
          { name: 'Reason', value: reason, inline: false },
        ])
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ content: '❌ Failed to disconnect user.', ephemeral: true });
    }
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const target = message.mentions.users.first();
    const reason = args.slice(1).join(' ') || 'No reason provided';

    if (!target) {
      await message.reply('❌ Please mention a user to disconnect.');
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
      await message.reply('❌ I cannot disconnect this user due to role hierarchy.');
      return;
    }

    try {
      await member.voice.disconnect(reason);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.moderation} User Disconnected`)
        .setColor(COLORS.warning)
        .addFields([
          { name: 'User', value: `${target.tag} (${target.id})`, inline: true },
          { name: 'Moderator', value: message.author.tag, inline: true },
          { name: 'Reason', value: reason, inline: false },
        ])
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      await message.reply('❌ Failed to disconnect user.');
    }
  }
}

export default DisconnectCommand;
