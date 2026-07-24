import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, Role } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';
import { Formatter } from '../../utils/Formatter';

export class RoleInfoCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'roleinfo',
      description: 'Display detailed information about a role',
      category: 'info',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['ri', 'role'],
      examples: ['/roleinfo @role', 'p!roleinfo @role'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const role = interaction.options.getRole('role') as Role;
    if (!role) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please provide a role.')
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed] });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} Role Information`)
      .setColor(role.color || COLORS.info)
      .addFields([
        { name: 'Name', value: role.name, inline: true },
        { name: 'ID', value: role.id, inline: true },
        { name: 'Color', value: role.hexColor || 'None', inline: true },
        { name: 'Position', value: role.position.toString(), inline: true },
        { name: 'Members', value: Formatter.formatNumber(role.members.size), inline: true },
        { name: 'Mentionable', value: role.mentionable ? 'Yes' : 'No', inline: true },
        { name: 'Hoisted', value: role.hoist ? 'Yes' : 'No', inline: true },
        { name: 'Created', value: Formatter.formatDate(role.createdAt), inline: true },
      ])
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const role = message.mentions.roles.first();
    if (!role) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please provide a role.')
        .setTimestamp();

      await message.reply({ embeds: [errorEmbed] });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} Role Information`)
      .setColor(role.color || COLORS.info)
      .addFields([
        { name: 'Name', value: role.name, inline: true },
        { name: 'ID', value: role.id, inline: true },
        { name: 'Color', value: role.hexColor || 'None', inline: true },
        { name: 'Position', value: role.position.toString(), inline: true },
        { name: 'Members', value: Formatter.formatNumber(role.members.size), inline: true },
        { name: 'Mentionable', value: role.mentionable ? 'Yes' : 'No', inline: true },
        { name: 'Hoisted', value: role.hoist ? 'Yes' : 'No', inline: true },
        { name: 'Created', value: Formatter.formatDate(role.createdAt), inline: true },
      ])
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default RoleInfoCommand;
