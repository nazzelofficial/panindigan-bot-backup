// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';

export class PermissionsCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'permissions',
      description: 'Display permissions for a user or role',
      category: 'info',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['perms', 'checkperms'],
      examples: ['/permissions @user', 'p!permissions @user'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const target = interaction.options.getUser('user') || interaction.user;
    const member = interaction.options.getMember('user') || interaction.member;

    if (!member || !('permissions' in member)) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Could not fetch member permissions.')
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed] });
      return;
    }

    const permissions = member.permissions as any;
    const permList = Object.keys(PermissionFlagsBits)
      .filter(key => permissions.has(PermissionFlagsBits[key as keyof typeof PermissionFlagsBits]))
      .map(key => key.replace(/([A-Z])/g, ' $1').trim())
      .join(', ') || 'None';

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} ${target.username}'s Permissions`)
      .setColor(COLORS.info)
      .setDescription(permList.substring(0, 4000))
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const target = message.mentions.users.first() || message.author;
    const member = message.mentions.members?.first() || message.member;

    if (!member || !('permissions' in member)) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Could not fetch member permissions.')
        .setTimestamp();

      await message.reply({ embeds: [errorEmbed] });
      return;
    }

    const permissions = member.permissions as any;
    const permList = Object.keys(PermissionFlagsBits)
      .filter(key => permissions.has(PermissionFlagsBits[key as keyof typeof PermissionFlagsBits]))
      .map(key => key.replace(/([A-Z])/g, ' $1').trim())
      .join(', ') || 'None';

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} ${target.username}'s Permissions`)
      .setColor(COLORS.info)
      .setDescription(permList.substring(0, 4000))
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default PermissionsCommand;
