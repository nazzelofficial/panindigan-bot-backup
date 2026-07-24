import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';
import { Formatter } from '../../utils/Formatter';

export class RoleInfoCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'roleinfo',
      description: 'Display information about a role',
      category: 'utility',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['role'],
      examples: ['/roleinfo @role', 'p!roleinfo @role'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const role = interaction.options.getRole('role');
    if (!role) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please provide a role.')
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed] });
      return;
    }

    const createdAt = role.createdAt.toLocaleString();
    const members = role.members.size;
    const color = role.hexColor;
    const hoist = role.hoist ? 'Yes' : 'No';
    const mentionable = role.mentionable ? 'Yes' : 'No';
    const position = role.position;

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} ${role.name} Information`)
      .setColor(COLORS.info)
      .addFields([
        { name: 'Name', value: role.name, inline: true },
        { name: 'ID', value: role.id, inline: true },
        { name: 'Color', value: color || 'Default', inline: true },
        { name: 'Members', value: Formatter.formatNumber(members), inline: true },
        { name: 'Position', value: position.toString(), inline: true },
        { name: 'Hoist', value: hoist, inline: true },
        { name: 'Mentionable', value: mentionable, inline: true },
        { name: 'Created', value: createdAt, inline: false },
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

    const createdAt = role.createdAt.toLocaleString();
    const members = role.members.size;
    const color = role.hexColor;
    const hoist = role.hoist ? 'Yes' : 'No';
    const mentionable = role.mentionable ? 'Yes' : 'No';
    const position = role.position;

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} ${role.name} Information`)
      .setColor(COLORS.info)
      .addFields([
        { name: 'Name', value: role.name, inline: true },
        { name: 'ID', value: role.id, inline: true },
        { name: 'Color', value: color || 'Default', inline: true },
        { name: 'Members', value: Formatter.formatNumber(members), inline: true },
        { name: 'Position', value: position.toString(), inline: true },
        { name: 'Hoist', value: hoist, inline: true },
        { name: 'Mentionable', value: mentionable, inline: true },
        { name: 'Created', value: createdAt, inline: false },
      ])
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default RoleInfoCommand;
