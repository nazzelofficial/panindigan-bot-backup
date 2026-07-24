import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';
import { Formatter } from '../../utils/Formatter';

export class RoleInfoCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'roleinfo',
      description: 'View information about a role',
      category: 'moderation',
      cooldown: 3,
      userPermissions: [PermissionFlagsBits.ManageRoles],
      botPermissions: [PermissionFlagsBits.ManageRoles],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['role', 'rinfo'],
      examples: ['/roleinfo @role', 'p!roleinfo @role'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const role = interaction.options.getRole('target');

    if (!role) {
      await interaction.reply({ content: '❌ Please provide a role.', ephemeral: true });
      return;
    }

    if (!interaction.guild) return;

    const memberCount = role.members.size;
    const position = role.position;
    const hoist = role.hoist ? 'Yes' : 'No';
    const mentionable = role.mentionable ? 'Yes' : 'No';
    const managed = role.managed ? 'Yes' : 'No';
    const color = role.hexColor || 'Default';
    const created = Formatter.formatDate(role.createdAt);

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} Role Information`)
      .setColor(role.color || COLORS.info)
      .addFields([
        { name: 'Name', value: role.name, inline: true },
        { name: 'ID', value: role.id, inline: true },
        { name: 'Members', value: Formatter.formatNumber(memberCount), inline: true },
        { name: 'Position', value: position.toString(), inline: true },
        { name: 'Hoist', value: hoist, inline: true },
        { name: 'Mentionable', value: mentionable, inline: true },
        { name: 'Managed', value: managed, inline: true },
        { name: 'Color', value: color, inline: true },
        { name: 'Created', value: created, inline: false },
      ])
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const role = message.mentions.roles.first() || message.guild?.roles.cache.get(args[0]);

    if (!role) {
      await message.reply('❌ Please mention a role or provide a role ID.');
      return;
    }

    if (!message.guild) return;

    const memberCount = role.members.size;
    const position = role.position;
    const hoist = role.hoist ? 'Yes' : 'No';
    const mentionable = role.mentionable ? 'Yes' : 'No';
    const managed = role.managed ? 'Yes' : 'No';
    const color = role.hexColor || 'Default';
    const created = Formatter.formatDate(role.createdAt);

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} Role Information`)
      .setColor(role.color || COLORS.info)
      .addFields([
        { name: 'Name', value: role.name, inline: true },
        { name: 'ID', value: role.id, inline: true },
        { name: 'Members', value: Formatter.formatNumber(memberCount), inline: true },
        { name: 'Position', value: position.toString(), inline: true },
        { name: 'Hoist', value: hoist, inline: true },
        { name: 'Mentionable', value: mentionable, inline: true },
        { name: 'Managed', value: managed, inline: true },
        { name: 'Color', value: color, inline: true },
        { name: 'Created', value: created, inline: false },
      ])
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default RoleInfoCommand;
