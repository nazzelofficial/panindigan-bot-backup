import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits, RoleCreateOptions } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class CreateRoleCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'create-role',
      description: 'Create a new role',
      category: 'utility',
      cooldown: 5,
      userPermissions: [PermissionFlagsBits.ManageRoles],
      botPermissions: [PermissionFlagsBits.ManageRoles],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['createrole'],
      examples: ['/create-role VIP', '/create-role Moderator #FF0000', 'p!create-role VIP'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const name = interaction.options.getString('name');
    const color = interaction.options.getString('color');
    
    if (!name) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please provide a name for the role.')
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed] });
      return;
    }

    try {
      const roleOptions: RoleCreateOptions = {
        name,
      };

      if (color) {
        roleOptions.color = color;
      }

      const role = await interaction.guild?.roles.create(roleOptions);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.success} Role Created`)
        .setColor(COLORS.success)
        .setDescription(`Successfully created role ${role}!`)
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Could not create role. Make sure I have the required permissions.')
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed] });
    }
  }

  public async executePrefix(message: Message): Promise<void> {
    const args = message.content.split(' ').slice(1);
    const name = args[0];
    const color = args[1];

    if (!name) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please provide a name for the role.')
        .setTimestamp();

      await message.reply({ embeds: [errorEmbed] });
      return;
    }

    try {
      const roleOptions: RoleCreateOptions = {
        name,
      };

      if (color) {
        roleOptions.color = color;
      }

      const role = await message.guild?.roles.create(roleOptions);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.success} Role Created`)
        .setColor(COLORS.success)
        .setDescription(`Successfully created role ${role}!`)
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Could not create role. Make sure I have the required permissions.')
        .setTimestamp();

      await message.reply({ embeds: [errorEmbed] });
    }
  }
}

export default CreateRoleCommand;
