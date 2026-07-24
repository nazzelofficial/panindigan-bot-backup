import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class PermissionsCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'permissions',
      description: 'Display permissions for a user or role',
      category: 'utility',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['perms'],
      examples: ['/permissions', '/permissions @user', 'p!permissions @role'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const guild = interaction.guild!;
    const user = interaction.options.getUser('user');
    const role = interaction.options.getRole('role');

    let targetName = '';
    let permissions: string[] = [];

    if (user) {
      const member = await guild.members.fetch(user.id);
      targetName = user.username;
      permissions = member.permissions.toArray().map(p => p);
    } else if (role) {
      targetName = role.name;
      permissions = role.permissions.toArray().map(p => p);
    } else {
      const member = interaction.member;
      targetName = interaction.user.username;
      permissions = member.permissions.toArray().map(p => p);
    }

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} 🔑 Permissions: ${targetName}`)
      .setColor(COLORS.info)
      .setDescription(permissions.slice(0, 25).join('\n') || 'No special permissions')
      .addFields([
        { name: 'Total Permissions', value: permissions.length.toString(), inline: true },
      ])
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const guild = message.guild!;
    const args = message.content.split(' ').slice(1);
    
    let targetName = '';
    let permissions: string[] = [];

    if (message.mentions.users.first()) {
      const user = message.mentions.users.first();
      const member = await guild.members.fetch(user.id);
      targetName = user.username;
      permissions = member.permissions.toArray().map(p => p);
    } else if (message.mentions.roles.first()) {
      const role = message.mentions.roles.first();
      targetName = role.name;
      permissions = role.permissions.toArray().map(p => p);
    } else {
      const member = message.member;
      targetName = message.author.username;
      permissions = member.permissions.toArray().map(p => p);
    }

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} 🔑 Permissions: ${targetName}`)
      .setColor(COLORS.info)
      .setDescription(permissions.slice(0, 25).join('\n') || 'No special permissions')
      .addFields([
        { name: 'Total Permissions', value: permissions.length.toString(), inline: true },
      ])
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default PermissionsCommand;
