// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits, RoleFlags } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';

export class CreateRoleCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'createrole',
      description: 'Create a new role in the server',
      category: 'admin',
      cooldown: 5,
      userPermissions: [PermissionFlagsBits.ManageRoles],
      botPermissions: [PermissionFlagsBits.ManageRoles],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['makerole', 'newrole'],
      examples: ['/createrole VIP', 'p!createrole Moderator'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const name = interaction.options.getString('name');
    const color = interaction.options.getString('color');
    const hoist = interaction.options.getBoolean('hoist') || false;
    const mentionable = interaction.options.getBoolean('mentionable') || false;

    if (!name) {
      await interaction.reply({ content: '❌ Please provide a role name.', ephemeral: true });
      return;
    }

    if (!interaction.guild) return;

    try {
      const roleData: any = {
        name,
        hoist,
        mentionable,
      };

      if (color) {
        roleData.color = parseInt(color.replace('#', ''), 16);
      }

      const role = await interaction.guild.roles.create(roleData);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.success} Role Created`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Name', value: role.name, inline: true },
          { name: 'ID', value: role.id, inline: true },
          { name: 'Color', value: role.hexColor, inline: true },
          { name: 'Hoisted', value: hoist ? 'Yes' : 'No', inline: true },
          { name: 'Mentionable', value: mentionable ? 'Yes' : 'No', inline: true },
          { name: 'Created by', value: interaction.user.tag, inline: false },
        ])
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ content: '❌ Failed to create role.', ephemeral: true });
    }
  }

  public async executePrefix(message: Message, _args: string[]): Promise<void> {
    const name = args[0];
    const color = args[1];
    const hoist = _args.includes('--hoist');
    const mentionable = _args.includes('--mentionable');

    if (!name) {
      await message.reply('❌ Please provide a role name.');
      return;
    }

    if (!message.guild) return;

    try {
      const roleData: any = {
        name,
        hoist,
        mentionable,
      };

      if (color) {
        roleData.color = parseInt(color.replace('#', ''), 16);
      }

      const role = await message.guild.roles.create(roleData);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.success} Role Created`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Name', value: role.name, inline: true },
          { name: 'ID', value: role.id, inline: true },
          { name: 'Color', value: role.hexColor, inline: true },
          { name: 'Hoisted', value: hoist ? 'Yes' : 'No', inline: true },
          { name: 'Mentionable', value: mentionable ? 'Yes' : 'No', inline: true },
          { name: 'Created by', value: message.author.tag, inline: false },
        ])
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      await message.reply('❌ Failed to create role.');
    }
  }
}

export default CreateRoleCommand;
