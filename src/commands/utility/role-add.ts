import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class RoleAddCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'role-add',
      description: 'Add a role to a user',
      category: 'utility',
      cooldown: 5,
      userPermissions: [PermissionFlagsBits.ManageRoles],
      botPermissions: [PermissionFlagsBits.ManageRoles],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['addrole'],
      examples: ['/role-add @user @role', 'p!role-add @user @role'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const user = interaction.options.getUser('user');
    const role = interaction.options.getRole('role');
    
    if (!user) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please provide a user.')
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed] });
      return;
    }

    if (!role) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please provide a role.')
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed] });
      return;
    }

    const member = await interaction.guild?.members.fetch(user.id);
    if (!member) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Could not find that member.')
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed] });
      return;
    }

    try {
      await member.roles.add(role);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.success} Role Added`)
        .setColor(COLORS.success)
        .setDescription(`Successfully added ${role} to ${user}!`)
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Could not add role. Make sure I have the required permissions and the role is not higher in hierarchy.')
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed] });
    }
  }

  public async executePrefix(message: Message): Promise<void> {
    const user = message.mentions.users.first();
    const role = message.mentions.roles.first();
    
    if (!user) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please provide a user.')
        .setTimestamp();

      await message.reply({ embeds: [errorEmbed] });
      return;
    }

    if (!role) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please provide a role.')
        .setTimestamp();

      await message.reply({ embeds: [errorEmbed] });
      return;
    }

    const member = await message.guild?.members.fetch(user.id);
    if (!member) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Could not find that member.')
        .setTimestamp();

      await message.reply({ embeds: [errorEmbed] });
      return;
    }

    try {
      await member.roles.add(role);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.success} Role Added`)
        .setColor(COLORS.success)
        .setDescription(`Successfully added ${role} to ${user}!`)
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Could not add role. Make sure I have the required permissions and the role is not higher in hierarchy.')
        .setTimestamp();

      await message.reply({ embeds: [errorEmbed] });
    }
  }
}

export default RoleAddCommand;
