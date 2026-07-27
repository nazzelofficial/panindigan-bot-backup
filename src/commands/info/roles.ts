// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { Formatter } from '../../utils/Formatter.js';

export class RolesCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'roles',
      description: 'List all roles in the server',
      category: 'info',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['listroles', 'allroles'],
      examples: ['/roles', 'p!roles'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const guild = interaction.guild!;
    const roles = guild.roles.cache
      .sort((a, b) => b.position - a.position)
      .map(role => role.toString())
      .join(', ');

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} Server Roles`)
      .setColor(COLORS.info)
      .setDescription(roles.substring(0, 4000) || 'No roles found')
      .addFields([
        { name: 'Total Roles', value: Formatter.formatNumber(guild.roles.cache.size), inline: true },
      ])
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const guild = message.guild!;
    const roles = guild.roles.cache
      .sort((a, b) => b.position - a.position)
      .map(role => role.toString())
      .join(', ');

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} Server Roles`)
      .setColor(COLORS.info)
      .setDescription(roles.substring(0, 4000) || 'No roles found')
      .addFields([
        { name: 'Total Roles', value: Formatter.formatNumber(guild.roles.cache.size), inline: true },
      ])
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default RolesCommand;
