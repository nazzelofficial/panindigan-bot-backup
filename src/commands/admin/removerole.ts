import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class RemoveRoleCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'removerole',
      description: 'Remove a role from a user',
      category: 'admin',
      cooldown: 3,
      userPermissions: [PermissionFlagsBits.ManageRoles],
      botPermissions: [PermissionFlagsBits.ManageRoles],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['takerole', 'revokerole'],
      examples: ['/removerole @user @role', 'p!removerole @user @role'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const user = interaction.options.getUser('user');
    const role = interaction.options.getRole('role');

    if (!user || !role) {
      await interaction.reply({ content: '❌ Please provide both a user and a role.', ephemeral: true });
      return;
    }

    if (!interaction.guild) return;

    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    if (!member) {
      await interaction.reply({ content: '❌ User not found in server.', ephemeral: true });
      return;
    }

    if (!member.roles.cache.has(role.id)) {
      await interaction.reply({ content: '❌ User does not have this role.', ephemeral: true });
      return;
    }

    try {
      await member.roles.remove(role);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.success} Role Removed`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'User', value: `${user.tag} (${user.id})`, inline: true },
          { name: 'Role', value: role.toString(), inline: true },
          { name: 'Removed by', value: interaction.user.tag, inline: true },
        ])
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ content: '❌ Failed to remove role. Check role hierarchy.', ephemeral: true });
    }
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const user = message.mentions.users.first();
    const role = message.mentions.roles.first();

    if (!user || !role) {
      await message.reply('❌ Please mention both a user and a role.');
      return;
    }

    if (!message.guild) return;

    const member = await message.guild.members.fetch(user.id).catch(() => null);
    if (!member) {
      await message.reply('❌ User not found in server.');
      return;
    }

    if (!member.roles.cache.has(role.id)) {
      await message.reply('❌ User does not have this role.');
      return;
    }

    try {
      await member.roles.remove(role);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.success} Role Removed`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'User', value: `${user.tag} (${user.id})`, inline: true },
          { name: 'Role', value: role.toString(), inline: true },
          { name: 'Removed by', value: message.author.tag, inline: true },
        ])
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      await message.reply('❌ Failed to remove role. Check role hierarchy.');
    }
  }
}

export default RemoveRoleCommand;
