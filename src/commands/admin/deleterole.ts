import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class DeleteRoleCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'deleterole',
      description: 'Delete a role from the server',
      category: 'admin',
      cooldown: 5,
      userPermissions: [PermissionFlagsBits.ManageRoles],
      botPermissions: [PermissionFlagsBits.ManageRoles],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['removerole', 'delrole'],
      examples: ['/deleterole @role', 'p!deleterole @role'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const role = interaction.options.getRole('role');

    if (!role) {
      await interaction.reply({ content: '❌ Please provide a role to delete.', ephemeral: true });
      return;
    }

    if (role.name === '@everyone') {
      await interaction.reply({ content: '❌ Cannot delete the @everyone role.', ephemeral: true });
      return;
    }

    if (!interaction.guild) return;

    try {
      await role.delete('Deleted by ' + interaction.user.tag);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.success} Role Deleted`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Role', value: role.name, inline: true },
          { name: 'ID', value: role.id, inline: true },
          { name: 'Deleted by', value: interaction.user.tag, inline: true },
        ])
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ content: '❌ Failed to delete role. Check role hierarchy.', ephemeral: true });
    }
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const role = message.mentions.roles.first();

    if (!role) {
      await message.reply('❌ Please mention a role to delete.');
      return;
    }

    if (role.name === '@everyone') {
      await message.reply('❌ Cannot delete the @everyone role.');
      return;
    }

    if (!message.guild) return;

    try {
      await role.delete('Deleted by ' + message.author.tag);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.success} Role Deleted`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Role', value: role.name, inline: true },
          { name: 'ID', value: role.id, inline: true },
          { name: 'Deleted by', value: message.author.tag, inline: true },
        ])
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      await message.reply('❌ Failed to delete role. Check role hierarchy.');
    }
  }
}

export default DeleteRoleCommand;
