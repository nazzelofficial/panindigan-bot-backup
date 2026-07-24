import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class SetNicknameCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'setnickname',
      description: 'Change a user\'s nickname in the server',
      category: 'admin',
      cooldown: 3,
      userPermissions: [PermissionFlagsBits.ManageNicknames],
      botPermissions: [PermissionFlagsBits.ManageNicknames],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['nick', 'rename'],
      examples: ['/setnickname @user NewName', 'p!setnickname @user NewName'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const user = interaction.options.getUser('user');
    const nickname = interaction.options.getString('nickname');

    if (!user) {
      await interaction.reply({ content: '❌ Please provide a user.', ephemeral: true });
      return;
    }

    if (!interaction.guild) return;

    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    if (!member) {
      await interaction.reply({ content: '❌ User not found in server.', ephemeral: true });
      return;
    }

    try {
      await member.setNickname(nickname || null, 'Nickname changed by ' + interaction.user.tag);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.success} Nickname Updated`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'User', value: `${user.tag} (${user.id})`, inline: true },
          { name: 'New Nickname', value: nickname || 'Reset to username', inline: true },
          { name: 'Updated by', value: interaction.user.tag, inline: true },
        ])
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ content: '❌ Failed to update nickname. Check role hierarchy.', ephemeral: true });
    }
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const user = message.mentions.users.first();
    const nickname = args.slice(1).join(' ');

    if (!user) {
      await message.reply('❌ Please mention a user.');
      return;
    }

    if (!message.guild) return;

    const member = await message.guild.members.fetch(user.id).catch(() => null);
    if (!member) {
      await message.reply('❌ User not found in server.');
      return;
    }

    try {
      await member.setNickname(nickname || null, 'Nickname changed by ' + message.author.tag);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.success} Nickname Updated`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'User', value: `${user.tag} (${user.id})`, inline: true },
          { name: 'New Nickname', value: nickname || 'Reset to username', inline: true },
          { name: 'Updated by', value: message.author.tag, inline: true },
        ])
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      await message.reply('❌ Failed to update nickname. Check role hierarchy.');
    }
  }
}

export default SetNicknameCommand;
